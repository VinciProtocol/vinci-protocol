import { any, string } from "hardhat/internal/core/params/argumentTypes";
import { INFTXEligibility } from "../types";

export interface SymbolMap<T> {
  [symbol: string]: T;
}

export type eNetwork = eEthereumNetwork;

export enum VinciPools {
  proto = 'proto',
}

export enum eEthereumNetwork {
  buidlerevm = 'buidlerevm',
  localhost = 'localhost',
  vinci = 'vinci',
  kovan = 'kovan',
  hardhat = 'hardhat',
  rinkeby = 'rinkeby',
  mainnet = 'mainnet',
}

export enum eContractid {
  Example = 'Example',
  LendingPoolAddressesProvider = 'LendingPoolAddressesProvider',
  LendingPoolConfigurator = 'LendingPoolConfigurator',
  LendingPoolAddressesProviderRegistry = 'LendingPoolAddressesProviderRegistry',
  MintableERC20 = 'MintableERC20',
  ValidationLogic = 'ValidationLogic',
  ReserveLogic = 'ReserveLogic',
  GenericLogic = 'GenericLogic',
  NFTVaultLogic = 'NFTVaultLogic',
  LendingPool = 'LendingPool',
  PriceOracle = 'PriceOracle',
  VToken = 'VToken',
  WETHGateway = 'WETHGateway',
  WPUNKSGateway = 'WPUNKSGateway',
  WETHMocked = 'WETH',
  ETH = 'ETH',
  ERC721Mocked = 'ERC721Mocked',
  LendingPoolImpl = 'LendingPoolImpl',
  LendingPoolConfiguratorImpl = 'LendingPoolConfiguratorImpl',
  StableAndVariableTokensHelper = 'StableAndVariableTokensHelper',
  VTokensAndRatesHelper = 'VTokensAndRatesHelper',
  DelegationAwareVToken = 'DelegationAwareVToken',
  IERC20Metadata = 'IERC20Metadata',
  StableDebtToken = 'StableDebtToken',
  VariableDebtToken = 'VariableDebtToken',
  NToken = 'NToken',
  TimeLockableNToken = 'TimeLockableNToken',
  TimeLockableNTokenForTest = 'TimeLockableNTokenForTest',
  MockAggregator = 'MockAggregator',
  AaveOracle = 'AaveOracle',
  LendingRateOracle = 'LendingRateOracle',
  AaveProtocolDataProvider = 'AaveProtocolDataProvider',
  DefaultReserveInterestRateStrategy = 'DefaultReserveInterestRateStrategy',
  LendingPoolCollateralManager = 'LendingPoolCollateralManager',
  WalletBalanceProvider = 'WalletBalanceProvider',
  UiPoolDataProvider = 'UiPoolDataProvider',
  MockFlashLoanReceiver = 'MockFlashLoanReceiver',
  LendingPoolCollateralManagerImpl = 'LendingPoolCollateralManagerImpl',
  NFTXRangeEligibility = 'NFTXRangeEligibility',
  NFTXEligibility = 'NFTXEligibility',
}

/*
 * Error messages prefix glossary:
 *  - VL = ValidationLogic
 *  - MATH = Math libraries
 *  - AT = vToken or DebtTokens
 *  - LP = LendingPool
 *  - LPAPR = LendingPoolAddressesProviderRegistry
 *  - LPC = LendingPoolConfiguration
 *  - RL = ReserveLogic
 *  - LPCM = LendingPoolCollateralManager
 *  - P = Pausable
 */
export enum ProtocolErrors {
  //common errors
  CALLER_NOT_POOL_ADMIN = '33', // 'The caller must be the pool admin'

  //contract specific errors
  VL_INVALID_AMOUNT = '1', // 'Amount must be greater than 0'
  VL_NO_ACTIVE_RESERVE = '2', // 'Action requires an active reserve'
  VL_RESERVE_FROZEN = '3', // 'Action requires an unfrozen reserve'
  VL_CURRENT_AVAILABLE_LIQUIDITY_NOT_ENOUGH = '4', // 'The current liquidity is not enough'
  VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE = '5', // 'User cannot withdraw more than the available balance'
  VL_TRANSFER_NOT_ALLOWED = '6', // 'Transfer cannot be allowed.'
  VL_BORROWING_NOT_ENABLED = '7', // 'Borrowing is not enabled'
  VL_INVALID_INTEREST_RATE_MODE_SELECTED = '8', // 'Invalid interest rate mode selected'
  VL_COLLATERAL_BALANCE_IS_0 = '9', // 'The collateral balance is 0'
  VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD = '10', // 'Health factor is lesser than the liquidation threshold'
  VL_COLLATERAL_CANNOT_COVER_NEW_BORROW = '11', // 'There is not enough collateral to cover a new borrow'
  VL_STABLE_BORROWING_NOT_ENABLED = '12', // stable borrowing not enabled
  VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY = '13', // collateral is (mostly) the same currency that is being borrowed
  VL_AMOUNT_BIGGER_THAN_MAX_LOAN_SIZE_STABLE = '14', // 'The requested amount is greater than the max loan size in stable rate mode
  VL_NO_DEBT_OF_SELECTED_TYPE = '15', // 'for repayment of stable debt, the user needs to have stable debt, otherwise, he needs to have variable debt'
  VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF = '16', // 'To repay on behalf of an user an explicit amount to repay is needed'
  VL_NO_STABLE_RATE_LOAN_IN_RESERVE = '17', // 'User does not have a stable rate loan in progress on this reserve'
  VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE = '18', // 'User does not have a variable rate loan in progress on this reserve'
  VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0 = '19', // 'The underlying balance needs to be greater than 0'
  VL_DEPOSIT_ALREADY_IN_USE = '20', // 'User deposit is already being used as collateral'
  LP_NOT_ENOUGH_STABLE_BORROW_BALANCE = '21', // 'User does not have any stable rate loan for this reserve'
  LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET = '22', // 'Interest rate rebalance conditions were not met'
  LP_LIQUIDATION_CALL_FAILED = '23', // 'Liquidation call failed'
  LP_NOT_ENOUGH_LIQUIDITY_TO_BORROW = '24', // 'There is not enough liquidity available to borrow'
  LP_REQUESTED_AMOUNT_TOO_SMALL = '25', // 'The requested amount is too small for a FlashLoan.'
  LP_INCONSISTENT_PROTOCOL_ACTUAL_BALANCE = '26', // 'The actual balance of the protocol is inconsistent'
  LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR = '27', // 'The caller is not the lending pool configurator'
  LP_INCONSISTENT_FLASHLOAN_PARAMS = '28',
  CT_CALLER_MUST_BE_LENDING_POOL = '29', // 'The caller of this function must be a lending pool'
  CT_CANNOT_GIVE_ALLOWANCE_TO_HIMSELF = '30', // 'User cannot give allowance to himself'
  CT_TRANSFER_AMOUNT_NOT_GT_0 = '31', // 'Transferred amount needs to be greater than zero'
  RL_RESERVE_ALREADY_INITIALIZED = '32', // 'Reserve has already been initialized'
  LPC_RESERVE_LIQUIDITY_NOT_0 = '34', // 'The liquidity of the reserve needs to be 0'
    LPC_INVALID_VTOKEN_POOL_ADDRESS = '35', // 'The liquidity of the reserve needs to be 0'
  LPC_INVALID_STABLE_DEBT_TOKEN_POOL_ADDRESS = '36', // 'The liquidity of the reserve needs to be 0'
  LPC_INVALID_VARIABLE_DEBT_TOKEN_POOL_ADDRESS = '37', // 'The liquidity of the reserve needs to be 0'
  LPC_INVALID_STABLE_DEBT_TOKEN_UNDERLYING_ADDRESS = '38', // 'The liquidity of the reserve needs to be 0'
  LPC_INVALID_VARIABLE_DEBT_TOKEN_UNDERLYING_ADDRESS = '39', // 'The liquidity of the reserve needs to be 0'
  LPC_INVALID_ADDRESSES_PROVIDER_ID = '40', // 'The liquidity of the reserve needs to be 0'
  LPC_CALLER_NOT_EMERGENCY_ADMIN = '76', // 'The caller must be the emergencya admin'
  LPAPR_PROVIDER_NOT_REGISTERED = '41', // 'Provider is not registered'
  LPCM_HEALTH_FACTOR_NOT_BELOW_THRESHOLD = '42', // 'Health factor is not below the threshold'
  LPCM_COLLATERAL_CANNOT_BE_LIQUIDATED = '43', // 'The collateral chosen cannot be liquidated'
  LPCM_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER = '44', // 'User did not borrow the specified currency'
  LPCM_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE = '45', // "There isn't enough liquidity available to liquidate"
  LPCM_NO_ERRORS = '46', // 'No errors'
  LP_INVALID_FLASHLOAN_MODE = '47', //Invalid flashloan mode selected
  MATH_MULTIPLICATION_OVERFLOW = '48',
  MATH_ADDITION_OVERFLOW = '49',
  MATH_DIVISION_BY_ZERO = '50',
  RL_LIQUIDITY_INDEX_OVERFLOW = '51', //  Liquidity index overflows uint128
  RL_VARIABLE_BORROW_INDEX_OVERFLOW = '52', //  Variable borrow index overflows uint128
  RL_LIQUIDITY_RATE_OVERFLOW = '53', //  Liquidity rate overflows uint128
  RL_VARIABLE_BORROW_RATE_OVERFLOW = '54', //  Variable borrow rate overflows uint128
  RL_STABLE_BORROW_RATE_OVERFLOW = '55', //  Stable borrow rate overflows uint128
  CT_INVALID_MINT_AMOUNT = '56', //invalid amount to mint
  LP_FAILED_REPAY_WITH_COLLATERAL = '57',
  CT_INVALID_BURN_AMOUNT = '58', //invalid amount to burn
  LP_BORROW_ALLOWANCE_NOT_ENOUGH = '59', // User borrows on behalf, but allowance are too small
  LP_FAILED_COLLATERAL_SWAP = '60',
  LP_INVALID_EQUAL_ASSETS_TO_SWAP = '61',
  LP_REENTRANCY_NOT_ALLOWED = '62',
    LP_CALLER_MUST_BE_AN_VTOKEN = '63',
  LP_IS_PAUSED = '64', // 'Pool is paused'
  LP_NO_MORE_RESERVES_ALLOWED = '65',
  LP_INVALID_FLASH_LOAN_EXECUTOR_RETURN = '66',
  RC_INVALID_LTV = '67',
  RC_INVALID_LIQ_THRESHOLD = '68',
  RC_INVALID_LIQ_BONUS = '69',
  RC_INVALID_DECIMALS = '70',
  RC_INVALID_RESERVE_FACTOR = '71',
  LPAPR_INVALID_ADDRESSES_PROVIDER_ID = '72',

  // old

  INVALID_FROM_BALANCE_AFTER_TRANSFER = 'Invalid from balance after transfer',
  INVALID_TO_BALANCE_AFTER_TRANSFER = 'Invalid from balance after transfer',
  INVALID_OWNER_REVERT_MSG = 'Ownable: caller is not the owner',
  INVALID_HF = 'Invalid health factor',
  TRANSFER_AMOUNT_EXCEEDS_BALANCE = 'ERC20: transfer amount exceeds balance',
  SAFEERC20_LOWLEVEL_CALL = 'GPv2SafeERC20: low-level call failed',
}

export type tEthereumAddress = string;
export type tStringTokenSmallUnits = string; // 1 wei, or 1 basic unit of USDC, or 1 basic unit of DAI

export type iAssetsWithoutETH<T> = Omit<iAssetBase<T>, 'ETH'>;

export type iAssetAggregatorBase<T> = iAssetsWithoutETH<T>;

export enum TokenContractId {
    WETH = 'WETH',
    DAI = 'DAI',
  }

export enum ERC721TokenContractId {
  BAYC = 'BAYC',
  MAYC = 'MAYC',
  CloneX = 'CloneX',
  MEKA = 'MEKA',
  Azuki = 'Azuki',
  DOODLE = 'DOODLE',
  Sandbox = 'Sandbox',
  OTHR = 'OTHR',
  PUNK = 'PUNK',
  DLAND = 'DLAND',
  Meebits = 'Meebits',
  MOONBIRD = 'MOONBIRD',
}

export interface iAssetBase<T> {
  DAI: T;
  USD: T;
  WETH: T;
  BAYC: T;
  //CRYPTOPANDA: T;
  MAYC: T;
  CloneX: T;
  MEKA: T;
  Azuki: T;
  DOODLE: T;
  Sandbox: T;
  OTHR: T;
  PUNK: T;
  DLAND: T;
  Meebits: T;
  MOONBIRD: T;
}

export type iAssetsWithoutUSD<T> = Omit<iAssetBase<T>, 'USD'>;

export type iVinciPoolAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'DAI'
  | 'WETH'
>;

export type iVinciPoolNFTAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  //| 'CRYPTOPANDA'
  | 'BAYC'
>;

export type iVinciPoolBAYCAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'BAYC'
>;

export type iVinciPoolMAYCAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'MAYC'
>;

export type iVinciPoolAzukiAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'Azuki'
>;

export type iVinciPoolDOODLEAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'DOODLE'
>;

export type iVinciPoolSandboxAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'Sandbox'
>;

export type iVinciPoolCloneXAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'CloneX'
>;

export type iVinciPoolOTHRAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'OTHR'
>;

export type iVinciPoolPUNKAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'PUNK'
>;

export type iVinciPoolDLANDAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'DLAND'
>;

export type iVinciPoolMOONBIRDAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'MOONBIRD'
>;

export type iVinciPoolMeebitsAssets<T> = Pick<
iAssetsWithoutUSD<T>,
| 'Meebits'
>;

export type iVinciPoolLockDropAssets<T> = Pick<
  iAssetsWithoutUSD<T>,
  | 'CloneX'
  | 'MEKA'
>;

export type iMultiPoolsAssets<T> = iAssetCommon<T> | iVinciPoolAssets<T> | iVinciPoolBAYCAssets<T> | iVinciPoolMAYCAssets<T>;

export interface iAssetCommon<T> {
  [key: string]: T;
}

export interface IInterestRateStrategyParams {
  name: string;
  optimalUtilizationRate: string;
  baseVariableBorrowRate: string;
  variableRateSlope1: string;
  variableRateSlope2: string;
  stableRateSlope1: string;
  stableRateSlope2: string;
}

export interface IReserveParams extends IReserveBorrowParams, IReserveCollateralParams {
  name: string;
  symbol: string;
  vTokenImpl: eContractid;
  reserveFactor: string;
  strategy: IInterestRateStrategyParams;
}

export interface INFTEligibilityParams {
  name: string;
  args: any;
}

export interface INFTVaultParams extends IReserveCollateralParams {
  name: string;
  symbol: string;
  nTokenImpl: eContractid;
  lockdropExpiration: string;
  eligibility: INFTEligibilityParams;
}

export interface IReserveBorrowParams {
  borrowingEnabled: boolean;
  stableBorrowRateEnabled: boolean;
  reserveDecimals: string;
}

export interface IReserveCollateralParams {
  baseLTVAsCollateral: string;
  liquidationThreshold: string;
  liquidationBonus: string;
}

export interface iParamsPerPool<T> {
  [VinciPools.proto]: T;
}

export interface IProtocolGlobalConfig {
  TokenDistributorPercentageBase: string;
  MockUsdPriceInWei: string;
  UsdAddress: tEthereumAddress;
  NilAddress: tEthereumAddress;
  OneAddress: tEthereumAddress;
  AaveReferral: string;
}

export interface IMarketRates {
  borrowRate: string;
}

export interface IBaseConfiguration {
  MarketId: string;
  BaseURI: string;
  VTokenNamePrefix: string;
  NTokenNamePrefix: string;
  StableDebtTokenNamePrefix: string;
  VariableDebtTokenNamePrefix: string;
  SymbolPrefix: string;
  ProviderId: number;
  ProtocolGlobalParams: IProtocolGlobalConfig;
  ProviderRegistry: iParamsPerNetwork<tEthereumAddress | undefined>;
  ProviderRegistryOwner: iParamsPerNetwork<tEthereumAddress | undefined>;
  LendingPoolCollateralManager: iParamsPerNetwork<tEthereumAddress>;
  LendingPoolConfigurator: iParamsPerNetwork<tEthereumAddress>;
  LendingPool: iParamsPerNetwork<tEthereumAddress>;
  LendingRateOracleRatesCommon: iMultiPoolsAssets<IMarketRates>;
  LendingRateOracle: iParamsPerNetwork<tEthereumAddress>;
  TokenDistributor: iParamsPerNetwork<tEthereumAddress>;
  AaveOracle: iParamsPerNetwork<tEthereumAddress>;
  FallbackOracle: iParamsPerNetwork<tEthereumAddress>;
  ChainlinkAggregator: iParamsPerNetwork<ITokenAddress>;
  PoolAdmin: iParamsPerNetwork<tEthereumAddress | undefined>;
  PoolAdminIndex: number;
  EmergencyAdmin: iParamsPerNetwork<tEthereumAddress | undefined>;
  EmergencyAdminIndex: number;
  VTokenDomainSeparator: iParamsPerNetwork<string>;
  WETH: iParamsPerNetwork<tEthereumAddress>;
  CRYPTOPUNKS: iParamsPerNetwork<tEthereumAddress>;
  WrappedNativeToken: iParamsPerNetwork<tEthereumAddress>;
  WethGateway: iParamsPerNetwork<tEthereumAddress>;
  WpunkGateway: iParamsPerNetwork<tEthereumAddress>;
  ReserveFactorTreasuryAddress: iParamsPerNetwork<tEthereumAddress>;
  IncentivesController: iParamsPerNetwork<tEthereumAddress>;
  StableDebtTokenImplementation?: iParamsPerNetwork<tEthereumAddress>;
  VariableDebtTokenImplementation?: iParamsPerNetwork<tEthereumAddress>;
  ReserveAssets: iParamsPerNetwork<SymbolMap<tEthereumAddress>>;
  NFTVaultAssets: iParamsPerNetwork<SymbolMap<tEthereumAddress>>;
  OracleQuoteCurrency: string;
  OracleQuoteUnit: string;
  LendingPoolLibraryAddresses: iParamsPerNetwork<ILendingPoolLibraryAddresses>;
}

export interface IMocksConfig {
  AllAssetsInitialPrices: iAssetBase<string>;
}

export interface ICommonConfiguration extends IBaseConfiguration {
  ReservesConfig: iMultiPoolsAssets<IReserveParams>;
  NFTVaultConfig: iMultiPoolsAssets<INFTVaultParams>;
  Mocks: IMocksConfig;
}

export interface IVinciConfiguration extends ICommonConfiguration {
  ReservesConfig: iVinciPoolAssets<IReserveParams>;
  NFTVaultConfig: iVinciPoolNFTAssets<INFTVaultParams>;
}

export interface IVinciConfigurationBAYC extends ICommonConfiguration {
  ReservesConfig: iVinciPoolAssets<IReserveParams>;
  NFTVaultConfig: iVinciPoolBAYCAssets<INFTVaultParams>;
}

export interface IVinciConfigurationMAYCNoBorrowing extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolMAYCAssets<INFTVaultParams>;
}

export interface IVinciConfigurationAzuki extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolAzukiAssets<INFTVaultParams>;
}

export interface IVinciConfigurationDOODLE extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolDOODLEAssets<INFTVaultParams>;
}

export interface IVinciConfigurationSandbox extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolSandboxAssets<INFTVaultParams>;
}

export interface IVinciConfigurationCloneX extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolCloneXAssets<INFTVaultParams>;
}

export interface IVinciConfigurationOTHR extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolOTHRAssets<INFTVaultParams>;
}

export interface IVinciConfigurationPUNK extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolPUNKAssets<INFTVaultParams>;
}

export interface IVinciConfigurationMeebits extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolMeebitsAssets<INFTVaultParams>;
}

export interface IVinciConfigurationMOONBIRD extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolMOONBIRDAssets<INFTVaultParams>;
}

export interface IVinciConfigurationDLAND extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolDLANDAssets<INFTVaultParams>;
}

export interface IVinciConfigurationMAYC extends ICommonConfiguration {
  ReservesConfig: iVinciPoolAssets<IReserveParams>;
  NFTVaultConfig: iVinciPoolMAYCAssets<INFTVaultParams>;
}

export interface IVinciConfigurationLockDrop extends ICommonConfiguration {
  ReservesConfig: {};
  NFTVaultConfig: iVinciPoolLockDropAssets<INFTVaultParams>;
}

export type iParamsPerNetwork<T> =
  | iEthereumParamsPerNetwork<T>;

export interface iEthereumParamsPerNetwork<T> {
  [eEthereumNetwork.localhost]: T;
  [eEthereumNetwork.vinci]: T;
  [eEthereumNetwork.kovan]: T;
  [eEthereumNetwork.hardhat]: T;
  [eEthereumNetwork.buidlerevm]: T;
  [eEthereumNetwork.rinkeby]: T;
  [eEthereumNetwork.mainnet]: T;
}

export interface iParamsBuilderPerNetwork<T> {
  [eEthereumNetwork.localhost]?: T;
  [eEthereumNetwork.vinci]?: T;
  [eEthereumNetwork.kovan]?: T;
  [eEthereumNetwork.hardhat]?: T;
  [eEthereumNetwork.buidlerevm]?: T;
  [eEthereumNetwork.rinkeby]?: T;
  [eEthereumNetwork.mainnet]?: T;
}

export interface ITokenAddress {
  [token: string]: tEthereumAddress;
}

export interface ILendingPoolLibraryAddresses {
  ["contracts/protocol/libraries/logic/NFTVaultLogic.sol:NFTVaultLogic"]: string;
  ["contracts/protocol/libraries/logic/ValidationLogic.sol:ValidationLogic"]: string;
  ["contracts/protocol/libraries/logic/ReserveLogic.sol:ReserveLogic"]: string;
}

export type PoolConfiguration = ICommonConfiguration | IVinciConfiguration | IVinciConfigurationMAYC;

export enum RateMode {
  None = '0',
  Stable = '1',
  Variable = '2',
}