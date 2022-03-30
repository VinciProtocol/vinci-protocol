import {accounts} from './test-wallets.js';

const UNLIMITED_BYTECODE_SIZE = process.env.UNLIMITED_BYTECODE_SIZE === 'true';

export const hardhat = {
    chainId: 31337,
    accounts: accounts.map(({secretKey, balance}: {secretKey:string; balance: string}) => ({
        privateKey: secretKey,
        balance,
    })),
    allowUnlimitedContractSize: UNLIMITED_BYTECODE_SIZE,
};