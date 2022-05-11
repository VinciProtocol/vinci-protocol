import { IVinciConfigurationMAYC, eEthereumNetwork } from '../../helpers/types';

import { CommonsConfig } from './commons';
import {
  strategyDAI,
  strategyWETH,
} from './reservesConfigs';

import {
  strategyMAYC,
} from './NFTVaultConfigs';

// ----------------
// POOL--SPECIFIC PARAMS
// ----------------

export const MAYCConfig: IVinciConfigurationMAYC = {
    ...CommonsConfig,
    MarketId: 'VinciMAYC',
    ProviderId: 2,
    ReservesConfig: {
      DAI: strategyDAI,
      WETH: strategyWETH,
    },
    NFTVaultConfig:{
      MAYC: strategyMAYC,
    },
    ReserveAssets: {
      [eEthereumNetwork.localhost]: {},
      [eEthereumNetwork.vinci]: {
        DAI: '0x8Feeec88D4de57FCd7EFd588ea2eE093C95275f7',
        WETH: '0x4601c3b62d25eBD50942244CCF8759CeEB682F08',
      },
      [eEthereumNetwork.hardhat]: {},
      [eEthereumNetwork.buidlerevm]: {},
      [eEthereumNetwork.kovan]: {
        //AAVE: '0xB597cd8D3217ea6477232F9217fa70837ff667Af',
        //BAT: '0x2d12186Fbb9f9a8C28B3FfdD4c42920f8539D738',
        //BUSD: '0x4c6E1EFC12FDfD568186b7BAEc0A43fFfb4bCcCf',
        //DAI: '0xFf795577d9AC8bD7D90Ee22b6C1703490b6512FD',
        //ENJ: '0xC64f90Cd7B564D3ab580eb20a102A8238E218be2',
        //KNC: '0x3F80c39c0b96A0945f9F0E9f55d8A8891c5671A8',
        //LINK: '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789',
        //MANA: '0x738Dc6380157429e957d223e6333Dc385c85Fec7',
        //MKR: '0x61e4CAE3DA7FD189e52a4879C7B8067D7C2Cc0FA',
        //REN: '0x5eebf65A6746eed38042353Ba84c8e37eD58Ac6f',
        //SNX: '0x7FDb81B0b8a010dd4FFc57C3fecbf145BA8Bd947',
        //SUSD: '0x99b267b9D96616f906D53c26dECf3C5672401282',
        //TUSD: '0x016750AC630F711882812f24Dba6c95b9D35856d',
        //UNI: '0x075A36BA8846C6B6F53644fDd3bf17E5151789DC',
        //USDC: '0xe22da380ee6B445bb8273C81944ADEB6E8450422',
        //USDT: '0x13512979ADE267AB5100878E2e0f485B568328a4',
        //WBTC: '0xD1B98B6607330172f1D991521145A22BCe793277',
        WETH: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        //YFI: '0xb7c325266ec274fEb1354021D27FA3E3379D840d',
        //ZRX: '0xD0d76886cF8D952ca26177EB7CfDf83bad08C00C',
      },
    },
    NFTVaultAssets: {
      [eEthereumNetwork.localhost]: {},
      [eEthereumNetwork.vinci]: {
        MAYC: '0x9C1662728bf05f73fC55cf9dc0bb6ed75221CC4b',
      },
      [eEthereumNetwork.kovan]: {
        MAYC: '0x5c8b3055B9F7FBEFb3F71ca6a8754DE6973646E0',
      },
      [eEthereumNetwork.hardhat]: {},
      [eEthereumNetwork.buidlerevm]: {},
    }
  };
  
  export default MAYCConfig;