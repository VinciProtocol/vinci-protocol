// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {ILendingPool} from '../../interfaces/ILendingPool.sol';
import {IDelegationToken} from '../../interfaces/IDelegationToken.sol';
import {Errors} from '../libraries/helpers/Errors.sol';
import {VToken} from './VToken.sol';

/**
 * @title Aave VToken enabled to delegate voting power of the underlying asset to a different address
 * @dev The underlying asset needs to be compatible with the COMP delegation interface
 * @author Aave
 */
contract DelegationAwareVToken is VToken {
  modifier onlyPoolAdmin {
    require(
      _msgSender() == ILendingPool(_pool).getAddressesProvider().getPoolAdmin(),
      Errors.CALLER_NOT_POOL_ADMIN
    );
    _;
  }

  /**
   * @dev Delegates voting power of the underlying asset to a `delegatee` address
   * @param delegatee The address that will receive the delegation
   **/
  function delegateUnderlyingTo(address delegatee) external onlyPoolAdmin {
    IDelegationToken(_underlyingAsset).delegate(delegatee);
  }
}
