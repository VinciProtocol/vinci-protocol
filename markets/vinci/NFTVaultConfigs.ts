import { eContractid, INFTVaultParams } from '../../helpers/types';

import {
    rateStrategyCRYPTOPANDA,
  } from './rateStrategies';

export const strategyCRYPTOPANDA: INFTVaultParams = {
  name: 'CRYPTOPANDA',
  symbol: 'CRYPTOPANDA',
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8250',
  liquidationBonus: '10500',
  nTokenImpl: eContractid.NToken,
};
