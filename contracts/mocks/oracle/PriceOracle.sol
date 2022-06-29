// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {NFTOracle} from '../../misc/NFTOracle.sol';

contract PriceOracle is NFTOracle {
  mapping(address => uint256) newPrices;

  constructor(address[] memory assets) NFTOracle(assets) public {
  }

  function setAssetPrice(address _asset, uint256 _price) external onlyOwner {
    newPrices[_asset] = _price;

    _setAssetPrice(_asset, uint64(_price / 1e9));
  }

  function getAssetPrice(address _asset) public view virtual override returns (uint256) {
    super.getAssetPrice(_asset);
    return newPrices[_asset];
  }
}