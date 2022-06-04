import { 
    LendingPoolAddressesProvider__factory,
    LendingPoolAddressesProviderRegistry__factory,
    LendingPool__factory,
    LendingRateOracle__factory,
    LendingPoolConfigurator__factory,
    StableAndVariableTokensHelper__factory,
    //StableDebtToken__factory,
    VariableDebtToken__factory,
    IERC20Metadata__factory,
    MintableERC20__factory,
    MockAggregator__factory,
    ReserveLogic__factory,
    GenericLogic__factory,
    ValidationLogic__factory,
    VToken__factory,
    VTokensAndRatesHelper__factory,
    WETH9Mocked__factory,
    ERC721Mocked__factory,
    NToken__factory,
    AaveProtocolDataProvider__factory,
    AaveOracle__factory,
    PriceOracle__factory,
    AaveCollector__factory,
    NFTXRangeEligibility__factory,
    NFTXRangeEligibility,
    WETHGateway__factory,
    NFTXEligibility__factory,
    AaveCollector,
    TimeLockableNToken__factory,
    TimeLockableNTokenForTest__factory,
    LendingPoolCollateralManager__factory
 } from "../types";
import { MintableERC20 } from '../types/MintableERC20';
import { ERC721Mocked } from '../types/ERC721Mocked';
import { getEthersSigners, linkBytecode } from './contracts-helpers';
import { DRE, getDb, getMarketDb,notFalsyOrZeroAddress, omit } from './misc-utils';
import { eContractid, tEthereumAddress, TokenContractId, ERC721TokenContractId, eEthereumNetwork } from "./types";
import { LendingPoolLibraryAddresses } from '../types/factories/LendingPool__factory';
import { readArtifact as buidlerReadArtifact } from '@nomiclabs/buidler/plugins';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ethers } from "ethers";

export const getFirstSigner = async () => (await getEthersSigners())[0];
export type MockTokenMap = { [symbol: string]: MintableERC20 };
export type MockERC721TokenMap = { [symbol: string]: ERC721Mocked };
export type MockEligibilityMap = { [symbol: string]: NFTXRangeEligibility};
export type EligibilityAddressMap = { [symbol: string]: tEthereumAddress};

export const getLendingPoolAddressesProvider = async (marketId: string, address?: tEthereumAddress) => {
    return await LendingPoolAddressesProvider__factory.connect(
      address ||
        (
          await getMarketDb().get(`${eContractid.LendingPoolAddressesProvider}.${DRE.network.name}.${marketId}`).value()
        ).address,
      await getFirstSigner()
    );
  };

export const getLendingPoolAddressesProviderRegistry = async (address?: tEthereumAddress) =>
  await LendingPoolAddressesProviderRegistry__factory.connect(
    notFalsyOrZeroAddress(address)
      ? address
      : (
          await getDb()
            .get(`${eContractid.LendingPoolAddressesProviderRegistry}.${DRE.network.name}`)
            .value()
        ).address,
    await getFirstSigner()
  );

export const getReserveLogic = async (address?: tEthereumAddress) =>
  await ReserveLogic__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.ReserveLogic}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getGenericLogic = async (address?: tEthereumAddress) =>
  await GenericLogic__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.GenericLogic}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

const readArtifact = async (id: string) => {
    if (DRE.network.name === eEthereumNetwork.buidlerevm) {
      return buidlerReadArtifact(DRE.config.paths.artifacts, id);
    }
    return (DRE as HardhatRuntimeEnvironment).artifacts.readArtifact(id);
  };

export const getNFTVaultLogic = async (address?: tEthereumAddress) => {
  const NFTVaultLogicArtifact = await readArtifact(eContractid.NFTVaultLogic);

  return new DRE.ethers.Contract(
    address ||
      (
        await getDb().get(`${eContractid.NFTVaultLogic}.${DRE.network.name}`).value()
      ).address,
    NFTVaultLogicArtifact.abi,
    await getFirstSigner()
  );
}

export const getValidationLogic = async (address?: tEthereumAddress) =>
  await ValidationLogic__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.ValidationLogic}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPoolImpl = async (address?: tEthereumAddress) =>
  await LendingPool__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.LendingPoolImpl}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPool = async (marketId: string, address?: tEthereumAddress) =>
  await LendingPool__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.LendingPool}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );

export const getPriceOracle = async (address?: tEthereumAddress) =>
  await PriceOracle__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.PriceOracle}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getLendingPoolConfiguratorProxy = async (marketId: string, address?: tEthereumAddress) => {
  return await LendingPoolConfigurator__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.LendingPoolConfigurator}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );
};

export const getLendingPoolCollateralManager = async (address?: tEthereumAddress) => 
  await LendingPoolCollateralManager__factory.connect(
    address ||
    (
      await getDb().get(`${eContractid.LendingPoolCollateralManagerImpl}.${DRE.network.name}`).value()
    ).address,
    await getFirstSigner()
  );

export const getStableAndVariableTokensHelper = async (marketId: string, address?: tEthereumAddress) =>
  await StableAndVariableTokensHelper__factory.connect(
    address ||
      (
        await getMarketDb()
          .get(`${eContractid.StableAndVariableTokensHelper}.${DRE.network.name}.${marketId}`)
          .value()
      ).address,
    await getFirstSigner()
  );

/*export const getStableDebtToken = async (marketId: string, address?: tEthereumAddress) =>
  await StableDebtToken__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.StableDebtToken}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );*/

export const getVariableDebtToken = async (marketId: string, address?: tEthereumAddress) =>
  await VariableDebtToken__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.VariableDebtToken}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );

export const getMintableERC20 = async (address: tEthereumAddress) =>
  await MintableERC20__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.MintableERC20}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getIErc20Detailed = async (address: tEthereumAddress) =>
  await IERC20Metadata__factory.connect(
    address ||
      (
            await getDb().get(`${eContractid.IERC20Metadata}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getMockERC721Token = async (address: tEthereumAddress) =>
  await ERC721Mocked__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.ERC721Mocked}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getEligibility = async (marketId: string, tokenSymbol: string, address?: tEthereumAddress) =>
    await NFTXEligibility__factory.connect(
        address ||
        (
            await getMarketDb().get(`${tokenSymbol}EligibilityImpl.${DRE.network.name}.${marketId}`).value()
        ).address,
        await getFirstSigner()
    );

export const getAllMockedTokens = async () => {
  const db = getDb();
  const tokens: MockTokenMap = await Object.keys(TokenContractId).reduce<Promise<MockTokenMap>>(
    async (acc, tokenSymbol) => {
      const accumulator = await acc;
      const address = (await db.get(`${tokenSymbol}.${DRE.network.name}`).value()).address;
      accumulator[tokenSymbol] = await getMintableERC20(address);
      return Promise.resolve(acc);
    },
    Promise.resolve({})
  );
  return tokens;
};

export const getAllMockedERC721Tokens = async () => {
  const db = getDb();
  const tokens: MockERC721TokenMap = await Object.keys(ERC721TokenContractId).reduce<Promise<MockERC721TokenMap>>(
    async (acc, tokenSymbol) => {
      const accumulator = await acc;
            const address = (await db.get(`${tokenSymbol}.${DRE.network.name}`).value()).address;
      accumulator[tokenSymbol] = await getMockERC721Token(address);
      return Promise.resolve(acc);
    },
    Promise.resolve({})
  );
  return tokens;
};

export const getQuoteCurrencies = (oracleQuoteCurrency: string): string[] => {
  switch (oracleQuoteCurrency) {
    case 'USD':
      return ['USD'];
    case 'ETH':
    case 'WETH':
    default:
      return ['ETH', 'WETH'];
  }
};

export const getPairsTokenAggregator = (
    allAssetsAddresses: {
      [tokenSymbol: string]: tEthereumAddress;
    },
    aggregatorsAddresses: { [tokenSymbol: string]: tEthereumAddress },
    oracleQuoteCurrency: string
  ): [string[], string[]] => {
    const assetsWithoutQuoteCurrency = omit(
      allAssetsAddresses,
      getQuoteCurrencies(oracleQuoteCurrency)
    );
  
    const pairs = Object.entries(assetsWithoutQuoteCurrency).map(([tokenSymbol, tokenAddress]) => {
      //if (true/*tokenSymbol !== 'WETH' && tokenSymbol !== 'ETH' && tokenSymbol !== 'LpWETH'*/) {
      const aggregatorAddressIndex = Object.keys(aggregatorsAddresses).findIndex(
        (value) => value === tokenSymbol
      );
      const [, aggregatorAddress] = (
        Object.entries(aggregatorsAddresses) as [string, tEthereumAddress][]
      )[aggregatorAddressIndex];
      return [tokenAddress, aggregatorAddress];
      //}
    }) as [string, string][];
  
    const mappedPairs = pairs.map(([asset]) => asset);
    const mappedAggregators = pairs.map(([, source]) => source);
  
    return [mappedPairs, mappedAggregators];
  };

export const getMockAggregator = async (id: string, address?: tEthereumAddress) => {
    return await MockAggregator__factory.connect(
      address ||
        (
          await getDb().get(`${id}${eContractid.MockAggregator}.${DRE.network.name}`).value()
        ).address,
      await getFirstSigner()
    );
  };

export const getLendingPoolConfiguratorImpl = async (address?: tEthereumAddress) =>
  await LendingPoolConfigurator__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.LendingPoolConfiguratorImpl}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getVToken = async (marketId: string, address?: tEthereumAddress) =>
  await VToken__factory.connect(
    address || (await getMarketDb().get(`${eContractid.VToken}.${DRE.network.name}.${marketId}`).value()).address,
    await getFirstSigner()
  );

export const getVTokensAndRatesHelper = async (marketId: string, address?: tEthereumAddress) =>
  await VTokensAndRatesHelper__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.VTokensAndRatesHelper}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );

export const getWETHGateway = async (address?: tEthereumAddress) =>
  await WETHGateway__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.WETHGateway}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getWETHMocked = async (address?: tEthereumAddress) =>
  await WETH9Mocked__factory.connect(
    address || (await getDb().get(`${eContractid.WETHMocked}.${DRE.network.name}`).value()).address,
    await getFirstSigner()
  );

export const getNTokenAddressFromDb = async (
  marketId: string,
  contractId: eContractid,
  nftSymbol: string
): Promise<tEthereumAddress> => {
  return (await getMarketDb().get(`${contractId}.${DRE.network.name}.${marketId}.vn${nftSymbol}`).value()).address;
}

export const getNToken = async (marketId: string, nftSymbol: string, address?: tEthereumAddress) =>
  await NToken__factory.connect(
    address || (await getNTokenAddressFromDb(marketId, eContractid.NToken, nftSymbol)),
    await getFirstSigner()
  );

export const getTimeLockableNToken = async (marketId: string, nftSymbol: string, address?: tEthereumAddress) =>
  await TimeLockableNToken__factory.connect(
    address || (await getNTokenAddressFromDb(marketId, eContractid.TimeLockableNToken, nftSymbol)),
    await getFirstSigner()
  );

export const getTimeLockableNTokenForTest = async (marketId: string, nftSymbol: string, address?: tEthereumAddress) =>
  await TimeLockableNTokenForTest__factory.connect(
    address || (await getNTokenAddressFromDb(marketId, eContractid.TimeLockableNTokenForTest, nftSymbol)),
    await getFirstSigner()
  );
  
export const getAaveProtocolDataProvider = async (marketId: string, address?: tEthereumAddress) =>
  await AaveProtocolDataProvider__factory.connect(
    address ||
      (
        await getMarketDb().get(`${eContractid.AaveProtocolDataProvider}.${DRE.network.name}.${marketId}`).value()
      ).address,
    await getFirstSigner()
  );

export const getLendingRateOracle = async (address?: tEthereumAddress) =>
  await LendingRateOracle__factory.connect(
    address ||
      (
        await getDb().get(`${eContractid.LendingRateOracle}.${DRE.network.name}`).value()
      ).address,
    await getFirstSigner()
  );

export const getAaveOracle = async (address?: tEthereumAddress) =>
  await AaveOracle__factory.connect(
    address || (await getDb().get(`${eContractid.AaveOracle}.${DRE.network.name}`).value()).address,
    await getFirstSigner()
  );

export const getTreasury = async (address?: tEthereumAddress) =>
  await AaveCollector__factory.connect(
    address || (await getDb().get(`AaveTreasury.${DRE.network.name}`).value()).address,
    await getFirstSigner()
  );

  export const getVinciLibraries = async (
  ): Promise<LendingPoolLibraryAddresses> => {
    const reserveLogic = await getReserveLogic();
    const NFTVaultLogic = await getNFTVaultLogic();
    const validationLogic = await getValidationLogic();
  
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