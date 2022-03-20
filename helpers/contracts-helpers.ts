import { Contract, Signer, ethers } from 'ethers';
import * as ethsigutils from 'eth-sig-util';
import { fromRpcSig, ECDSASignature } from 'ethereumjs-util';
import BigNumber from 'bignumber.js';
import { getDb, DRE, waitForTx, notFalsyOrZeroAddress } from './misc-utils';
import {
    eContractid,
    tStringTokenSmallUnits,
    tEthereumAddress,
    VinciPools,
    iParamsPerPool,
    iParamsPerNetwork,
    eNetwork,
    eEthereumNetwork,
    iEthereumParamsPerNetwork,
  } from './types';
import { MintableERC20 } from '../types/MintableERC20';
import { Artifact } from 'hardhat/types';
import { Artifact as BuidlerArtifact } from '@nomiclabs/buidler/types';
import { verifyEtherscanContract } from './etherscan-verification';
import { usingTenderly, verifyAtTenderly } from './tenderly-utils';
import { ZERO_ADDRESS } from './constants';
import { getDefenderRelaySigner, usingDefender } from './defender-utils';
import { getFirstSigner, getIErc20Detailed } from './contracts-getters';
import { ConfigNames, loadPoolConfig } from './configuration';
import { BUIDLEREVM_NETWORK_NAME } from '@nomiclabs/buidler/plugins';

export const registerContractInJsonDb = async (contractId: string, contractInstance: Contract) => {
  const currentNetwork = DRE.network.name;
  const FORK = process.env.FORK;
  if (FORK || (currentNetwork !== 'hardhat' && !currentNetwork.includes('coverage'))) {
    console.log(`*** ${contractId} ***\n`);
    console.log(`Network: ${currentNetwork}`);
    console.log(`tx: ${contractInstance.deployTransaction.hash}`);
    console.log(`contract address: ${contractInstance.address}`);
    console.log(`deployer address: ${contractInstance.deployTransaction.from}`);
    console.log(`gas price: ${contractInstance.deployTransaction.gasPrice}`);
    console.log(`gas used: ${contractInstance.deployTransaction.gasLimit}`);
    console.log(`\n******`);
    console.log();
  }

  await getDb()
    .set(`${contractId}.${currentNetwork}`, {
      address: contractInstance.address,
      deployer: contractInstance.deployTransaction.from,
    })
    .write();
};

export const insertContractAddressInDb = async (id: eContractid, address: tEthereumAddress) =>
  await getDb()
    .set(`${id}.${DRE.network.name}`, {
      address,
    })
    .write();

export const rawInsertContractAddressInDb = async (id: string, address: tEthereumAddress) =>
  await getDb()
    .set(`${id}.${DRE.network.name}`, {
      address,
    })
    .write();

export const getEthersSigners = async (): Promise<Signer[]> => {
    const ethersSigners = await Promise.all(await DRE.ethers.getSigners());
  
    if (usingDefender()) {
      const [, ...users] = ethersSigners;
      return [await getDefenderRelaySigner(), ...users];
    }
    return ethersSigners;
  };

export const getEthersSignersAddresses = async (): Promise<tEthereumAddress[]> =>
  await Promise.all((await getEthersSigners()).map((signer) => signer.getAddress()));

export const withSaveAndVerify = async <ContractType extends Contract>(
    instance: ContractType,
    id: string,
    args: (string | string[])[],
    verify?: boolean
  ): Promise<ContractType> => {
    await waitForTx(instance.deployTransaction);
    await registerContractInJsonDb(id, instance);
    if (verify) {
      await verifyContract(id, instance, args);
    }
    return instance;
  };

export const linkBytecode = (artifact: BuidlerArtifact | Artifact, libraries: any) => {
  let bytecode = artifact.bytecode;

  for (const [fileName, fileReferences] of Object.entries(artifact.linkReferences)) {
    for (const [libName, fixups] of Object.entries(fileReferences)) {
      const addr = libraries[libName];

      if (addr === undefined) {
        continue;
      }

      for (const fixup of fixups) {
        bytecode =
          bytecode.substr(0, 2 + fixup.start * 2) +
          addr.substr(2) +
          bytecode.substr(2 + (fixup.start + fixup.length) * 2);
      }
    }
  }

  return bytecode;
};

export const verifyContract = async (
    id: string,
    instance: Contract,
    args: (string | string[])[]
  ) => {
    if (usingTenderly()) {
      await verifyAtTenderly(id, instance);
    }
    await verifyEtherscanContract(instance.address, args);
    return instance;
  };

  export const getParamPerPool = <T>(
    { proto }: iParamsPerPool<T>,
    pool: VinciPools
  ) => {
    switch (pool) {
      case VinciPools.proto:
        return proto;
      default:
        return proto;
    }
  };

export const getParamPerNetwork = <T>(param: iParamsPerNetwork<T>, network: eNetwork) => {
  const { localhost, vinci, kovan, hardhat, buidlerevm } =
    param as iEthereumParamsPerNetwork<T>;
  if (process.env.FORK) {
    return param[process.env.FORK as eNetwork] as T;
  }

  switch (network) {
    case eEthereumNetwork.buidlerevm:
      return buidlerevm;
    case eEthereumNetwork.localhost:
      return localhost;
    case eEthereumNetwork.vinci:
      return vinci;
    case eEthereumNetwork.kovan:
      return kovan;
    case eEthereumNetwork.hardhat:
      return hardhat;
  }
};

export const getOptionalParamAddressPerNetwork = (
  param: iParamsPerNetwork<tEthereumAddress> | undefined | null,
  network: eNetwork
) => {
  if (!param) {
    return ZERO_ADDRESS;
  }
  return getParamPerNetwork(param, network);
};

export const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[]
): Promise<ContractType> => {
  const contract = (await (await DRE.ethers.getContractFactory(contractName))
    .connect(await getFirstSigner())
    .deploy(...args)) as ContractType;
  await waitForTx(contract.deployTransaction);
  await registerContractInJsonDb(<eContractid>contractName, contract);
  return contract;
};

export const getContractAddressWithJsonFallback = async (
  id: string,
  pool: ConfigNames
): Promise<tEthereumAddress> => {
  const poolConfig = loadPoolConfig(pool);
  const network = <eNetwork>DRE.network.name;
  const db = getDb();

  const contractAtMarketConfig = getOptionalParamAddressPerNetwork(poolConfig[id], network);
  if (notFalsyOrZeroAddress(contractAtMarketConfig)) {
    return contractAtMarketConfig;
  }

  const contractAtDb = await getDb().get(`${id}.${DRE.network.name}`).value();
  if (contractAtDb?.address) {
    return contractAtDb.address as tEthereumAddress;
  }
  throw Error(`Missing contract address ${id} at Market config and JSON local db`);
};

export const convertToCurrencyDecimals = async (tokenAddress: tEthereumAddress, amount: string) => {
  const token = await getIErc20Detailed(tokenAddress);
  let decimals = (await token.decimals()).toString();

  return ethers.utils.parseUnits(amount, decimals);
};

export const convertToCurrencyUnits = async (tokenAddress: string, amount: string) => {
  const token = await getIErc20Detailed(tokenAddress);
  let decimals = new BigNumber(await token.decimals());
  const currencyUnit = new BigNumber(10).pow(decimals);
  const amountInCurrencyUnits = new BigNumber(amount).div(currencyUnit);
  return amountInCurrencyUnits.toFixed();
};

export const buildPermitParams = (
  chainId: number,
  token: tEthereumAddress,
  revision: string,
  tokenName: string,
  owner: tEthereumAddress,
  spender: tEthereumAddress,
  nonce: number,
  deadline: string,
  value: tStringTokenSmallUnits
) => ({
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  primaryType: 'Permit' as const,
  domain: {
    name: tokenName,
    version: revision,
    chainId: chainId,
    verifyingContract: token,
  },
  message: {
    owner,
    spender,
    value,
    nonce,
    deadline,
  },
});

export const getSignatureFromTypedData = (
  privateKey: string,
  typedData: any // TODO: should be TypedData, from eth-sig-utils, but TS doesn't accept it
): ECDSASignature => {
  const signature = ethsigutils.signTypedData_v4(Buffer.from(privateKey.substring(2, 66), 'hex'), {
    data: typedData,
  });
  return fromRpcSig(signature);
};

