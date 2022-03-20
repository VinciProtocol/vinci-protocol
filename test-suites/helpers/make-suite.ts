import { evmRevert, evmSnapshot, DRE } from '../../helpers/misc-utils';
import { Signer } from 'ethers';
import {
  getLendingPool,
  getLendingPoolAddressesProvider,
  getAaveProtocolDataProvider,
  getVToken,
  getNToken,
  getMintableERC20,
  getMockERC721Token,
  getLendingPoolConfiguratorProxy,
  getPriceOracle,
  getLendingPoolAddressesProviderRegistry,
  getWETHMocked,
  getTreasury,
} from '../../helpers/contracts-getters';
import { eEthereumNetwork, eNetwork, tEthereumAddress } from '../../helpers/types';
import { LendingPool } from '../../types/LendingPool';
import { AaveProtocolDataProvider } from '../../types/AaveProtocolDataProvider';
import { MintableERC20 } from '../../types/MintableERC20';
import { VToken } from '../../types/VToken';
import { ERC721Mocked } from '../../types/ERC721Mocked';
import { NToken } from '../../types/NToken';
import { LendingPoolConfigurator } from '../../types/LendingPoolConfigurator';

import chai from 'chai';
// @ts-ignore
import bignumberChai from 'chai-bignumber';
import { almostEqual } from './almost-equal';
import { PriceOracle } from '../../types/PriceOracle';
import { LendingPoolAddressesProvider } from '../../types/LendingPoolAddressesProvider';
import { LendingPoolAddressesProviderRegistry } from '../../types/LendingPoolAddressesProviderRegistry';
import { getEthersSigners } from '../../helpers/contracts-helpers';
import { getParamPerNetwork } from '../../helpers/contracts-helpers';
import { WETH9Mocked } from '../../types/WETH9Mocked';
import { WETHGateway } from '../../types/WETHGateway';
import { solidity } from 'ethereum-waffle';
import { VinciConfig } from '../../markets/vinci';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { usingTenderly } from '../../helpers/tenderly-utils';
import { AaveCollector } from '../../types';

chai.use(bignumberChai());
chai.use(almostEqual());
chai.use(solidity);

export interface SignerWithAddress {
  signer: Signer;
  address: tEthereumAddress;
}
export interface TestEnv {
  deployer: SignerWithAddress;
  users: SignerWithAddress[];
  pool: LendingPool;
  configurator: LendingPoolConfigurator;
  oracle: PriceOracle;
  helpersContract: AaveProtocolDataProvider;
  dai: MintableERC20;
  aDai: VToken;
  nft: ERC721Mocked;
  nNFT: NToken;
  addressesProvider: LendingPoolAddressesProvider;
  registry: LendingPoolAddressesProviderRegistry;
  treasury: AaveCollector;
}

let buidlerevmSnapshotId: string = '0x1';
const setBuidlerevmSnapshotId = (id: string) => {
  buidlerevmSnapshotId = id;
};

const testEnv: TestEnv = {
  deployer: {} as SignerWithAddress,
  users: [] as SignerWithAddress[],
  pool: {} as LendingPool,
  configurator: {} as LendingPoolConfigurator,
  helpersContract: {} as AaveProtocolDataProvider,
  oracle: {} as PriceOracle,
  dai: {} as MintableERC20,
  aDai: {} as VToken,
  nft: {} as ERC721Mocked,
  nNFT: {} as NToken,
  addressesProvider: {} as LendingPoolAddressesProvider,
  registry: {} as LendingPoolAddressesProviderRegistry,
  wethGateway: {} as WETHGateway,
  treasury: {} as AaveCollector,
} as TestEnv;

export async function initializeMakeSuite() {
  console.log('getting signers...');
  const [_deployer, ...restSigners] = await getEthersSigners();
  const deployer: SignerWithAddress = {
    address: await _deployer.getAddress(),
    signer: _deployer,
  };

  for (const signer of restSigners) {
    testEnv.users.push({
      signer,
      address: await signer.getAddress(),
    });
  }
  testEnv.deployer = deployer;
  testEnv.pool = await getLendingPool();
  testEnv.treasury = await getTreasury();

  testEnv.configurator = await getLendingPoolConfiguratorProxy();

  testEnv.addressesProvider = await getLendingPoolAddressesProvider();

  if (process.env.FORK) {
    testEnv.registry = await getLendingPoolAddressesProviderRegistry(
      getParamPerNetwork(VinciConfig.ProviderRegistry, process.env.FORK as eNetwork)
    );
  } else {
    testEnv.registry = await getLendingPoolAddressesProviderRegistry();
    testEnv.oracle = await getPriceOracle();
  }

  testEnv.helpersContract = await getAaveProtocolDataProvider();

  const allTokens = await testEnv.helpersContract.getAllVTokens();
  const aDaiAddress = allTokens.find((vToken) => vToken.symbol === 'aDAI')?.tokenAddress;

  const reservesTokens = await testEnv.helpersContract.getAllReservesTokens();

  const daiAddress = reservesTokens.find((token) => token.symbol === 'DAI')?.tokenAddress;

  const allNTokens = await testEnv.helpersContract.getAllNTokens();
  const nNFTAddress = allNTokens.find((nToken) => nToken.symbol === 'nCRYPTOPANDA')?.tokenAddress;

  const vaultsTokens = await testEnv.helpersContract.getAlNFTVaultsTokens();
  const nftAddress = vaultsTokens.find((token) => token.symbol == 'CRYPTOPANDA')?.tokenAddress;

  if (!aDaiAddress || !nNFTAddress) {
    console.log('can not get adai or nCRYPTOPANDA address');
    process.exit(1);
  }
  if (!daiAddress || !nftAddress) {
    console.log('can not get dai or CRYPTOPANDA address');
    process.exit(1);
  }

  testEnv.aDai = await getVToken(aDaiAddress);

  testEnv.dai = await getMintableERC20(daiAddress);

  testEnv.nNFT = await getNToken(nNFTAddress);
  testEnv.nft = await getMockERC721Token(nftAddress);
  //testEnv.wethGateway = await getWETHGateway();
}

const setSnapshot = async () => {
  const hre = DRE as HardhatRuntimeEnvironment;
  setBuidlerevmSnapshotId(await evmSnapshot());
};

const revertHead = async () => {
  const hre = DRE as HardhatRuntimeEnvironment;
  await evmRevert(buidlerevmSnapshotId);
};

export function makeSuite(name: string, tests: (testEnv: TestEnv) => void) {
  describe(name, () => {
    before(async () => {
      await setSnapshot();
    });
    tests(testEnv);
    after(async () => {
      await revertHead();
    });
  });
}
