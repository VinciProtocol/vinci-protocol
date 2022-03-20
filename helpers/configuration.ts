import {
  VinciPools,
  iMultiPoolsAssets,
  IReserveParams,
  PoolConfiguration,
  IBaseConfiguration,
  eNetwork,
  tEthereumAddress,
  INFTVaultParams,
} from './types';
import { getParamPerPool, getParamPerNetwork } from './contracts-helpers';
import VinciConfig from '../markets/vinci';
import { DRE } from './misc-utils';

import { deployWETHMocked } from './contracts-deployments';

export enum ConfigNames {
  Vinci = 'Vinci'
}
// ----------------
// PROTOCOL PARAMS PER POOL
// ----------------

export const getReservesConfigByPool = (pool: VinciPools): iMultiPoolsAssets<IReserveParams> =>
  getParamPerPool<iMultiPoolsAssets<IReserveParams>>(
    {
      [VinciPools.proto]: {
        ...VinciConfig.ReservesConfig,
      }
    },
    pool
  );

export const getNFTVaultConfigByPool = (pool: VinciPools): iMultiPoolsAssets<INFTVaultParams> =>
  getParamPerPool<iMultiPoolsAssets<INFTVaultParams>>(
    {
      [VinciPools.proto]: {
        ...VinciConfig.NFTVaultConfig,
      }
    },
    pool
  );

  export const loadPoolConfig = (configName: ConfigNames): PoolConfiguration => {
    switch (configName) {
      case ConfigNames.Vinci:
        return VinciConfig;
      default:
        throw new Error(
          `Unsupported pool configuration: ${configName} is not one of the supported configs ${Object.values(
            ConfigNames
          )}`
        );
    }
  };

  export const getWethAddress = async (config: IBaseConfiguration) => {
    const currentNetwork = process.env.FORK ? process.env.FORK : DRE.network.name;
    const wethAddress = getParamPerNetwork(config.WETH, <eNetwork>currentNetwork);
    if (wethAddress) {
      return wethAddress;
    }
    if (currentNetwork.includes('main')) {
      throw new Error('WETH not set at mainnet configuration.');
    }
    const weth = await deployWETHMocked();
    return weth.address;
  };

  export const getQuoteCurrency = async (config: IBaseConfiguration) => {
    switch (config.OracleQuoteCurrency) {
      case 'ETH':
      case 'WETH':
        return getWethAddress(config);
      case 'USD':
        return config.ProtocolGlobalParams.UsdAddress;
      default:
        throw `Quote ${config.OracleQuoteCurrency} currency not set. Add a new case to getQuoteCurrency switch`;
    }
  };
  
/*export const getTreasuryAddress = async (config: IBaseConfiguration): Promise<tEthereumAddress> => {
  const currentNetwork = process.env.FORK ? process.env.FORK : DRE.network.name;
  return getParamPerNetwork(config.ReserveFactorTreasuryAddress, <eNetwork>currentNetwork);
};*/