import { LendingPool } from '../../../types/LendingPool';
import { ReserveData, UserReserveData, UserNFTVaultData } from './interfaces';
import {
  getLendingRateOracle,
  getIErc20Detailed,
  getMintableERC20,
  getVToken,
  //getStableDebtToken,
  getVariableDebtToken,
  getMockERC721Token,
} from '../../../helpers/contracts-getters';
import { tEthereumAddress } from '../../../helpers/types';
import BigNumber from 'bignumber.js';
import { getDb, DRE } from '../../../helpers/misc-utils';
import { AaveProtocolDataProvider } from '../../../types/AaveProtocolDataProvider';
import {VinciConfig} from '../../../markets/vinci';
export const getReserveData = async (
  helper: AaveProtocolDataProvider,
  reserve: tEthereumAddress
): Promise<ReserveData> => {
  const [reserveData, tokenAddresses, rateOracle, token] = await Promise.all([
    helper.getReserveData(reserve),
    helper.getReserveTokensAddresses(reserve),
    getLendingRateOracle(),
    getIErc20Detailed(reserve),
  ]);
  const marketId = VinciConfig.MarketId

  //const stableDebtToken = await getStableDebtToken(marketId, tokenAddresses.stableDebtTokenAddress);
  const variableDebtToken = await getVariableDebtToken(tokenAddresses.variableDebtTokenAddress);

  const principalStableDebt = '0';
  //const { 0: principalStableDebt } = await stableDebtToken.getSupplyData();
  const totalStableDebtLastUpdated = '0'; //await stableDebtToken.getTotalSupplyLastUpdated();

  const scaledVariableDebt = await variableDebtToken.scaledTotalSupply();

  const rate = (await rateOracle.getMarketBorrowRate(reserve)).toString();
  const symbol = await token.symbol();
  const decimals = new BigNumber(await token.decimals());

  const totalLiquidity = new BigNumber(reserveData.availableLiquidity.toString())
    .plus(reserveData.totalStableDebt.toString())
    .plus(reserveData.totalVariableDebt.toString());

  const utilizationRate = new BigNumber(
    totalLiquidity.eq(0)
      ? 0
      : new BigNumber(reserveData.totalStableDebt.toString())
          .plus(reserveData.totalVariableDebt.toString())
          .rayDiv(totalLiquidity)
  );

  return {
    totalLiquidity,
    utilizationRate,
    availableLiquidity: new BigNumber(reserveData.availableLiquidity.toString()),
    totalStableDebt: new BigNumber(reserveData.totalStableDebt.toString()),
    totalVariableDebt: new BigNumber(reserveData.totalVariableDebt.toString()),
    liquidityRate: new BigNumber(reserveData.liquidityRate.toString()),
    variableBorrowRate: new BigNumber(reserveData.variableBorrowRate.toString()),
    stableBorrowRate: new BigNumber(reserveData.stableBorrowRate.toString()),
    averageStableBorrowRate: new BigNumber(reserveData.averageStableBorrowRate.toString()),
    liquidityIndex: new BigNumber(reserveData.liquidityIndex.toString()),
    variableBorrowIndex: new BigNumber(reserveData.variableBorrowIndex.toString()),
    lastUpdateTimestamp: new BigNumber(reserveData.lastUpdateTimestamp),
    totalStableDebtLastUpdated: new BigNumber(totalStableDebtLastUpdated),
    principalStableDebt: new BigNumber(principalStableDebt.toString()),
    scaledVariableDebt: new BigNumber(scaledVariableDebt.toString()),
    address: reserve,
    vTokenAddress: tokenAddresses.vTokenAddress,
    symbol,
    decimals,
    marketStableRate: new BigNumber(rate),
  };
};

export const getUserData = async (
  pool: LendingPool,
  helper: AaveProtocolDataProvider,
  reserve: string,
  user: tEthereumAddress,
  sender?: tEthereumAddress
): Promise<UserReserveData> => {
  const [userData, scaledVTokenBalance] = await Promise.all([
    helper.getUserReserveData(reserve, user),
    getVTokenUserData(reserve, user, helper),
  ]);

  const token = await getMintableERC20(reserve);
  const walletBalance = new BigNumber((await token.balanceOf(sender || user)).toString());

  return {
    scaledVTokenBalance: new BigNumber(scaledVTokenBalance),
    currentVTokenBalance: new BigNumber(userData.currentVTokenBalance.toString()),
    currentStableDebt: new BigNumber(userData.currentStableDebt.toString()),
    currentVariableDebt: new BigNumber(userData.currentVariableDebt.toString()),
    principalStableDebt: new BigNumber(userData.principalStableDebt.toString()),
    scaledVariableDebt: new BigNumber(userData.scaledVariableDebt.toString()),
    stableBorrowRate: new BigNumber(userData.stableBorrowRate.toString()),
    liquidityRate: new BigNumber(userData.liquidityRate.toString()),
    usageAsCollateralEnabled: userData.usageAsCollateralEnabled,
    stableRateLastUpdated: new BigNumber(userData.stableRateLastUpdated.toString()),
    walletBalance,
  };
};

export const getUserNFTVaultData = async (
  pool: LendingPool,
  helper: AaveProtocolDataProvider,
  nftVault: string,
  user: tEthereumAddress,
  sender?: tEthereumAddress
): Promise<UserNFTVaultData> => {
  const userData = await helper.getUserNFTVaultData(nftVault, user);

  const token = await getMockERC721Token(nftVault);
  const walletBalance = new BigNumber((await token.balanceOf(sender || user)).toString());

  return {
    currentNTokenBalance: new BigNumber(userData.currentNTokenBalance.toString()),
    tokenIds: userData.tokenIds.map(function (val, _) { return new BigNumber(val.toString());}),
    amounts: userData.amounts.map(function (val, _) { return new BigNumber(val.toString());}),
    usageAsCollateralEnabled: userData.usageAsCollateralEnabled,
    walletBalance: walletBalance,
  };
};

export const getReserveAddressFromSymbol = async (symbol: string) => {
  const token = await getMintableERC20(
    (await getDb().get(`${symbol}.${DRE.network.name}`).value()).address
  );

  if (!token) {
    throw `Could not find instance for contract ${symbol}`;
  }
  return token.address;
};

const getVTokenUserData = async (
  reserve: string,
  user: string,
  helpersContract: AaveProtocolDataProvider
) => {
  const vTokenAddress: string = (await helpersContract.getReserveTokensAddresses(reserve))
    .vTokenAddress;

  const vToken = await getVToken(vTokenAddress);

  const scaledBalance = await vToken.scaledBalanceOf(user);
  return scaledBalance.toString();
};
