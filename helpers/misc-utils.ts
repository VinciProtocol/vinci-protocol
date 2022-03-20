
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { Wallet, ContractTransaction } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { BuidlerRuntimeEnvironment } from '@nomiclabs/buidler/types';
import { tEthereumAddress } from './types';
import { isAddress } from 'ethers/lib/utils';
import { isZeroAddress } from 'ethereumjs-util';

export const getDb = () => low(new FileSync('./deployed-contracts.json'));

export let DRE: HardhatRuntimeEnvironment | BuidlerRuntimeEnvironment;

export const setDRE = (_DRE: HardhatRuntimeEnvironment | BuidlerRuntimeEnvironment) => {
  DRE = _DRE;
};

export const evmSnapshot = async () => await DRE.ethers.provider.send('evm_snapshot', []);

export const evmRevert = async (id: string) => DRE.ethers.provider.send('evm_revert', [id]);


export const waitForTx = async (tx: ContractTransaction) => await tx.wait(1);

interface DbEntry {
  [network: string]: {
    deployer: string;
    address: string;
  };
}

export const printContracts = () => {
  const network = DRE.network.name;
  const db = getDb();
  console.log('Contracts deployed at', network);
  console.log('---------------------------------');

  const entries = Object.entries<DbEntry>(db.getState()).filter(([_k, value]) => !!value[network]);

  const contractsPrint = entries.map(
    ([key, value]: [string, DbEntry]) => `${key}: \'${value[network].address}\',`
  );

  console.log('N# Contracts:', entries.length);
  console.log(contractsPrint.join('\n'), '\n');
};

export const notFalsyOrZeroAddress = (address: tEthereumAddress | null | undefined): boolean => {
  if (!address) {
    return false;
  }
  return isAddress(address) && !isZeroAddress(address);
};

export const createRandomAddress = () => Wallet.createRandom().address;

export const impersonateAccountsHardhat = async (accounts: string[]) => {
  if (process.env.TENDERLY === 'true') {
    return;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    // eslint-disable-next-line no-await-in-loop
    await (DRE as HardhatRuntimeEnvironment).network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [account],
    });
  }
};

export const chunk = <T>(arr: Array<T>, chunkSize: number): Array<Array<T>> => {
  return arr.reduce(
    (prevVal: any, currVal: any, currIndx: number, array: Array<T>) =>
      !(currIndx % chunkSize)
        ? prevVal.concat([array.slice(currIndx, currIndx + chunkSize)])
        : prevVal,
    []
  );
};

export const omit = <T, U extends keyof T>(obj: T, keys: U[]): Omit<T, U> =>
  (Object.keys(obj) as U[]).reduce(
    (acc, curr) => (keys.includes(curr) ? acc : { ...acc, [curr]: obj[curr] }),
    {} as Omit<T, U>
  );
  
export const filterMapBy = (raw: { [key: string]: any }, list: { [key: string]: any }, fn: (key: string) => boolean) =>
  Object.keys(raw)
    .filter(fn)
    .reduce<{ [key: string]: any }>((obj, key) => {
      obj[key] = raw[key];
      return obj;
    }, list);