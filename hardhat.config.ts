/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import path from 'path';
import fs from 'fs';
import {accounts} from './test-wallets.js';

import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';

import '@tenderly/hardhat-tenderly';

const SKIP_LOAD = process.env.SKIP_LOAD === 'true';

if (!SKIP_LOAD) {
  ['misc'].forEach(
    (folder) => {
      const tasksPath = path.join(__dirname, 'tasks', folder);
      fs.readdirSync(tasksPath)
        .filter((pth) => pth.includes('.ts'))
        .forEach((task) => {
          require(`${tasksPath}/${task}`);
        });
    }
  );
}

const ALCHEMY_API_KEY = "";
const KOVAN_PRIVATE_KEY = "";
const DEFAULT_NETWORK = "hardhat";

module.exports = {
  typechain: {
    outDir: 'types',
    target: 'ethers-v5',
  },
  solidity: {
    version: "0.8.11",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  mocha: {
    timeout: 0,
  },
  defaultNetwork: `${DEFAULT_NETWORK}`,
  networks: {
    localhost: {
      accounts: 'remote',
      url: 'http://127.0.0.1:8545'
    },
    hardhat: {
      chainId: 31337,
      accounts: accounts.map(({ secretKey, balance }: { secretKey: string; balance: string }) => ({
        privateKey: secretKey,
        balance,
      })),
      allowUnlimitedContractSize: true,
    },
  }
};
