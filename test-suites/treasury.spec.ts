import { DRE } from '../helpers/misc-utils';
import { makeSuite, TestEnv } from './helpers/make-suite';
import { convertToCurrencyDecimals } from '../helpers/contracts-helpers';
import { APPROVAL_AMOUNT_LENDING_POOL, MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../helpers/constants';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { RateMode, ProtocolErrors } from '../helpers/types';
import { CommonsConfig } from '../markets/vinci/commons';
import BigNumber from 'bignumber.js';
import './helpers/utils/math';
import {WAD, RAY} from '../helpers/constants';

const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;

makeSuite("Treasury - Receiving the fees on VToken", (testEnv: TestEnv) => {
    before (async() => {
        const { users, pool, nft, dai, nNFT, helpersContract } = testEnv;

        await nft.connect(users[1].signer).publicMint(users[1].address, '1');

        await nft.connect(users[1].signer).approve(pool.address, '1');

        await pool
        .connect(users[1].signer)
        .depositNFT(nft.address, ['1'], ['1'], users[1].address, '0');

        await dai.connect(users[0].signer).mint(await convertToCurrencyDecimals(dai.address, '1'));

        await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

        await pool
        .connect(users[0].signer)
        .deposit(dai.address, ethers.utils.parseEther('1.0'), users[0].address, '0');
        await pool
        .connect(users[1].signer)
        .borrow(
            dai.address,
            ethers.utils.parseEther('0.1'),
            RateMode.Variable,
            AAVE_REFERRAL,
            users[1].address
        );
        }
        );

    it('Should receive fees after 1 year', async () => {
        await DRE.network.provider.send("evm_increaseTime", [3600*24*365]);
        const {users, pool, dai, treasury, aDai, helpersContract } = testEnv;
        await pool
        .connect(users[1].signer)
        .borrow(
            dai.address,
            ethers.utils.parseEther('0.1'),
            RateMode.Variable,
            AAVE_REFERRAL,
            users[1].address
        );
        const {totalVariableDebt, variableBorrowIndex} = await helpersContract.getReserveData(dai.address);
        const balance = new BigNumber((await aDai.balanceOf(treasury.address)).toString());
        const debt = new BigNumber(WAD).div(10).multipliedBy(2);
        const interest = new BigNumber(totalVariableDebt.toString())
        .minus(debt).percentMul(new BigNumber(1000));
        expect(balance.toString()).to.be.equal(
            interest.toString(),
            'the balance in treasure should be the interest multiplied by reserveFactor.'
        );
    });
});