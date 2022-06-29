/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import path from "path";
import fs from "fs";

import "@typechain/hardhat";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";

import "@tenderly/hardhat-tenderly";
import "hardhat-gas-reporter";

const SKIP_LOAD = process.env.SKIP_LOAD === "true";

if (!SKIP_LOAD) {
  ['misc', 'migrations', 'dev', 'full', 'deployments', 'single'].forEach((folder) => {
    const tasksPath = path.join(__dirname, "tasks", folder);
    if(fs.existsSync(tasksPath)){
      fs.readdirSync(tasksPath)
        .filter((pth) => pth.includes(".ts"))
        .forEach((task) => {
          require(`${tasksPath}/${task}`);
        }
      );
    }
  });
}

export const typechain = {
  outDir: "types",
  target: "ethers-v5",
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

export const gasReporter = {
  currency: 'ETH',
  gasPrice: 20,
  enabled: (process.env.REPORT_GAS) ? true : false,
};

export const etherscan = {
  apiKey: {
    kovan: process.env.ETHERSCAN_KEY,
    rinkeby: process.env.ETHERSCAN_KEY,
    mainnet: process.env.ETHERSCAN_KEY,
  }
};