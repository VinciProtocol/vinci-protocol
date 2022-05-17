import { eContractid, INFTVaultParams } from '../../helpers/types';

export const strategyBAYC: INFTVaultParams = {
  name: 'BoredApeYachtClub',
  symbol: 'BAYC',
  baseLTVAsCollateral: '8000',
  liquidationThreshold: '8250',
  liquidationBonus: '10500',
  nTokenImpl: eContractid.NToken,
  lockdropExpiration: '0',
};
