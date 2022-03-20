// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import {LendingPool} from '../protocol/lendingpool/LendingPool.sol';
import {
  LendingPoolAddressesProvider
} from '../protocol/configuration/LendingPoolAddressesProvider.sol';
import {LendingPoolConfigurator} from '../protocol/lendingpool/LendingPoolConfigurator.sol';
import {VToken} from '../protocol/tokenization/VToken.sol';
import {
  DefaultReserveInterestRateStrategy
} from '../protocol/lendingpool/DefaultReserveInterestRateStrategy.sol';
import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';
import {StringLib} from './StringLib.sol';

contract VTokensAndRatesHelper is Ownable {
  address payable private pool;
  address private addressesProvider;
  address private poolConfigurator;
  event deployedContracts(address vToken, address strategy);

  struct InitDeploymentInput {
    address asset;
    uint256[6] rates;
  }

  struct ConfigureReserveInput {
    address asset;
    uint256 baseLTV;
    uint256 liquidationThreshold;
    uint256 liquidationBonus;
    uint256 reserveFactor;
    bool stableBorrowingEnabled;
    bool borrowingEnabled;
  }

  constructor(
    address payable _pool,
    address _addressesProvider,
    address _poolConfigurator
  ) public {
    pool = _pool;
    addressesProvider = _addressesProvider;
    poolConfigurator = _poolConfigurator;
  }

  function initDeployment(InitDeploymentInput[] calldata inputParams) external onlyOwner {
    for (uint256 i = 0; i < inputParams.length; i++) {
      emit deployedContracts(
        address(new VToken()),
        address(
          new DefaultReserveInterestRateStrategy(
            LendingPoolAddressesProvider(addressesProvider),
            inputParams[i].rates[0],
            inputParams[i].rates[1],
            inputParams[i].rates[2],
            inputParams[i].rates[3],
            inputParams[i].rates[4],
            inputParams[i].rates[5]
          )
        )
      );
    }
  }

  function configureReserves(ConfigureReserveInput[] calldata inputParams) external onlyOwner {
    LendingPoolConfigurator configurator = LendingPoolConfigurator(poolConfigurator);
    for (uint256 i = 0; i < inputParams.length; i++) {
      if (inputParams[i].borrowingEnabled) {
        configurator.enableBorrowingOnReserve(
          inputParams[i].asset,
          inputParams[i].stableBorrowingEnabled
        );
      }
      configurator.setReserveFactor(inputParams[i].asset, inputParams[i].reserveFactor);
    }
  }
}
