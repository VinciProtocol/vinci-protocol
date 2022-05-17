import { eContractid, INFTVaultParams } from '../../helpers/types';

export const strategyMAYC: INFTVaultParams = {
  name: 'BoredApeYachtClub',
  symbol: 'MAYC',
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8250',
  liquidationBonus: '10500',
  nTokenImpl: eContractid.NToken,
  lockdropExpiration: '0',
};
