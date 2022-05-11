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
};
