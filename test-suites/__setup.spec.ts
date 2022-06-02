import rawBRE from 'hardhat';
import { MockContract } from 'ethereum-waffle';
import {
  insertContractAddressInDb,
  getEthersSigners,
  registerContractInJsonDb,
  getEthersSignersAddresses,
} from '../helpers/contracts-helpers';
import {
  deployLendingPoolAddressesProvider,
  deployMintableERC20,
  deployERC721Mocked,
  deployLendingPoolAddressesProviderRegistry,
  deployLendingPoolConfigurator,
  deployLendingPool,
  deployPriceOracle,
  deployLendingPoolCollateralManager,
  deployWalletBalancerProvider,
  deployAaveProtocolDataProvider,
  deployLendingRateOracle,
  deployStableAndVariableTokensHelper,
  deployVTokensAndRatesHelper,
  deployWETHMocked,
  deployVTokenImplementations,
  deployNTokenImplementations,
  deployAaveOracle,
  deployTreasury,
  deployRangeEligibility,
  deployAllMockEligibilities
} from '../helpers/contracts-deployments';
import { Signer } from 'ethers';
import { TokenContractId, ERC721TokenContractId, eContractid, tEthereumAddress, VinciPools } from '../helpers/types';
import { MintableERC20 } from '../types/MintableERC20';
import { ERC721Mocked } from '../types/ERC721Mocked';
import { NFTXRangeEligibility } from '../types/NFTXRangeEligibility';
import {
  ConfigNames,
  getReservesConfigByPool,
  loadPoolConfig,
} from '../helpers/configuration';
import { initializeMakeSuite } from './helpers/make-suite';

import {
  setInitialAssetPricesInOracle,
  deployAllMockAggregators,
  setInitialMarketRatesInRatesOracleByHelper,
} from '../helpers/oracles-helpers';
import { DRE, waitForTx } from '../helpers/misc-utils';
import { initReservesByHelper, configureReservesByHelper, initNFTVaultByHelper, configureNFTVaultByHelper } from '../helpers/init-helpers';
import VinciConfig from '../markets/vinci';
import { oneEther, ZERO_ADDRESS } from '../helpers/constants';
import {
  getLendingPool,
  getLendingPoolConfiguratorProxy,
  getPairsTokenAggregator,
  getTimeLockableNToken,
} from '../helpers/contracts-getters';
import { WETH9Mocked } from '../types/WETH9Mocked';

const MOCK_USD_PRICE_IN_WEI = VinciConfig.ProtocolGlobalParams.MockUsdPriceInWei;
const ALL_ASSETS_INITIAL_PRICES = VinciConfig.Mocks.AllAssetsInitialPrices;
const USD_ADDRESS = VinciConfig.ProtocolGlobalParams.UsdAddress;
const LENDING_RATE_ORACLE_RATES_COMMON = VinciConfig.LendingRateOracleRatesCommon;

const deployAllMockTokens = async (deployer: Signer) => {
  const tokens: { [symbol: string]: MockContract | MintableERC20 | WETH9Mocked | ERC721Mocked } = {};

  const protoConfigData = getReservesConfigByPool(VinciPools.proto);

  for (const tokenSymbol of Object.keys(TokenContractId)) {
    if (tokenSymbol === 'WETH') {
      tokens[tokenSymbol] = await deployWETHMocked();
      await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
      continue;
    }
    let decimals = 18;

    let configData = (<any>protoConfigData)[tokenSymbol];

    if (!configData) {
      decimals = 18;
    }

    tokens[tokenSymbol] = await deployMintableERC20([
      tokenSymbol,
      tokenSymbol,
      configData ? configData.reserveDecimals : 18,
    ]);
    await registerContractInJsonDb(tokenSymbol.toUpperCase(), tokens[tokenSymbol]);
  }
  for (const tokenSymbol of Object.keys(ERC721TokenContractId)) {
    tokens[tokenSymbol] = await deployERC721Mocked([tokenSymbol, tokenSymbol]);
    await registerContractInJsonDb(tokenSymbol.toLocaleUpperCase(), tokens[tokenSymbol]);
    continue;
  }
  return tokens;
};

const buildTestEnv = async (deployer: Signer, secondaryWallet: Signer) => {
  console.time('setup');
  const aaveAdmin = await deployer.getAddress();
  const config = loadPoolConfig(ConfigNames.Vinci);
  const marketId = config.MarketId;
  const treasury = await deployTreasury();

  const mockTokens: {
    [symbol: string]: MockContract | MintableERC20 | WETH9Mocked | ERC721Mocked;
  } = {
    ...(await deployAllMockTokens(deployer)),
  };
  const eligibilities: {
    [symbol: string]: NFTXRangeEligibility
  } = { 
    ... (await deployAllMockEligibilities(marketId)), 
  };
  const addressesProvider = await deployLendingPoolAddressesProvider(marketId);
  await waitForTx(await addressesProvider.setPoolAdmin(aaveAdmin));

  //setting users[1] as emergency admin, which is in position 2 in the DRE addresses list
  const addressList = await getEthersSignersAddresses();

  await waitForTx(await addressesProvider.setEmergencyAdmin(addressList[2]));

  const addressesProviderRegistry = await deployLendingPoolAddressesProviderRegistry();
  await waitForTx(
    await addressesProviderRegistry.registerAddressesProvider(addressesProvider.address, 1)
  );

  const lendingPoolImpl = await deployLendingPool(marketId);

  await waitForTx(await addressesProvider.setLendingPoolImpl(lendingPoolImpl.address));

  const lendingPoolAddress = await addressesProvider.getLendingPool();
  const lendingPoolProxy = await getLendingPool(marketId, lendingPoolAddress);

  await insertContractAddressInDb(eContractid.LendingPool, lendingPoolProxy.address, marketId);

  const lendingPoolConfiguratorImpl = await deployLendingPoolConfigurator(marketId);
  await waitForTx(
    await addressesProvider.setLendingPoolConfiguratorImpl(lendingPoolConfiguratorImpl.address)
  );
  const lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy(
    marketId,
    await addressesProvider.getLendingPoolConfigurator()
  );
  await insertContractAddressInDb(
    eContractid.LendingPoolConfigurator,
    lendingPoolConfiguratorProxy.address,
    marketId
  );

  // Deploy deployment helpers
  await deployStableAndVariableTokensHelper([lendingPoolProxy.address, addressesProvider.address], marketId);
  await deployVTokensAndRatesHelper(marketId, [
    lendingPoolProxy.address,
    addressesProvider.address,
    lendingPoolConfiguratorProxy.address,
  ]);

  const fallbackOracle = await deployPriceOracle();
  await waitForTx(await fallbackOracle.setEthUsdPrice(MOCK_USD_PRICE_IN_WEI));
  await setInitialAssetPricesInOracle(
    ALL_ASSETS_INITIAL_PRICES,
    {
      WETH: mockTokens.WETH.address,
      DAI: mockTokens.DAI.address,
      BAYC: mockTokens.BAYC.address,
      MAYC: mockTokens.MAYC.address,
      USD: USD_ADDRESS,
      CloneX: mockTokens.CloneX.address,
      MEKA: mockTokens.MEKA.address,
      Azuki: mockTokens.Azuki.address,
      DOODLE: mockTokens.DOODLE.address,
    },
    fallbackOracle
  );

  const mockAggregators = await deployAllMockAggregators(ALL_ASSETS_INITIAL_PRICES);
  const allTokenAddresses = Object.entries(mockTokens).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, tokenContract]) => ({
      ...accum,
      [tokenSymbol]: tokenContract.address,
    }),
    {}
  );

  const allEligibilityAddresses = Object.entries(eligibilities).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, eligibility]) => ({
      ...accum,
      [tokenSymbol]: eligibility.address,
    }),
    {}
  )
  const allAggregatorsAddresses = Object.entries(mockAggregators).reduce(
    (accum: { [tokenSymbol: string]: tEthereumAddress }, [tokenSymbol, aggregator]) => ({
      ...accum,
      [tokenSymbol]: aggregator.address,
    }),
    {}
  );

  const [tokens, aggregators] = getPairsTokenAggregator(
    allTokenAddresses,
    allAggregatorsAddresses,
    config.OracleQuoteCurrency
  );

  await deployAaveOracle([
    tokens,
    aggregators,
    fallbackOracle.address,
    mockTokens.WETH.address,
    oneEther.toString(),
  ]);
  await waitForTx(await addressesProvider.setPriceOracle(fallbackOracle.address));

  const lendingRateOracle = await deployLendingRateOracle();
  await waitForTx(await addressesProvider.setLendingRateOracle(lendingRateOracle.address));

  const { USD, ...tokensAddressesWithoutUsd } = allTokenAddresses;
  const allReservesAddresses = {
    ...tokensAddressesWithoutUsd,
  };
  await setInitialMarketRatesInRatesOracleByHelper(
    LENDING_RATE_ORACLE_RATES_COMMON,
    allReservesAddresses,
    lendingRateOracle,
    aaveAdmin,
    marketId
  );

  console.log(
    "\ndeployed market rates."
  );

  // Reserve params from AAVE pool + mocked tokens
  const reservesParams = {
    ...config.ReservesConfig,
  };

  const nftVaultsParams = {
    ...config.NFTVaultConfig,
  }

  const testHelpers = await deployAaveProtocolDataProvider(addressesProvider.address, marketId);

  await deployVTokenImplementations(ConfigNames.Vinci, reservesParams, false);
  await deployNTokenImplementations(marketId, nftVaultsParams, false);

  const admin = await deployer.getAddress();

  const { VTokenNamePrefix, StableDebtTokenNamePrefix, VariableDebtTokenNamePrefix, SymbolPrefix } =
    config;
  const treasuryAddress = treasury.address;

  await initReservesByHelper(
    reservesParams,
    allReservesAddresses,
    VTokenNamePrefix,
    StableDebtTokenNamePrefix,
    VariableDebtTokenNamePrefix,
    SymbolPrefix,
    admin,
    treasuryAddress,
    ZERO_ADDRESS,
    ConfigNames.Vinci,
    false
  );

  await configureReservesByHelper(reservesParams, allReservesAddresses, testHelpers, admin, marketId);

  await initNFTVaultByHelper(
    nftVaultsParams,
    allReservesAddresses,
    allEligibilityAddresses,
    'https://meta.vinci.com/',
    VTokenNamePrefix,
    SymbolPrefix,
    marketId,
    getTimeLockableNToken,
    false,
  );

  await configureNFTVaultByHelper(nftVaultsParams, allReservesAddresses, testHelpers, admin, marketId);

  const collateralManager = await deployLendingPoolCollateralManager(marketId);
  await waitForTx(
    await addressesProvider.setLendingPoolCollateralManager(collateralManager.address)
  );

  await deployWalletBalancerProvider();
  console.timeEnd('setup');
};

before(async () => {
  await rawBRE.run('set-DRE');
  const [deployer, secondaryWallet] = await getEthersSigners();
  const FORK = process.env.FORK;

  if (FORK) {
    await rawBRE.run('aave:mainnet', { skipRegistry: true });
  } else {
    console.log('-> Deploying test environment...');
    await buildTestEnv(deployer, secondaryWallet);
  }

  await initializeMakeSuite();
  console.log('\n***************');
  console.log('Setup and snapshot finished');
  console.log('***************\n');
});
