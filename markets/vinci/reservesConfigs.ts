import { eContractid, IReserveParams } from '../../helpers/types';

import {
    rateStrategyStableTwo,
    rateStrategyETH,
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

export const strategyETH: IReserveParams = {
  name: 'ETH',
  symbol: 'ETH',
  strategy: rateStrategyETH,
  baseLTVAsCollateral: '0',
  liquidationThreshold: '0',
  liquidationBonus: '0',
  borrowingEnabled: false,
  stableBorrowRateEnabled: false,
  reserveDecimals: '18',
  vTokenImpl: eContractid.VToken,
  reserveFactor: '1000',
};

