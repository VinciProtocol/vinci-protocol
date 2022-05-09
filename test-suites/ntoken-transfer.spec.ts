import { APPROVAL_AMOUNT_LENDING_POOL, MAX_UINT_AMOUNT, ZERO_ADDRESS } from '../helpers/constants';
import { convertToCurrencyDecimals } from '../helpers/contracts-helpers';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { RateMode, ProtocolErrors } from '../helpers/types';
import { makeSuite, TestEnv } from './helpers/make-suite';
import { CommonsConfig } from '../markets/vinci/commons';

const AAVE_REFERRAL = CommonsConfig.ProtocolGlobalParams.AaveReferral;

makeSuite('NToken: Transfer', (testEnv: TestEnv) => {
  const {
    INVALID_FROM_BALANCE_AFTER_TRANSFER,
    INVALID_TO_BALANCE_AFTER_TRANSFER,
    VL_TRANSFER_NOT_ALLOWED,
  } = ProtocolErrors;

  it('User 0 deposits 1 CRYPTOPANDA, transfers to user 1', async () => {
    const { users, pool, nft, nNFT, helpersContract } = testEnv;

    await nft.connect(users[0].signer).publicMint(users[0].address, '1');

    await nft.connect(users[0].signer).approve(pool.address, '1');

    await pool
      .connect(users[0].signer)
      .depositNFT(nft.address, ['1'], ['1'], users[0].address, '0');

    await nNFT.connect(users[0].signer)['safeTransferFrom(address,address,uint256)'](users[0].address, users[1].address, '1');

    const name = await nNFT.name();

    expect(name).to.be.equal('Vinci interest bearing CRYPTOPANDA');

    const fromBalance = await nNFT['balanceOf(address)'](users[0].address);
    const toBalance = await nNFT['balanceOf(address)'](users[1].address);

    expect(fromBalance.toString()).to.be.equal('0', INVALID_FROM_BALANCE_AFTER_TRANSFER);
    expect(toBalance.toString()).to.be.equal(
      '1',
      INVALID_TO_BALANCE_AFTER_TRANSFER
    );
  });

  it('User 0 deposits 1 DAI and user 1 tries to borrow the DAI with the received CRYPTOPANDA as collateral', async () => {
    const { users, pool, dai, helpersContract } = testEnv;
    const userAddress = await pool.signer.getAddress();

    await dai.connect(users[0].signer).mint(await convertToCurrencyDecimals(dai.address, '1'));

    await dai.connect(users[0].signer).approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);

    await pool
      .connect(users[0].signer)
      .deposit(dai.address, ethers.utils.parseEther('1.0'), userAddress, '0');
    await pool
      .connect(users[1].signer)
      .borrow(
        dai.address,
        ethers.utils.parseEther('0.1'),
        RateMode.Variable,
        AAVE_REFERRAL,
        users[1].address
      );

    const userReserveData = await helpersContract.getUserReserveData(
      dai.address,
      users[1].address
    );

    expect(userReserveData.currentVariableDebt.toString()).to.be.eq(ethers.utils.parseEther('0.1'));
  });

  it('User 1 tries to transfer all the CRYPTOPANDA used as collateral back to user 0 (revert expected)', async () => {
    const { users, nNFT } = testEnv;
    await expect(
      nNFT.connect(users[1].signer)['safeTransferFrom(address,address,uint256)'](users[1].address, users[0].address, '1'),
      VL_TRANSFER_NOT_ALLOWED
    ).to.be.revertedWith(VL_TRANSFER_NOT_ALLOWED);
  });

  it('User 1 deposite another CRYPTOPANDA and tries to transfer the first CRYPTOPANDA used as collateral back to user 0', async () => {
    const { users, pool, nNFT, nft } = testEnv;

    await nft.connect(users[1].signer).publicMint(users[1].address, '2');

    await nft.connect(users[1].signer).approve(pool.address, '2');

    await pool
      .connect(users[1].signer)
      .depositNFT(nft.address, ['2'], ['1'], users[1].address, '0');

    await nNFT.connect(users[1].signer)['safeTransferFrom(address,address,uint256)'](users[1].address, users[0].address, '1');

    const user0Balance = await nNFT['balanceOf(address)'](users[0].address);

    expect(user0Balance.toString()).to.be.eq('1');
  });
});
