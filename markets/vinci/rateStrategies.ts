import BigNumber from 'bignumber.js';
import { oneRay } from '../../helpers/constants';
import { IInterestRateStrategyParams } from '../../helpers/types';

// BUSD SUSD
export const rateStrategyStableOne: IInterestRateStrategyParams = {
  name: "rateStrategyStableOne",
  optimalUtilizationRate: new BigNumber(0.8).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.04).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: '0',
  stableRateSlope2: '0',
};

// DAI TUSD
export const rateStrategyStableTwo: IInterestRateStrategyParams = {
  name: "rateStrategyStableTwo",
  optimalUtilizationRate: new BigNumber(0.8).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.04).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(0.75).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: new BigNumber(0.02).multipliedBy(oneRay).toFixed(),
  stableRateSlope2: new BigNumber(0.75).multipliedBy(oneRay).toFixed(),
}

// USDC USDT
export const rateStrategyStableThree: IInterestRateStrategyParams = {
  name: "rateStrategyStableThree",
  optimalUtilizationRate: new BigNumber(0.9).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.04).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(0.60).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: new BigNumber(0.02).multipliedBy(oneRay).toFixed(),
  stableRateSlope2: new BigNumber(0.60).multipliedBy(oneRay).toFixed(),
}

// CRYPTOPANDA
export const rateStrategyCRYPTOPANDA: IInterestRateStrategyParams = {
  name: "rateStrategyCRYPTOPANDA",
  optimalUtilizationRate: new BigNumber(0.8).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.04).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(0.75).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: new BigNumber(0.02).multipliedBy(oneRay).toFixed(),
  stableRateSlope2: new BigNumber(0.75).multipliedBy(oneRay).toFixed(),
}

// ETH
export const rateStrategyETH: IInterestRateStrategyParams = {
  name: "rateStrategyETH",
  optimalUtilizationRate: new BigNumber(0.65).multipliedBy(oneRay).toFixed(),
  baseVariableBorrowRate: new BigNumber(0).multipliedBy(oneRay).toFixed(),
  variableRateSlope1: new BigNumber(0.08).multipliedBy(oneRay).toFixed(),
  variableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
  stableRateSlope1: new BigNumber(0.1).multipliedBy(oneRay).toFixed(),
  stableRateSlope2: new BigNumber(1).multipliedBy(oneRay).toFixed(),
}