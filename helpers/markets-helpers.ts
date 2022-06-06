import {
    eEthereumNetwork,
    iParamsPerNetwork,
    iParamsBuilderPerNetwork,
    tEthereumAddress,
 } from './types';
import {
    ZERO_ADDRESS,
} from './constants';


export const build = <T>(
    param?: iParamsBuilderPerNetwork<T>,
    defaultValue?: any,
): iParamsPerNetwork<T | undefined> => {
    let config = {
        [eEthereumNetwork.localhost]: defaultValue,
        [eEthereumNetwork.vinci]: defaultValue,
        [eEthereumNetwork.kovan]: defaultValue,
        [eEthereumNetwork.hardhat]: defaultValue,
        [eEthereumNetwork.buidlerevm]: defaultValue,
        [eEthereumNetwork.rinkeby]: defaultValue,
        [eEthereumNetwork.mainnet]: defaultValue,
    };
    if (param) {
        for (let [network, value] of Object.entries(param)) {
            config[network] = value;
        };
    };
    return config;
};

export const buildAdmin = <T>(
    param?: iParamsBuilderPerNetwork<T>
): iParamsPerNetwork<T | undefined> => {
    return build(param, undefined);
};


export const buildAssets = <T>(
    param?: iParamsBuilderPerNetwork<T>
): iParamsPerNetwork<T | undefined> => {
    return build(param, {});
};


export const buildAddress = <T>(
    param?: iParamsBuilderPerNetwork<T>
): iParamsPerNetwork<T | undefined> => {
    return build(param, '');
};

export const buildSameAddress = (
    address: tEthereumAddress
): iParamsPerNetwork<tEthereumAddress> => {
    return build({}, address);
};

export const buildWithZeroAddress = <T>(
    param?: iParamsBuilderPerNetwork<T>
): iParamsPerNetwork<T | undefined> => {
    return build(param, ZERO_ADDRESS);
};

export const buildLibrary = <T>(
    param?: iParamsBuilderPerNetwork<T>
): iParamsPerNetwork<T | undefined> => {
    return build(
        param,
        {},
    );
};