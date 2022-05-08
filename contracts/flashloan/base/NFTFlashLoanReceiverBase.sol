// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {SafeMath} from '../../dependencies/openzeppelin/contracts/SafeMath.sol';
import {IERC721} from '../../dependencies/openzeppelin/contracts/IERC721.sol';
import {SafeERC721} from '../../protocol/libraries/helpers/SafeERC721.sol';
import {INFTFlashLoanReceiver} from '../interfaces/INFTFlashLoanReceiver.sol';
import {ILendingPoolAddressesProvider} from '../../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPool} from '../../interfaces/ILendingPool.sol';

abstract contract NFTFlashLoanReceiverBase is INFTFlashLoanReceiver {
  using SafeMath for uint256;
  using SafeERC721 for IERC721;

  ILendingPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
  ILendingPool public immutable override LENDING_POOL;

  constructor(ILendingPoolAddressesProvider provider) {
    ADDRESSES_PROVIDER = provider;
    LENDING_POOL = ILendingPool(provider.getLendingPool());
  }
}
