import { eContractid, INFTVaultParams } from '../../helpers/types';

import {
    rateStrategyBAYC,
  } from './rateStrategies';

export const strategyBAYC: INFTVaultParams = {
  name: 'BAYC',
  symbol: 'BAYC',
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8250',
  liquidationBonus: '10500',
  nTokenImpl: eContractid.NToken,
  lockdropExpiration: '1672502400', // 2023-01-01 0:00:00
};
