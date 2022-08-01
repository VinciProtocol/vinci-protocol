import { makeSuite, TestEnv } from './helpers/make-suite';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { convertToCurrencyDecimals } from '../helpers/contracts-helpers';
import { APPROVAL_AMOUNT_LENDING_POOL } from '../helpers/constants';
import { ConfigNames } from '../helpers/configuration';
import { CommonsConfig } from '../markets/vinci/commons';
import { RateMode, INFTVaultParams } from '../helpers/types';
import {
    NFTFlashLoanReceiverBase__factory,
    NTokenForUpgradeTest__factory
} from '../types';
import {
  updateNToken,
} from '../helpers/init-helpers';


makeSuite("NToken: Upgrade", (testEnv: TestEnv) => {
    const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;

    before(async () => {
        // uses 1:  deposit 1 BAYC ,deposit 1 DAI, borrow 0.1 DAI 
        const { users, pool, nft, dai } = testEnv;
        const signer = users[1].signer;
        const address = users[1].address;

        // mint bayc
        await nft.connect(signer).publicMint(address, '1');
        await nft.connect(signer).approve(pool.address, '1');

        // mint dai
        await dai.connect(signer).mint(await convertToCurrencyDecimals(dai.address, '1'));
        await dai.connect(signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

        // deposit bayc
        await pool.connect(signer).depositNFT(nft.address, ['1'], ['1'], address, '0');

        // deposit dai
        await pool.connect(signer).deposit(dai.address, ethers.utils.parseEther('1.0'), address, '0');
        
        // borrow dai
        await pool.connect(signer).borrow(
            dai.address,
            ethers.utils.parseEther('0.1'),
            RateMode.Variable,
            AAVE_REFERRAL,
            address
        );
    });

    it('updateNToken', async () => {
        const { users, nNFT, nft, deployer } = testEnv;
        const address = users[1].address;

        await expect(
            (await nNFT.NTOKEN_REVISION()).toNumber()
        ).to.be.eq(3);
        await expect(
            (await nNFT.balanceOf(address)).toNumber()
        ).to.be.eq(1);

        // deploy new ntoken
        const newNtokenImpl = await new NTokenForUpgradeTest__factory(deployer.signer).deploy();

        const mockGetNTokenImpl = async (params: INFTVaultParams,) => {
            return newNtokenImpl;
        };

        // update ntoken
        await updateNToken(
            { ['BAYC']: nft.address },
            mockGetNTokenImpl,
            ConfigNames.Vinci,
        );

        // check new version
        const newNFTProxy = await NTokenForUpgradeTest__factory.connect(nNFT.address, deployer.signer);

        await expect(
            (await newNFTProxy.NTOKEN_REVISION()).toNumber()
        ).to.be.eq(
            (await newNtokenImpl.NTOKEN_REVISION()).toNumber()
        );
        await expect(
            (await newNFTProxy.balanceOf(address)).toNumber()
        ).to.be.eq(1);
    });

});