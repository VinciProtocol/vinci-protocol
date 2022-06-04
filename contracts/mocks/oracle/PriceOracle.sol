// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {IPriceOracle} from '../../interfaces/IPriceOracle.sol';
import {Ownable} from '../../dependencies/openzeppelin/contracts/Ownable.sol';

contract PriceOracle is IPriceOracle, Ownable {
  mapping(address => uint256) prices;
  uint256 ethPriceUsd;

  event AssetPriceUpdated(address _asset, uint256 _price, uint256 timestamp);
  event EthPriceUpdated(uint256 _price, uint256 timestamp);

  function getAssetPrice(address _asset) external view override returns (uint256) {
    return prices[_asset];
  }

  function setAssetPrice(address _asset, uint256 _price) external override onlyOwner {
    prices[_asset] = _price;
    emit AssetPriceUpdated(_asset, _price, block.timestamp);
  }

  function getEthUsdPrice() external view returns (uint256) {
    return ethPriceUsd;
  }

  function setEthUsdPrice(uint256 _price) external onlyOwner {
    ethPriceUsd = _price;
    emit EthPriceUpdated(_price, block.timestamp);
  }
}
