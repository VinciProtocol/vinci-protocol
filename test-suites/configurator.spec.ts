import { TestEnv, makeSuite } from './helpers/make-suite';
import { APPROVAL_AMOUNT_LENDING_POOL, RAY } from '../helpers/constants';
import { convertToCurrencyDecimals } from '../helpers/contracts-helpers';
import { ProtocolErrors } from '../helpers/types';
import { strategyDAI } from '../markets/vinci/reservesConfigs';

const { expect } = require('chai');

makeSuite('LendingPoolConfigurator', (testEnv: TestEnv) => {
  const {
    CALLER_NOT_POOL_ADMIN,
    LPC_RESERVE_LIQUIDITY_NOT_0,
    RC_INVALID_LTV,
    RC_INVALID_LIQ_THRESHOLD,
    RC_INVALID_LIQ_BONUS,
    RC_INVALID_DECIMALS,
    RC_INVALID_RESERVE_FACTOR,
  } = ProtocolErrors;

  it('Reverts trying to set an invalid reserve factor', async () => {
    const { configurator, dai } = testEnv;

    const invalidReserveFactor = 65536;

    await expect(
      configurator.setReserveFactor(dai.address, invalidReserveFactor)
    ).to.be.revertedWith(RC_INVALID_RESERVE_FACTOR);
  });

  it('Deactivates the DAI reserve', async () => {
    const { configurator, dai, helpersContract } = testEnv;
    await configurator.deactivateReserve(dai.address);
    const { isActive } = await helpersContract.getReserveConfigurationData(dai.address);
    expect(isActive).to.be.equal(false);
  });

  it('Rectivates the DAI reserve', async () => {
    const { configurator, dai, helpersContract } = testEnv;
    await configurator.activateReserve(dai.address);

    const { isActive } = await helpersContract.getReserveConfigurationData(dai.address);
    expect(isActive).to.be.equal(true);
  });

  it('Check the onlyAaveAdmin on deactivateReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).deactivateReserve(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on activateReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).activateReserve(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Freezes the DAI reserve', async () => {
    const { configurator, dai, helpersContract } = testEnv;

    await configurator.freezeReserve(dai.address);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(true);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Unfreezes the DAI reserve', async () => {
    const { configurator, helpersContract, dai } = testEnv;
    await configurator.unfreezeReserve(dai.address);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Check the onlyAaveAdmin on freezeReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).freezeReserve(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on unfreezeReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).unfreezeReserve(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Deactivates the DAI reserve for borrowing', async () => {
    const { configurator, helpersContract, dai } = testEnv;
    await configurator.disableBorrowingOnReserve(dai.address);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(false);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Activates the DAI reserve for borrowing', async () => {
    const { configurator, dai, helpersContract } = testEnv;
    await configurator.enableBorrowingOnReserve(dai.address, false);
    const { variableBorrowIndex } = await helpersContract.getReserveData(dai.address);

    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);

    expect(variableBorrowIndex.toString()).to.be.equal(RAY);
  });

  it('Check the onlyAaveAdmin on disableBorrowingOnReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).disableBorrowingOnReserve(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on enableBorrowingOnReserve ', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).enableBorrowingOnReserve(dai.address, true),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Enables stable borrow rate on the DAI reserve', async () => {
    const { configurator, helpersContract, dai } = testEnv;
    await configurator.enableReserveStableRate(dai.address);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(true);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Disable stable borrow rate on the DAI reserve', async () => {
    const { configurator, helpersContract, dai } = testEnv;
    await configurator.disableReserveStableRate(dai.address);
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(false);
    expect(reserveFactor).to.be.equal(strategyDAI.reserveFactor);
  });

  it('Check the onlyAaveAdmin on disableReserveStableRate', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).disableReserveStableRate(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Check the onlyAaveAdmin on enableReserveStableRate', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).enableReserveStableRate(dai.address),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Changes the reserve factor of DAI', async () => {
    const { configurator, helpersContract, dai } = testEnv;
    await configurator.setReserveFactor(dai.address, '1000');
    const {
      decimals,
      ltv,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
      isActive,
      isFrozen,
    } = await helpersContract.getReserveConfigurationData(dai.address);
    const expected = {
      borrowingEnabled: true,
      isActive: true,
      isFrozen: false,
      decimals: strategyDAI.reserveDecimals,
      ltv: strategyDAI.baseLTVAsCollateral,
      liquidationThreshold: strategyDAI.liquidationThreshold,
      liquidationBonus: strategyDAI.liquidationBonus,
      stableBorrowRateEnabled: strategyDAI.stableBorrowRateEnabled,
      reserveFactor: 1000,
    };
    console.log(`expected ${JSON.stringify(expected, null, 4)}`);
    const result = {
      borrowingEnabled: borrowingEnabled,
      isActive: isActive,
      isFrozen: isFrozen,
      decimals: decimals,
      ltv: ltv,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      stableBorrowRateEnabled: stableBorrowRateEnabled,
      reserveFactor: reserveFactor,
    };
    console.log(`result: ${JSON.stringify(result, null, 4)}`);

    expect(borrowingEnabled).to.be.equal(true);
    expect(isActive).to.be.equal(true);
    expect(isFrozen).to.be.equal(false);
    expect(decimals).to.be.equal(strategyDAI.reserveDecimals);
    expect(ltv).to.be.equal(strategyDAI.baseLTVAsCollateral);
    expect(liquidationThreshold).to.be.equal(strategyDAI.liquidationThreshold);
    expect(liquidationBonus).to.be.equal(strategyDAI.liquidationBonus);
    expect(stableBorrowRateEnabled).to.be.equal(strategyDAI.stableBorrowRateEnabled);
    expect(reserveFactor).to.be.equal(1000);
  });

  it('Check the onlyLendingPoolManager on setReserveFactor', async () => {
    const { configurator, users, dai } = testEnv;
    await expect(
      configurator.connect(users[2].signer).setReserveFactor(dai.address, '2000'),
      CALLER_NOT_POOL_ADMIN
    ).to.be.revertedWith(CALLER_NOT_POOL_ADMIN);
  });

  it('Reverts when trying to disable the DAI reserve with liquidity on it', async () => {
    const { dai, pool, configurator } = testEnv;
    const userAddress = await pool.signer.getAddress();
    await dai.mint(await convertToCurrencyDecimals(dai.address, '1000'));

    //approve protocol to access depositor wallet
    await dai.approve(pool.address, APPROVAL_AMOUNT_LENDING_POOL);
    const amountDAItoDeposit = await convertToCurrencyDecimals(dai.address, '1000');

    //user 1 deposits 1000 DAI
    await pool.deposit(dai.address, amountDAItoDeposit, userAddress, '0');

    await expect(
      configurator.deactivateReserve(dai.address),
      LPC_RESERVE_LIQUIDITY_NOT_0
    ).to.be.revertedWith(LPC_RESERVE_LIQUIDITY_NOT_0);
  });
});
