// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {Ownable} from '../../dependencies/openzeppelin/contracts/Ownable.sol';

contract PriceOracle is Ownable {
  mapping(address => uint256) newPrices;

  function setAssetPrice(address _asset, uint256 _price) external onlyOwner {
    newPrices[_asset] = _price;
  }

  function getAssetPrice(address _asset) external view returns (uint256) {
    return newPrices[_asset];
  }
}