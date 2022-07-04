import {
  tEthereumAddress,
  iMultiPoolsAssets,
  IMarketRates,
  iAssetBase,
  iAssetAggregatorBase,
  SymbolMap,
} from './types';

import { LendingRateOracle } from '../types/LendingRateOracle';
import { PriceOracle } from '../types/PriceOracle';
import { MockAggregator } from '../types/MockAggregator';
import { deployTokensPriceAggregator } from './contracts-deployments';
import { chunk, waitForTx } from './misc-utils';
import { getStableAndVariableTokensHelper } from './contracts-getters';

export const setInitialMarketRatesInRatesOracleByHelper = async (
  marketRates: iMultiPoolsAssets<IMarketRates>,
  assetsAddresses: { [x: string]: tEthereumAddress },
  lendingRateOracleInstance: LendingRateOracle,
) => {
  const assetAddresses: string[] = [];
  const borrowRates: string[] = [];
  const symbols: string[] = [];
  for (const [assetSymbol, { borrowRate }] of Object.entries(marketRates) as [
    string,
    IMarketRates
  ][]) {
    const assetAddressIndex = Object.keys(assetsAddresses).findIndex(
      (value) => value === assetSymbol
    );
    if (assetAddressIndex < 0) continue;
    const [, assetAddress] = (Object.entries(assetsAddresses) as [string, string][])[
      assetAddressIndex
    ];
    assetAddresses.push(assetAddress);
    borrowRates.push(borrowRate);
    symbols.push(assetSymbol);
  }

  if(assetAddresses.length > 0){
    console.log(`- Oracle borrow initalization in ${assetAddresses.length} txs`);
    for (let index = 0; index < assetAddresses.length; index++) {
      const asset = assetAddresses[index];
      const rate = borrowRates[index];
      console.log('- setMarketBorrowRate:', symbols[index], asset, rate);
      await waitForTx(
        await lendingRateOracleInstance.setMarketBorrowRate(asset, rate)
      );
    }
  }
};

export const setInitialAssetPricesInOracle = async (
  prices: iAssetBase<tEthereumAddress>,
  assetsAddresses: iAssetBase<tEthereumAddress>,
  priceOracleInstance: PriceOracle
) => {
  for (const [assetSymbol, price] of Object.entries(prices) as [string, string][]) {
    const assetAddressIndex = Object.keys(assetsAddresses).findIndex(
      (value) => value === assetSymbol
    );
    if (assetAddressIndex < 0) continue;
    const [, assetAddress] = (Object.entries(assetsAddresses) as [string, string][])[
      assetAddressIndex
    ];
    if (!assetAddress) continue;
    await waitForTx(await priceOracleInstance.setAssetPrice(assetAddress, price));
  }
};

export const setAssetPricesInOracle = async (
  prices: SymbolMap<string>,
  assetsAddresses: SymbolMap<tEthereumAddress>,
  priceOracleInstance: PriceOracle
) => {
  for (const [assetSymbol, price] of Object.entries(prices) as [string, string][]) {
    const assetAddressIndex = Object.keys(assetsAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, assetAddress] = (Object.entries(assetsAddresses) as [string, string][])[
      assetAddressIndex
    ];
    await waitForTx(await priceOracleInstance.setAssetPrice(assetAddress, price));
  }
};

export const deployMockAggregators = async (initialPrices: SymbolMap<string>, verify?: boolean) => {
  const aggregators: { [tokenSymbol: string]: MockAggregator } = {};
  for (const tokenContractName of Object.keys(initialPrices)) {
    if (tokenContractName !== 'ETH') {
      const priceIndex = Object.keys(initialPrices).findIndex(
        (value) => value === tokenContractName
      );
      const [, price] = (Object.entries(initialPrices) as [string, string][])[priceIndex];
      aggregators[tokenContractName] = await deployTokensPriceAggregator(price, tokenContractName, verify);
    }
  }
  return aggregators;
};

export const deployAllMockAggregators = async (
  initialPrices: iAssetAggregatorBase<string>,
  verify?: boolean
) => {
  const aggregators: { [tokenSymbol: string]: MockAggregator } = {};
  for (const tokenContractName of Object.keys(initialPrices)) {
    const priceIndex = Object.keys(initialPrices).findIndex(
      (value) => value === tokenContractName
    );
    const [, price] = (Object.entries(initialPrices) as [string, string][])[priceIndex];
    aggregators[tokenContractName] = await deployTokensPriceAggregator(price, tokenContractName, verify);
  }
  return aggregators;
};
