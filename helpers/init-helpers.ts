import {
  eContractid,
  eNetwork,
  iMultiPoolsAssets,
  INFTVaultParams,
  IReserveParams,
  tEthereumAddress,
} from './types';
import { AaveProtocolDataProvider } from '../types/AaveProtocolDataProvider';
import { chunk, getDb, waitForTx } from './misc-utils';
import {
  getVToken,
  getVTokensAndRatesHelper,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getNToken,
  getTimeLockableNToken,
  getTimeLockableNTokenForTest,
} from './contracts-getters';
import {
  getContractAddressWithJsonFallback,
} from './contracts-helpers';
import { BigNumberish, BytesLike } from 'ethers';
import { ConfigNames, loadPoolConfig } from './configuration';
import { deployRateStrategy } from './contracts-deployments';

export const getVTokenExtraParams = async (vTokenName: string, tokenAddress: tEthereumAddress) => {
  switch (vTokenName) {
    default:
      return '0x10';
  }
};

export const getNTokenExtraParams = async (nTokenName: string, tokenAddress: tEthereumAddress) => {
  switch (nTokenName) {
    default:
      return '0x10';
  }
};

export const initNFTVaultByHelper = async (
  NFTVaultInputParams: iMultiPoolsAssets<INFTVaultParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  eligibilityAddresses: { [symbol: string]: tEthereumAddress },
  baseURI,
  nTokenNamePrefix: string,
  symbolPrefix: string,
  marketId: string,
  ntokenGetter: (string, tEthereumAddress?)=> Promise<any>,
  verify: boolean
) => {
  const addressProvider = await getLendingPoolAddressesProvider(marketId);
  
  // CHUNK CONFIGURATION
  const initChunks = 1;

  // Initialize variables for future reserves initialization
  let reserveSymbols: string[] = [];

  let initNFTVaultInputParams: {
    nTokenImpl: string;
    underlyingAsset: string;
    nftEligibility: string;
    underlyingAssetName: string;
    nTokenName: string;
    nTokenSymbol: string;
    baseURI: string;
    params: BytesLike;
  }[] = [];

  const NFTVault = Object.entries(NFTVaultInputParams);

  for (let [symbol, params] of NFTVault) {
    if (!tokenAddresses[symbol]) {
      console.log(`- Skipping init of ${symbol} due token address is not set at markets config`);
      continue;
    }
    // Prepare input parameters
    const ntoken = await ntokenGetter(marketId);
    reserveSymbols.push(symbol);
    initNFTVaultInputParams.push({
      nTokenImpl: ntoken.address,
      underlyingAsset: tokenAddresses[symbol],
      nftEligibility: eligibilityAddresses[symbol],
      underlyingAssetName: symbol,
      nTokenName: `${nTokenNamePrefix} ${symbol}`,
      nTokenSymbol: `n${symbolPrefix}${symbol}`,
      baseURI: baseURI,
      params: await getNTokenExtraParams(tokenAddresses[symbol], ntoken.address),
    });
  }

  // Deploy init reserves per chunks
  const chunkedSymbols = chunk(reserveSymbols, initChunks);
  const chunkedInitInputParams = chunk(initNFTVaultInputParams, initChunks);

  const configurator = await getLendingPoolConfiguratorProxy(marketId);

  console.log(`- Reserves initialization in ${chunkedInitInputParams.length} txs`);
  for (let chunkIndex = 0; chunkIndex < chunkedInitInputParams.length; chunkIndex++) {
    console.log("--- Reserve ---");
    console.log(chunkedInitInputParams[chunkIndex]);
    const tx3 = await waitForTx(
      await configurator.batchInitNFTVault(chunkedInitInputParams[chunkIndex])
    );

    console.log(`  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    console.log('    * gasUsed', tx3.gasUsed.toString());
  }
};

export const initReservesByHelper = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  vTokenNamePrefix: string,
  stableDebtTokenNamePrefix: string,
  variableDebtTokenNamePrefix: string,
  symbolPrefix: string,
  admin: tEthereumAddress,
  treasuryAddress: tEthereumAddress,
  incentivesController: tEthereumAddress,
  poolName: ConfigNames,
  verify: boolean
) => {
  const poolConfig = loadPoolConfig(poolName);  
  const addressProvider = await getLendingPoolAddressesProvider(poolConfig.MarketId);

  // CHUNK CONFIGURATION
  const initChunks = 1;

  // Initialize variables for future reserves initialization
  let reserveSymbols: string[] = [];

  let initInputParams: {
    vTokenImpl: string;
    stableDebtTokenImpl: string;
    variableDebtTokenImpl: string;
    underlyingAssetDecimals: BigNumberish;
    interestRateStrategyAddress: string;
    underlyingAsset: string;
    treasury: string;
    incentivesController: string;
    underlyingAssetName: string;
    vTokenName: string;
    vTokenSymbol: string;
    variableDebtTokenName: string;
    variableDebtTokenSymbol: string;
    stableDebtTokenName: string;
    stableDebtTokenSymbol: string;
    params: BytesLike;
  }[] = [];

  let strategyRates: [
    string, // addresses provider
    string,
    string,
    string,
    string,
    string,
    string
  ];
  let rateStrategies: Record<string, typeof strategyRates> = {};
  let strategyAddresses: Record<string, tEthereumAddress> = {};

  const reserves = Object.entries(reservesParams);

  for (let [symbol, params] of reserves) {
    if (!tokenAddresses[symbol]) {
      console.log(`- Skipping init of ${symbol} due token address is not set at markets config`);
      continue;
    }
    const { strategy, vTokenImpl, reserveDecimals } = params;
    const {
      optimalUtilizationRate,
      baseVariableBorrowRate,
      variableRateSlope1,
      variableRateSlope2,
      stableRateSlope1,
      stableRateSlope2,
    } = strategy;
    if (!strategyAddresses[strategy.name]) {
      // Strategy does not exist, create a new one
      rateStrategies[strategy.name] = [
        addressProvider.address,
        optimalUtilizationRate,
        baseVariableBorrowRate,
        variableRateSlope1,
        variableRateSlope2,
        stableRateSlope1,
        stableRateSlope2,
      ];

      console.log('----', strategy.name, rateStrategies[strategy.name]);
      strategyAddresses[strategy.name] = await deployRateStrategy(
        strategy.name,
        rateStrategies[strategy.name],
        poolConfig.MarketId,
        verify
      );

      // This causes the last strategy to be printed twice, once under "DefaultReserveInterestRateStrategy"
      // and once under the actual `strategyASSET` key.
      // rawInsertContractAddressInDb(strategy.name, strategyAddresses[strategy.name]);
    }
    // Prepare input parameters
    reserveSymbols.push(symbol);
    initInputParams.push({
      vTokenImpl: await getContractAddressWithJsonFallback(vTokenImpl, poolName),
      stableDebtTokenImpl: await getContractAddressWithJsonFallback(
        eContractid.StableDebtToken,
        poolName
      ),
      variableDebtTokenImpl: await getContractAddressWithJsonFallback(
        eContractid.VariableDebtToken,
        poolName
      ),
      underlyingAssetDecimals: reserveDecimals,
      interestRateStrategyAddress: strategyAddresses[strategy.name],
      underlyingAsset: tokenAddresses[symbol],
      treasury: treasuryAddress,
      incentivesController: incentivesController,
      underlyingAssetName: symbol,
      vTokenName: `${vTokenNamePrefix} ${symbol}`,
      vTokenSymbol: `a${symbolPrefix}${symbol}`,
      variableDebtTokenName: `${variableDebtTokenNamePrefix} ${symbolPrefix}${symbol}`,
      variableDebtTokenSymbol: `variableDebt${symbolPrefix}${symbol}`,
      stableDebtTokenName: `${stableDebtTokenNamePrefix} ${symbol}`,
      stableDebtTokenSymbol: `stableDebt${symbolPrefix}${symbol}`,
      params: await getVTokenExtraParams(vTokenImpl, tokenAddresses[symbol]),
    });
  }

  // Deploy init reserves per chunks
  const chunkedSymbols = chunk(reserveSymbols, initChunks);
  const chunkedInitInputParams = chunk(initInputParams, initChunks);

  const configurator = await getLendingPoolConfiguratorProxy(poolConfig.MarketId);

  console.log(`- Reserves initialization in ${chunkedInitInputParams.length} txs`);
  for (let chunkIndex = 0; chunkIndex < chunkedInitInputParams.length; chunkIndex++) {
    console.log("--- Reserve -- ", chunkIndex, " -");
    console.log(chunkedInitInputParams[chunkIndex]);
  
    const tx3 = await waitForTx(
      await configurator.batchInitReserve(chunkedInitInputParams[chunkIndex])
    );

    console.log(`  - Reserve ready for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    console.log('    * gasUsed', tx3.gasUsed.toString());
  }
};

export const getPairsTokenAggregator = (
  allAssetsAddresses: {
    [tokenSymbol: string]: tEthereumAddress;
  },
  aggregatorsAddresses: { [tokenSymbol: string]: tEthereumAddress }
): [string[], string[]] => {
  const { ETH, USD, WETH, ...assetsAddressesWithoutEth } = allAssetsAddresses;

  const pairs = Object.entries(assetsAddressesWithoutEth).map(([tokenSymbol, tokenAddress]) => {
    if (tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH') {
      const aggregatorAddressIndex = Object.keys(aggregatorsAddresses).findIndex(
        (value) => value === tokenSymbol
      );
      const [, aggregatorAddress] = (
        Object.entries(aggregatorsAddresses) as [string, tEthereumAddress][]
      )[aggregatorAddressIndex];
      return [tokenAddress, aggregatorAddress];
    }
  }) as [string, string][];

  const mappedPairs = pairs.map(([asset]) => asset);
  const mappedAggregators = pairs.map(([, source]) => source);

  return [mappedPairs, mappedAggregators];
};

export const configureNFTVaultByHelper = async (
  reservesParams: iMultiPoolsAssets<INFTVaultParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  helpers: AaveProtocolDataProvider,
  admin: tEthereumAddress,
  marketId: string
) => {
  const addressProvider = await getLendingPoolAddressesProvider(marketId);
    const vtokenAndRatesDeployer = await getVTokensAndRatesHelper(marketId);
  const tokens: string[] = [];
  const symbols: string[] = [];

  const inputParams: {
    asset: string;
    baseLTV: BigNumberish;
    liquidationThreshold: BigNumberish;
    liquidationBonus: BigNumberish;
    lockdropExpiration: BigNumberish;
  }[] = [];

  for (const [
    assetSymbol,
    {
      baseLTVAsCollateral,
      liquidationBonus,
      liquidationThreshold,
      lockdropExpiration,
    },
  ] of Object.entries(reservesParams) as [string, INFTVaultParams][]) {
    if (!tokenAddresses[assetSymbol]) {
      console.log(
        `- Skipping init of ${assetSymbol} due token address is not set at markets config`
      );
      continue;
    }
    if (baseLTVAsCollateral === '-1') continue;

    const assetAddressIndex = Object.keys(tokenAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, tokenAddress] = (Object.entries(tokenAddresses) as [string, string][])[
      assetAddressIndex
    ];
    const { usageAsCollateralEnabled: alreadyEnabled } = await helpers.getReserveConfigurationData(
      tokenAddress
    );

    if (alreadyEnabled) {
      console.log(`- Reserve ${assetSymbol} is already enabled as collateral, skipping`);
      continue;
    }
    // Push data

    inputParams.push({
      asset: tokenAddress,
      baseLTV: baseLTVAsCollateral,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      lockdropExpiration: lockdropExpiration,
    });

    tokens.push(tokenAddress);
    symbols.push(assetSymbol);
  }
  const configurator = await getLendingPoolConfiguratorProxy(marketId);

  if (tokens.length) {
    // Deploy init per chunks
    for (let index = 0; index < inputParams.length; index++) {
      const inputParam = inputParams[index];
      await waitForTx(
        await configurator.configureNFTVaultAsCollateral(inputParam.asset, inputParam.baseLTV, inputParam.liquidationThreshold, inputParam.liquidationBonus)
      );
      await waitForTx(
        await configurator.updateNFTVaultActionExpiration(inputParam.asset, inputParam.lockdropExpiration)
      );
      console.log(`  - Init for: ${symbols[index]}`);
    }
  }
};

export const configureReservesByHelper = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  helpers: AaveProtocolDataProvider,
  admin: tEthereumAddress,
  marketId: string
) => {
  const addressProvider = await getLendingPoolAddressesProvider(marketId);
  const vtokenAndRatesDeployer = await getVTokensAndRatesHelper(marketId);
  const tokens: string[] = [];
  const symbols: string[] = [];

  const inputParams: {
    asset: string;
    baseLTV: BigNumberish;
    liquidationThreshold: BigNumberish;
    liquidationBonus: BigNumberish;
    reserveFactor: BigNumberish;
    stableBorrowingEnabled: boolean;
    borrowingEnabled: boolean;
  }[] = [];

  for (const [
    assetSymbol,
    {
      baseLTVAsCollateral,
      liquidationBonus,
      liquidationThreshold,
      reserveFactor,
      stableBorrowRateEnabled,
      borrowingEnabled,
    },
  ] of Object.entries(reservesParams) as [string, IReserveParams][]) {
    if (!tokenAddresses[assetSymbol]) {
      console.log(
        `- Skipping init of ${assetSymbol} due token address is not set at markets config`
      );
      continue;
    }
    if (baseLTVAsCollateral === '-1') continue;

    const assetAddressIndex = Object.keys(tokenAddresses).findIndex(
      (value) => value === assetSymbol
    );
    const [, tokenAddress] = (Object.entries(tokenAddresses) as [string, string][])[
      assetAddressIndex
    ];
    const { usageAsCollateralEnabled: alreadyEnabled } = await helpers.getReserveConfigurationData(
      tokenAddress
    );

    if (alreadyEnabled) {
      console.log(`- Reserve ${assetSymbol} is already enabled as collateral, skipping`);
      continue;
    }
    // Push data

    inputParams.push({
      asset: tokenAddress,
      baseLTV: baseLTVAsCollateral,
      liquidationThreshold: liquidationThreshold,
      liquidationBonus: liquidationBonus,
      reserveFactor: reserveFactor,
      stableBorrowingEnabled: stableBorrowRateEnabled,
      borrowingEnabled: borrowingEnabled,
    });

    tokens.push(tokenAddress);
    symbols.push(assetSymbol);
  }
  if (tokens.length) {
    // Set vTokenAndRatesDeployer as temporal admin
    await waitForTx(await addressProvider.setPoolAdmin(vtokenAndRatesDeployer.address));

    // Deploy init per chunks
    const enableChunks = 20;
    const chunkedSymbols = chunk(symbols, enableChunks);
    const chunkedInputParams = chunk(inputParams, enableChunks);

    console.log(`- Configure reserves in ${chunkedInputParams.length} txs`);
    for (let chunkIndex = 0; chunkIndex < chunkedInputParams.length; chunkIndex++) {
      await waitForTx(
        await vtokenAndRatesDeployer.configureReserves(chunkedInputParams[chunkIndex])
      );
      console.log(`  - Init for: ${chunkedSymbols[chunkIndex].join(', ')}`);
    }
    // Set deployer back as admin
    await waitForTx(await addressProvider.setPoolAdmin(admin));
  }
};

const getAddressById = async (
  id: string,
  network: eNetwork
): Promise<tEthereumAddress | undefined> =>
  (await getDb().get(`${id}.${network}`).value())?.address || undefined;

// Function deprecated
const isErc20SymbolCorrect = async (token: tEthereumAddress, symbol: string) => {
  const erc20 = await getVToken(token); // using vToken for ERC20 interface
  const erc20Symbol = await erc20.symbol();
  return symbol === erc20Symbol;
};
