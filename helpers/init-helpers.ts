import {
  eContractid,
  eNetwork,
  iMultiPoolsAssets,
  INFTVaultParams,
  IReserveParams,
  tEthereumAddress,
  ICommonConfiguration,
} from './types';
import { chunk, getDb, waitForTx } from './misc-utils';
import {
  getVToken,
  getLendingPoolAddressesProvider,
  getLendingPoolConfiguratorProxy,
  getEligibility,
  getRateStrategy,
} from './contracts-getters';
import {
  getContractAddressWithJsonFallback,
} from './contracts-helpers';
import { BigNumberish, BytesLike, utils, constants } from 'ethers';
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

export const getNFTXRangeEligibilityParams = (start: BigNumberish, end: BigNumberish): BytesLike => {
  const abiCoder = new utils.AbiCoder;
  return abiCoder.encode(["uint256", "uint256"], [start, end]);
}

export const getNTokenEligibilityParams = async (eligibilityName: string, eligibilityParams: any): Promise<BytesLike> => {
  switch (eligibilityName.toUpperCase()) {
    case 'ALLOWALL':
      return new Array();
    case 'RANGE':
      return getNFTXRangeEligibilityParams(eligibilityParams[0], eligibilityParams[1]);
    default:
      return new Array();
  }
};

export const initNFTVaultByHelper = async (
  NFTVaultInputParams: iMultiPoolsAssets<INFTVaultParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  baseURI,
  nTokenNamePrefix: string,
  symbolPrefix: string,
  marketId: string,
  ntokenGetter: (INFTVaultParams) => Promise<any>,
  verify: boolean
) => {
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
    eligibilityParams: BytesLike;
  }[] = [];

  const NFTVault = Object.entries(NFTVaultInputParams);

  for (let [symbol, params] of NFTVault) {
    if (!tokenAddresses[symbol]) {
      console.log(`- Skipping init of ${symbol} due token address is not set at markets config`);
      continue;
    }
    // Prepare input parameters
    const ntoken = await ntokenGetter(params);
    const eligibility = await getEligibility(params.eligibility.name);
    reserveSymbols.push(symbol);
    initNFTVaultInputParams.push({
      nTokenImpl: ntoken.address,
      underlyingAsset: tokenAddresses[symbol],
      nftEligibility: eligibility.address,
      underlyingAssetName: symbol,
      nTokenName: `${nTokenNamePrefix} ${params.name}`,
      nTokenSymbol: `v${params.symbol}`,
      baseURI: baseURI,
      params: await getNTokenExtraParams(tokenAddresses[symbol], ntoken.address),
      eligibilityParams: await getNTokenEligibilityParams(params.eligibility.name, params.eligibility.args),
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


export const updateNToken = async (
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  ntokenGetter: (INFTVaultParams) => Promise<any>,
  poolName: ConfigNames,
) => {
  const poolConfig = loadPoolConfig(poolName);
  const {
    NTokenNamePrefix,
    MarketId,
    NFTVaultConfig,
    BaseURI,
  } = poolConfig as ICommonConfiguration;

  const configurator = await getLendingPoolConfiguratorProxy(MarketId);

  for(let [symbol, params] of Object.entries(NFTVaultConfig)){
    const ntoken = await ntokenGetter(params);
    const updateNTokenInput = {
      asset: tokenAddresses[symbol],
      name: `${NTokenNamePrefix} ${params.name}`,
      symbol: `v${params.symbol}`,
      implementation: ntoken.address,
      params: await getNTokenExtraParams(tokenAddresses[symbol], ntoken.address),
      baseURI: BaseURI,
    };
    console.log(`--- Update NToken for : ${symbol} ---`);
    console.log(updateNTokenInput);
    await waitForTx(
      await configurator.updateNToken(updateNTokenInput)
    );
  };
};


export const deployReservesRateStrategy = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  MarketId: string,
  verify: boolean,
) => {
  const addressesProvider = await getLendingPoolAddressesProvider(MarketId);
  const reserves = Object.entries(reservesParams);

  for (let [symbol, params] of reserves) {
    const strategy = params.strategy;
    console.log('==>', symbol, strategy.name, strategy);
    await deployRateStrategy(
      strategy.name,
      [
        addressesProvider.address,
        strategy.optimalUtilizationRate,
        strategy.baseVariableBorrowRate,
        strategy.variableRateSlope1,
        strategy.variableRateSlope2,
        strategy.stableRateSlope1,
        strategy.stableRateSlope2,
      ],
      MarketId,
      verify,
    );
  };
};


export const initReservesByHelperV2 = async (
  reservesParams: iMultiPoolsAssets<IReserveParams>,
  tokenAddresses: { [symbol: string]: tEthereumAddress },
  vTokenNamePrefix: string,
  variableDebtTokenNamePrefix: string,
  treasuryAddress: tEthereumAddress,
  incentivesController: tEthereumAddress,
  poolName: ConfigNames,
) => {
  const poolConfig = loadPoolConfig(poolName);
  // PoolName = VinciBlabla  => name = Blabla
  let symbolPrefix = '';
  let namePrefix = ''
  if (poolName.length > 5) {
    symbolPrefix = poolName.substring(5);
    namePrefix = `${symbolPrefix}-`;
  }

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

  const reserves = Object.entries(reservesParams);
  for (let [symbol, params] of reserves) {
    if (!tokenAddresses[symbol]) {
      console.log(`- Skipping init of ${symbol} due token address is not set at markets config`);
      continue;
    }
    const { strategy, vTokenImpl, reserveDecimals } = params;

    // Prepare input parameters
    reserveSymbols.push(symbol);
    initInputParams.push({
      vTokenImpl: await getContractAddressWithJsonFallback(vTokenImpl, poolName),
      stableDebtTokenImpl: constants.AddressZero,
      variableDebtTokenImpl: await getContractAddressWithJsonFallback(
        eContractid.VariableDebtToken, 
        poolName
      ),
      underlyingAssetDecimals: reserveDecimals,
      interestRateStrategyAddress: (
        await getRateStrategy(strategy.name, poolConfig.MarketId)
      ).address,
      underlyingAsset: tokenAddresses[symbol],
      treasury: treasuryAddress,
      incentivesController: incentivesController,
      underlyingAssetName: symbol,
      vTokenName: `${vTokenNamePrefix} ${namePrefix}${symbol}`,
      vTokenSymbol: `v${symbolPrefix}${symbol}`,
      variableDebtTokenName: `${variableDebtTokenNamePrefix} ${namePrefix}${symbol}`,
      variableDebtTokenSymbol: `vDebt${symbolPrefix}${symbol}`,
      stableDebtTokenName: '',
      stableDebtTokenSymbol: '',
      params: await getVTokenExtraParams(vTokenImpl, tokenAddresses[symbol]),
    });
  }

  const configurator = await getLendingPoolConfiguratorProxy(poolConfig.MarketId);
  console.log("--- Reserve -- ", reserveSymbols.join(', '), '-');
  console.log(initInputParams);
  await waitForTx(await configurator.batchInitReserve(initInputParams));
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
  await deployReservesRateStrategy(reservesParams, poolConfig.MarketId, verify);
  await initReservesByHelperV2(
    reservesParams,
    tokenAddresses,
    vTokenNamePrefix,
    variableDebtTokenNamePrefix,
    treasuryAddress,
    incentivesController,
    poolName,
  );
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
  marketId: string
) => {
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
    for (let index = 0; index < inputParams.length; index++) {
      const inputParam = inputParams[index];
      console.log(` - Ready NFT Reserve for:`, inputParam);
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
  marketId: string
) => {
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

  const configurator = await getLendingPoolConfiguratorProxy(marketId);
  if (tokens.length) {
    for (let index = 0; index < inputParams.length; index++) {
      const inputParam = inputParams[index];
      console.log(` - Ready Reserve for:`, inputParam);
      if (inputParam.borrowingEnabled) {
        await waitForTx(
          await configurator.enableBorrowingOnReserve(inputParam.asset, inputParam.stableBorrowingEnabled)
        )
      }
      await waitForTx(
        await configurator.setReserveFactor(inputParam.asset, inputParam.reserveFactor)
      )
      console.log(`  - Init Reserve for: ${symbols[index]}`);
    }
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
