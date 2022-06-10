import {
  oneRay,
  MOCK_CHAINLINK_AGGREGATORS_PRICES,
  oneEther,
  ZERO_ADDRESS,
} from '../../helpers/constants';
import { ICommonConfiguration, eEthereumNetwork } from '../../helpers/types';
import {
  buildAdmin,
  buildAssets,
  buildAddress,
  buildWithZeroAddress,
  buildSameAddress,
  buildLibrary,
} from '../../helpers/markets-helpers';

// ----------------
// PROTOCOL GLOBAL PARAMS
// ----------------

export const CommonsConfig: ICommonConfiguration = {
  MarketId: 'Commons',
  BaseURI: 'https://meta.vinci.io/',
  VTokenNamePrefix: 'Vinci interest bearing',
  NTokenNamePrefix: "Vinci wrapped",
  StableDebtTokenNamePrefix: 'Vinci stable debt bearing',
  VariableDebtTokenNamePrefix: 'Vinci debt bearing',
  SymbolPrefix: '',
  ProviderId: 0, // Overriden in index.ts
  OracleQuoteCurrency: 'ETH',
  OracleQuoteUnit: oneEther.toString(),
  ProtocolGlobalParams: {
    TokenDistributorPercentageBase: '10000',
    MockUsdPriceInWei: '5848466240000000',
    UsdAddress: '0x10F7Fc1F91Ba351f9C629c5947AD69bD03C05b96',
    NilAddress: '0x0000000000000000000000000000000000000000',
    OneAddress: '0x0000000000000000000000000000000000000001',
    AaveReferral: '0',
  },

  // ----------------
  // COMMON PROTOCOL PARAMS ACROSS POOLS AND NETWORKS
  // ----------------

  Mocks: {
    AllAssetsInitialPrices: {
      ...MOCK_CHAINLINK_AGGREGATORS_PRICES,
    },
  },

  // TODO: reorg alphabetically, checking the reason of tests failing
  LendingRateOracleRatesCommon: {
    DAI: {
      borrowRate: oneRay.multipliedBy(0.039).toFixed(),
    },
  },
  // ----------------
  // COMMON PROTOCOL ADDRESSES ACROSS POOLS
  // ----------------

  // If PoolAdmin/emergencyAdmin is set, will take priority over PoolAdminIndex/emergencyAdminIndex
  PoolAdmin: buildAdmin(),
  PoolAdminIndex: 0,
  EmergencyAdmin: buildAdmin(),
  EmergencyAdminIndex: 1,
  ReserveAssets: buildAssets(),
  NFTVaultAssets: buildAssets(),
  ReservesConfig: {},
  NFTVaultConfig: {},
  VTokenDomainSeparator: buildAddress(),
  WETH: buildAddress({
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  }),
  CRYPTOPUNKS: buildAddress(),
  WrappedNativeToken: buildAddress({
    [eEthereumNetwork.kovan]: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
  }),
  ProviderRegistry: buildAddress({
    [eEthereumNetwork.kovan]: '0x1E40B561EC587036f9789aF83236f057D1ed2A90',
  }),
  ProviderRegistryOwner: buildAddress({
    [eEthereumNetwork.kovan]: '0x85e4A467343c0dc4aDAB74Af84448D9c45D8ae6F',
  }),
  LendingRateOracle: buildAddress({
    [eEthereumNetwork.kovan]: '', //'0xdCde9Bb6a49e37fA433990832AB541AE2d4FEB4a',
  }),
  LendingPoolCollateralManager: buildAddress({
    [eEthereumNetwork.kovan]: '', //'0x9269b6453d0d75370c4c85e5a42977a53efdb72a',
  }),
  LendingPoolConfigurator: buildAddress(),
  LendingPool: buildAddress(),
  WethGateway: buildAddress(),
  WpunkGateway: buildAddress(),
  TokenDistributor: buildAddress({
    [eEthereumNetwork.kovan]: '0x971efe90088f21dc6a36f610ffed77fc19710708',
  }),
  AaveOracle: buildAddress({
    [eEthereumNetwork.kovan]: '', //'0xB8bE51E6563BB312Cbb2aa26e352516c25c26ac1',
  }),
  FallbackOracle: buildAddress({
    [eEthereumNetwork.kovan]: '0x50913E8E1c650E790F8a1E741FF9B1B1bB251dfe',
  }),
  ChainlinkAggregator: buildAssets({
    [eEthereumNetwork.kovan]: {
      AAVE: '0xd04647B7CB523bb9f26730E9B6dE1174db7591Ad',
      BAT: '0x0e4fcEC26c9f85c3D714370c98f43C4E02Fc35Ae',
      BUSD: '0xbF7A18ea5DE0501f7559144e702b29c55b055CcB',
      DAI: '0x22B58f1EbEDfCA50feF632bD73368b2FdA96D541',
      ENJ: '0xfaDbe2ee798889F02d1d39eDaD98Eff4c7fe95D4',
      KNC: '0xb8E8130d244CFd13a75D6B9Aee029B1C33c808A7',
      LINK: '0x3Af8C569ab77af5230596Acf0E8c2F9351d24C38',
      MANA: '0x1b93D8E109cfeDcBb3Cc74eD761DE286d5771511',
      MKR: '0x0B156192e04bAD92B6C1C13cf8739d14D78D5701',
      REN: '0xF1939BECE7708382b5fb5e559f630CB8B39a10ee',
      SNX: '0xF9A76ae7a1075Fe7d646b06fF05Bd48b9FA5582e',
      SUSD: '0xb343e7a1aF578FA35632435243D814e7497622f7',
      TUSD: '0x7aeCF1c19661d12E962b69eBC8f6b2E63a55C660',
      UNI: '0x17756515f112429471F86f98D5052aCB6C47f6ee',
      USDC: '0x64EaC61A2DFda2c3Fa04eED49AA33D021AeC8838',
      USDT: '0x0bF499444525a23E7Bb61997539725cA2e928138',
      WBTC: '0xF7904a295A029a3aBDFFB6F12755974a958C7C25',
      YFI: '0xC5d1B1DEb2992738C0273408ac43e1e906086B6C',
      ZRX: '0xBc3f28Ccc21E9b5856E81E6372aFf57307E2E883',
      USD: '0x9326BFA02ADD2366b30bacB125260Af641031331',
    },
  }),
  ReserveFactorTreasuryAddress: buildSameAddress(
    '0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c'
  ),
  IncentivesController: buildWithZeroAddress(),
  LendingPoolLibraryAddresses: buildLibrary({
    [eEthereumNetwork.kovan]: {
      ["contracts/protocol/libraries/logic/ReserveLogic.sol:ReserveLogic"]: '0x49cF5C1AA0619EA6F328A9C6dab36d9Ed409dEFE',
      ["contracts/protocol/libraries/logic/NFTVaultLogic.sol:NFTVaultLogic"]: '0x24Ef12dD3E85d9395b82b020dac1dBdE6Dbb02F2',
      ["contracts/protocol/libraries/logic/ValidationLogic.sol:ValidationLogic"]: '0x206DB225E49Bb2D4DB3FE0e2C537734ab8ee4423',
    },
  }),
};
