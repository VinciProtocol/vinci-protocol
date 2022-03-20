import BigNumber from 'bignumber.js';

export interface UserReserveData {
  scaledVTokenBalance: BigNumber;
  currentVTokenBalance: BigNumber;
  currentStableDebt: BigNumber;
  currentVariableDebt: BigNumber;
  principalStableDebt: BigNumber;
  scaledVariableDebt: BigNumber;
  liquidityRate: BigNumber;
  stableBorrowRate: BigNumber;
  stableRateLastUpdated: BigNumber;
  usageAsCollateralEnabled: Boolean;
  walletBalance: BigNumber;
  [key: string]: BigNumber | string | Boolean;
}

export interface ReserveData {
  address: string;
  symbol: string;
  decimals: BigNumber;
  totalLiquidity: BigNumber;
  availableLiquidity: BigNumber;
  totalStableDebt: BigNumber;
  totalVariableDebt: BigNumber;
  principalStableDebt: BigNumber;
  scaledVariableDebt: BigNumber;
  averageStableBorrowRate: BigNumber;
  variableBorrowRate: BigNumber;
  stableBorrowRate: BigNumber;
  utilizationRate: BigNumber;
  liquidityIndex: BigNumber;
  variableBorrowIndex: BigNumber;
  vTokenAddress: string;
  marketStableRate: BigNumber;
  lastUpdateTimestamp: BigNumber;
  totalStableDebtLastUpdated: BigNumber;
  liquidityRate: BigNumber;
  [key: string]: BigNumber | string;
}

export interface UserNFTVaultData {
  currentNTokenBalance: BigNumber;
  tokenIds: BigNumber[];
  amounts: BigNumber[];
  usageAsCollateralEnabled: Boolean;
  walletBalance: BigNumber;
}
