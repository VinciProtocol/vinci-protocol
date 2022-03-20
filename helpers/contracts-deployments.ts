import { Contract } from 'ethers';
import { DRE, notFalsyOrZeroAddress } from './misc-utils';

import {
  tEthereumAddress,
  eContractid,
  tStringTokenSmallUnits,
  VinciPools,
  TokenContractId,
  ERC721TokenContractId,
  iMultiPoolsAssets,
  IReserveParams,
  PoolConfiguration,
  eEthereumNetwork,
} from './types';
import { MintableERC20 } from '../types/MintableERC20';
import { ERC721Mocked } from '../types/ERC721Mocked';
import { MockContract } from 'ethereum-waffle';
import { 
  ConfigNames, 
  getReservesConfigByPool, 
  getNFTVaultConfigByPool, 
  loadPoolConfig 
} from './configuration';

import {
    LendingPoolAddressesProvider__factory,
    LendingPoolAddressesProviderRegistry__factory,
    LendingPoolCollateralManager__factory,
    MintableERC20__factory,
    WETH9Mocked__factory,
    ERC721Mocked__factory,
    LendingPool__factory,
    ReserveLogic__factory,
    LendingPoolConfigurator__factory,
    StableAndVariableTokensHelper__factory,
    VTokensAndRatesHelper__factory,
    VToken__factory,
    DelegationAwareVToken__factory,
    StableDebtToken__factory,
    VariableDebtToken__factory,
    NToken__factory,
    PriceOracle__factory,
    MockAggregator__factory,
    AaveOracle__factory,
    LendingRateOracle__factory,
    AaveProtocolDataProvider__factory,
    DefaultReserveInterestRateStrategy__factory,
    WalletBalanceProvider__factory,
    UiPoolDataProvider,
    InitializableAdminUpgradeabilityProxy__factory,
    AaveCollector__factory,
    AaveCollector,
    NFTXRangeEligibility__factory,
} from '../types';
import {
    withSaveAndVerify,
    registerContractInJsonDb,
    linkBytecode,
    insertContractAddressInDb,
    getOptionalParamAddressPerNetwork,
    deployContract,
    verifyContract,
  } from './contracts-helpers';
import { readArtifact as buidlerReadArtifact } from '@nomiclabs/buidler/plugins';
import { getFirstSigner, getReserveLogic,  } from './contracts-getters';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { LendingPoolLibraryAddresses } from '../types/factories/LendingPool__factory';
import { eNetwork } from './types';
import internal from 'stream';

export const deployLendingPoolAddressesProvider = async (marketId: string, verify?: boolean) =>
  withSaveAndVerify(
    await new LendingPoolAddressesProvider__factory(await getFirstSigner()).deploy(marketId),
    eContractid.LendingPoolAddressesProvider,
    [marketId],
    verify
  );

export const deployLendingPoolAddressesProviderRegistry = async (verify?: boolean) =>
  withSaveAndVerify(
    await new LendingPoolAddressesProviderRegistry__factory(await getFirstSigner()).deploy(),
    eContractid.LendingPoolAddressesProviderRegistry,
    [],
    verify
  );

export const deployMintableERC20 = async (
  args: [string, string, string],
  verify?: boolean
): Promise<MintableERC20> =>
  withSaveAndVerify(
    await new MintableERC20__factory(await getFirstSigner()).deploy(...args),
    args[0],
    args,
    verify
  );

export const deployERC721Mocked = async (
  args: [string, string],
  verify?: boolean
): Promise<ERC721Mocked> =>
  withSaveAndVerify(
    await new ERC721Mocked__factory(await getFirstSigner()).deploy(...args),
    args[0],
    args,
    verify
  );

export const deployAllMockERC721Tokens = async (verify?: boolean) => {
  const tokens: { [symbol: string]: MockContract | ERC721Mocked } = {};

  const protoConfigData = getReservesConfigByPool(VinciPools.proto);

  for (const tokenSymbol of Object.keys(ERC721TokenContractId)) {
    let configData = (<any>protoConfigData)[tokenSymbol];

    tokens[tokenSymbol] = await deployERC721Mocked(
      [configData.name, configData.symbol],
      verify
    );
  }
  return tokens;
};

export const deployMockERC721Tokens = async (tokenSymbol: string, verify?: boolean) => {
  const tokens: { [symbol: string]: MockContract | ERC721Mocked } = {};

  const protoConfigData = getNFTVaultConfigByPool(VinciPools.proto);
  
  const configData = (<any>protoConfigData)[tokenSymbol];

  tokens[tokenSymbol] = await deployERC721Mocked(
    [configData.name, configData.symbol],
    verify
  );
  return tokens;
};

export const deployWETHMocked = async (verify?: boolean) =>
  withSaveAndVerify(
    await new WETH9Mocked__factory(await getFirstSigner()).deploy(),
    eContractid.WETHMocked,
    [],
    verify
  );

export const deployAllMockTokens = async (verify?: boolean) => {
  const tokens: { [symbol: string]: MockContract | MintableERC20 } = {};

  const protoConfigData = getReservesConfigByPool(VinciPools.proto);

  for (const tokenSymbol of Object.keys(TokenContractId)) {
    let decimals = '18';
    let configData = (<any>protoConfigData)[tokenSymbol];

    tokens[tokenSymbol] = await deployMintableERC20(
      [configData.name, configData.symbol, configData ? configData.reserveDecimals : decimals],
      verify
    );
  }
  return tokens;
};

const readArtifact = async (id: string) => {
  if (DRE.network.name === eEthereumNetwork.buidlerevm) {
    return buidlerReadArtifact(DRE.config.paths.artifacts, id);
  }
  return (DRE as HardhatRuntimeEnvironment).artifacts.readArtifact(id);
};

export const deployMockTokens = async (tokenSymbol: string, verify?: boolean) => {
  const tokens: { [symbol: string]: MockContract | MintableERC20 } = {};
  const decimals = '18';

  const protoConfigData = getReservesConfigByPool(VinciPools.proto);
  
  const configData = (<any>protoConfigData)[tokenSymbol];

  tokens[tokenSymbol] = await deployMintableERC20(
    [configData.name, configData.symbol, configData ? configData.reserveDecimals : decimals],
    verify
  );
  return tokens;
};

export const deployReserveLogicLibrary = async (verify?: boolean) =>
  withSaveAndVerify(
    await new ReserveLogic__factory(await getFirstSigner()).deploy(),
    eContractid.ReserveLogic,
    [],
    verify
  );

export const deployNFTVaultLogic = async (verify?: boolean) => {
  const NFTVaultLogicArtifact = await readArtifact(eContractid.NFTVaultLogic);

  const linkedGenericLogicByteCode = linkBytecode(NFTVaultLogicArtifact, {});

  const NFTVaultLogicFactory = await DRE.ethers.getContractFactory(
    NFTVaultLogicArtifact.abi,
    linkedGenericLogicByteCode
  );

  const NFTVaultLogic = await (
    await NFTVaultLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();
  return withSaveAndVerify(NFTVaultLogic, eContractid.NFTVaultLogic, [], verify);
};

export const deployGenericLogic = async (reserveLogic: Contract, verify?: boolean) => {
  const genericLogicArtifact = await readArtifact(eContractid.GenericLogic);

  const linkedGenericLogicByteCode = linkBytecode(genericLogicArtifact, {
    [eContractid.ReserveLogic]: reserveLogic.address,
  });

  const genericLogicFactory = await DRE.ethers.getContractFactory(
    genericLogicArtifact.abi,
    linkedGenericLogicByteCode
  );

  const genericLogic = await (
    await genericLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();
  return withSaveAndVerify(genericLogic, eContractid.GenericLogic, [], verify);
};

export const deployValidationLogic = async (
  reserveLogic: Contract,
  NFTVaultLogic: Contract,
  genericLogic: Contract,
  verify?: boolean
) => {
  const validationLogicArtifact = await readArtifact(eContractid.ValidationLogic);

  const linkedValidationLogicByteCode = linkBytecode(validationLogicArtifact, {
    [eContractid.ReserveLogic]: reserveLogic.address,
    [eContractid.GenericLogic]: genericLogic.address,
    [eContractid.NFTVaultLogic]: NFTVaultLogic.address,
  });

  const validationLogicFactory = await DRE.ethers.getContractFactory(
    validationLogicArtifact.abi,
    linkedValidationLogicByteCode
  );

const validationLogic = await (
    await validationLogicFactory.connect(await getFirstSigner()).deploy()
  ).deployed();

  return withSaveAndVerify(validationLogic, eContractid.ValidationLogic, [], verify);
};

export const deployVinciLibraries = async (
  verify?: boolean
): Promise<LendingPoolLibraryAddresses> => {
  const reserveLogic = await deployReserveLogicLibrary(verify);
  const NFTVaultLogic = await deployNFTVaultLogic(verify)
  const genericLogic = await deployGenericLogic(reserveLogic, verify);
  const validationLogic = await deployValidationLogic(reserveLogic, NFTVaultLogic, genericLogic, verify);

  // Hardcoded solidity placeholders, if any library changes path this will fail.
  // The '__$PLACEHOLDER$__ can be calculated via solidity keccak, but the LendingPoolLibraryAddresses Type seems to
  // require a hardcoded string.
  //
  //  how-to:
  //  1. PLACEHOLDER = solidityKeccak256(['string'], `${libPath}:${libName}`).slice(2, 36)
  //  2. LIB_PLACEHOLDER = `__$${PLACEHOLDER}$__`
  // or grab placeholdes from LendingPoolLibraryAddresses at Typechain generation.
  //
  // libPath example: contracts/libraries/logic/GenericLogic.sol
  // libName example: GenericLogic

  return {
    ["contracts/protocol/libraries/logic/ReserveLogic.sol:ReserveLogic"]: reserveLogic.address,
    ["contracts/protocol/libraries/logic/NFTVaultLogic.sol:NFTVaultLogic"]: NFTVaultLogic.address,
    ["contracts/protocol/libraries/logic/ValidationLogic.sol:ValidationLogic"]: validationLogic.address,
  };
};

export const deployLendingPool = async (verify?: boolean) => {
  const libraries = await deployVinciLibraries(verify);
  const lendingPoolImpl = await new LendingPool__factory(libraries, await getFirstSigner()).deploy();
  await insertContractAddressInDb(eContractid.LendingPoolImpl, lendingPoolImpl.address);
  return withSaveAndVerify(lendingPoolImpl, eContractid.LendingPool, [], verify);
};

export const deployLendingPoolConfigurator = async (verify?: boolean) => {
  const lendingPoolConfiguratorImpl = await new LendingPoolConfigurator__factory(
    await getFirstSigner()
  ).deploy();
  await insertContractAddressInDb(
    eContractid.LendingPoolConfiguratorImpl,
    lendingPoolConfiguratorImpl.address
  );
  return withSaveAndVerify(
    lendingPoolConfiguratorImpl,
    eContractid.LendingPoolConfigurator,
    [],
    verify
  );
};

export const deployStableAndVariableTokensHelper = async (
  args: [tEthereumAddress, tEthereumAddress],
  verify?: boolean
) =>
  withSaveAndVerify(
    await new StableAndVariableTokensHelper__factory(await getFirstSigner()).deploy(...args),
    eContractid.StableAndVariableTokensHelper,
    args,
    verify
  );

export const deployVTokensAndRatesHelper = async (
  args: [tEthereumAddress, tEthereumAddress, tEthereumAddress],
  verify?: boolean
) =>
  withSaveAndVerify(
    await new VTokensAndRatesHelper__factory(await getFirstSigner()).deploy(...args),
    eContractid.VTokensAndRatesHelper,
    args,
    verify
  );

export const deployGenericVTokenImpl = async (verify: boolean) =>
  withSaveAndVerify(
    await new VToken__factory(await getFirstSigner()).deploy(),
    eContractid.VToken,
    [],
    verify
  );

export const deployDelegationAwareVTokenImpl = async (verify: boolean) =>
  withSaveAndVerify(
    await new DelegationAwareVToken__factory(await getFirstSigner()).deploy(),
    eContractid.DelegationAwareVToken,
    [],
    verify
  );

export const chooseVTokenDeployment = (id: eContractid) => {
  switch (id) {
    case eContractid.VToken:
      return deployGenericVTokenImpl;
    case eContractid.DelegationAwareVToken:
      return deployDelegationAwareVTokenImpl;
    default:
      throw Error(`Missing vToken implementation deployment script for: ${id}`);
  }
};

export const deployGenericStableDebtToken = async (verify?: boolean) =>
  withSaveAndVerify(
    await new StableDebtToken__factory(await getFirstSigner()).deploy(),
    eContractid.StableDebtToken,
    [],
    verify
  );

export const deployGenericVariableDebtToken = async (verify?: boolean) =>
  withSaveAndVerify(
    await new VariableDebtToken__factory(await getFirstSigner()).deploy(),
    eContractid.VariableDebtToken,
    [],
    verify
  );

export const deployVTokenImplementations = async (
  pool: ConfigNames,
  reservesConfig: { [key: string]: IReserveParams },
  verify = false
) => {
  const poolConfig = loadPoolConfig(pool);
  const network = <eNetwork>DRE.network.name;

  // Obtain the different VToken implementations of all reserves inside the Market config
  const vTokenImplementations = [
    ...Object.entries(reservesConfig).reduce<Set<eContractid>>((acc, [, entry]) => {
      acc.add(entry.vTokenImpl);
      return acc;
    }, new Set<eContractid>()),
  ];

  for (let x = 0; x < vTokenImplementations.length; x++) {
    const vTokenAddress = getOptionalParamAddressPerNetwork(
      poolConfig[vTokenImplementations[x].toString()],
      network
    );
    if (!notFalsyOrZeroAddress(vTokenAddress)) {
      const deployImplementationMethod = chooseVTokenDeployment(vTokenImplementations[x]);
      console.log(`Deploying implementation`, vTokenImplementations[x]);
      await deployImplementationMethod(verify);
    }
  }

  // Debt tokens, for now all Market configs follows same implementations
  const genericStableDebtTokenAddress = getOptionalParamAddressPerNetwork(
    poolConfig.StableDebtTokenImplementation,
    network
  );

  const geneticVariableDebtTokenAddress = getOptionalParamAddressPerNetwork(
    poolConfig.VariableDebtTokenImplementation,
    network
  );

  if (!notFalsyOrZeroAddress(genericStableDebtTokenAddress)) {
    await deployGenericStableDebtToken(verify);
  }
  if (!notFalsyOrZeroAddress(geneticVariableDebtTokenAddress)) {
    await deployGenericVariableDebtToken(verify);
  }
};

export const deployNToken = async (verify?: boolean) =>
  withSaveAndVerify(
    await new NToken__factory(await getFirstSigner()).deploy(),
    eContractid.NToken,
    [],
    verify
  );

export const deployPriceOracle = async (verify?: boolean) =>
  withSaveAndVerify(
    await new PriceOracle__factory(await getFirstSigner()).deploy(),
    eContractid.PriceOracle,
    [],
    verify
  );

export const deployMockAggregator = async (
  args: [tStringTokenSmallUnits, string], 
  tokenSymbol?: string, 
  verify?: boolean) =>
  withSaveAndVerify(
    await new MockAggregator__factory(await getFirstSigner()).deploy(...args),
    tokenSymbol + eContractid.MockAggregator,
    args,
    verify
  );

export const deployTokensPriceAggregator = async (price:tStringTokenSmallUnits, tokenSymbol: string, verify?: boolean) => {
  const decimals = '18';

  const protoConfigData = getReservesConfigByPool(VinciPools.proto);
  
  const configData = (<any>protoConfigData)[tokenSymbol];

  return await deployMockAggregator(
    [price, configData ? configData.reserveDecimals : decimals],
    tokenSymbol,
    verify
  );
};

export const deployLendingRateOracle = async (verify?: boolean) =>
  withSaveAndVerify(
    await new LendingRateOracle__factory(await getFirstSigner()).deploy(),
    eContractid.LendingRateOracle,
    [],
    verify
  );

export const deployAaveOracle = async (
  args: [tEthereumAddress[], tEthereumAddress[], tEthereumAddress, tEthereumAddress, string],
  verify?: boolean
) =>
  withSaveAndVerify(
    await new AaveOracle__factory(await getFirstSigner()).deploy(...args),
    eContractid.AaveOracle,
    args,
    verify
  );

export const deployLendingPoolCollateralManager = async (verify?: boolean) => {
    const collateralManagerImpl = await new LendingPoolCollateralManager__factory(
      await getFirstSigner()
    ).deploy();
    await insertContractAddressInDb(
      eContractid.LendingPoolCollateralManagerImpl,
      collateralManagerImpl.address
    );
    return withSaveAndVerify(
      collateralManagerImpl,
      eContractid.LendingPoolCollateralManager,
      [],
      verify
    );
  };

export const deployAaveProtocolDataProvider = async (
    addressesProvider: tEthereumAddress,
    verify?: boolean
  ) =>
    withSaveAndVerify(
      await new AaveProtocolDataProvider__factory(await getFirstSigner()).deploy(addressesProvider),
      eContractid.AaveProtocolDataProvider,
      [addressesProvider],
      verify
    );

export const deployDefaultReserveInterestRateStrategy = async (
  args: [tEthereumAddress, string, string, string, string, string, string],
  verify: boolean,
  name?: string
) =>
  withSaveAndVerify(
    await new DefaultReserveInterestRateStrategy__factory(await getFirstSigner()).deploy(...args),
    name ? name : eContractid.DefaultReserveInterestRateStrategy,
    args,
    verify
  );

export const deployWalletBalancerProvider = async (verify?: boolean) =>
  withSaveAndVerify(
    await new WalletBalanceProvider__factory(await getFirstSigner()).deploy(),
    eContractid.WalletBalanceProvider,
    [],
    verify
  );


export const deployUiPoolDataProvider = async (
    args: [tEthereumAddress, tEthereumAddress],
    verify?: boolean
  ) => {
    const id = eContractid.UiPoolDataProvider;
    const instance = await deployContract<UiPoolDataProvider>(id, args);
    if (verify) {
      await verifyContract(id, instance, args);
    }
    return instance;
  };

export const deployRateStrategy = async (
  strategyName: string,
  args: [tEthereumAddress, string, string, string, string, string, string],
  verify: boolean
): Promise<tEthereumAddress> => {
  switch (strategyName) {
    default:
      return await (
        await deployDefaultReserveInterestRateStrategy(args, verify, strategyName)
      ).address;
  }
};

export const deployTreasury = async (
  verify?: boolean
) => {
  const implementation = await withSaveAndVerify(
    await new AaveCollector__factory(await getFirstSigner()).deploy(),
    'AaveTreasuryImpl',
    [],
    verify
  );
  const contract = await withSaveAndVerify(
    await new InitializableAdminUpgradeabilityProxy__factory(await getFirstSigner()).deploy(),
    'AaveTreasury',
    [],
    verify
  );
  const tx = await contract['initialize(address,address,bytes)'](
    implementation.address, 
    await (await getFirstSigner()).getAddress(),
    implementation.interface.encodeFunctionData("initialize")
  );
  await tx.wait();
  return AaveCollector__factory.connect(contract.address, await getFirstSigner());
};

export const deployRangeEligibility = async (
  rangeStart: number,
  rangeEnd: number,
  tokenSymbol: string,
  verify?: boolean
) => {
  const implementation = await withSaveAndVerify(
    await new NFTXRangeEligibility__factory(await getFirstSigner()).deploy(),
    `${tokenSymbol}EligibilityImpl`,
    [],
    verify
  );
  const contract = await withSaveAndVerify(
    await new InitializableAdminUpgradeabilityProxy__factory(await getFirstSigner()).deploy(),
    `${tokenSymbol}Eligibility`,
    [],
    verify
  );
  const tx = await contract['initialize(address,address,bytes)'](
    implementation.address,
    await (await getFirstSigner()).getAddress(),
    implementation.interface.encodeFunctionData("__NFTXEligibility_init", [rangeStart, rangeEnd])
  );
  await tx.wait()
  return NFTXRangeEligibility__factory.connect(contract.address, await getFirstSigner());
}
