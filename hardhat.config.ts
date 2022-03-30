/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import path from 'path';
import fs from 'fs';

import {importAllConfigModulesFromDir} from './helper-hardhat-config';
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


export const testNetworks = await importAllConfigModulesFromDir('networks/test');
export const deploymentNetworks = await importAllConfigModulesFromDir('networks/deployment');

export const  typechain = {
    outDir: 'types',
    target: 'ethers-v5',
  };
export const solidity = {
    version: "0.8.11",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  };
export const mocha = {
    timeout: 0,
  };
export const networks = {
  ...testNetworks,
  ...deploymentNetworks,
};