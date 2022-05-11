import { eContractid, IReserveParams } from '../../helpers/types';

import {
    rateStrategyStableTwo,
    rateStrategyWETH,
  } from './rateStrategies';

export const strategyDAI: IReserveParams = {
  name: 'DAI',
  symbol: 'DAI',
  strategy: rateStrategyStableTwo,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  vTokenImpl: eContractid.VToken,
  reserveFactor: '1000',
};

export const strategyWETH: IReserveParams = {
  name: 'WETH',
  symbol: 'WETH',
  strategy: rateStrategyWETH,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: true,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  vTokenImpl: eContractid.VToken,
  reserveFactor: '1000',
};

