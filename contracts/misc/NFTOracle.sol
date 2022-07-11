// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {INFTOracle} from '../interfaces/INFTOracle.sol';
import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';

/**
 * @title NFTOracle
 * @author Vinci
 **/
contract NFTOracle is INFTOracle, Ownable {

  // asset address
  mapping (address => uint256) private _addressIndexes;
  address[] private _addressList;
  address private _operator;

  // price
  struct Price {
    uint32 v1;
    uint32 v2;
    uint32 v3;
    uint32 v4;
    uint32 v5;
    uint32 v6;
    uint32 v7;
    uint32 ts;
  }
  Price private _price;
  uint256 private constant PRECISION = 1e18;
  uint256 public maxPriceDeviation = 15 * 1e16;  // 15%
  uint256 public minUpdateTime = 30 * 60; // 30 min

  event SetAssetData(Price record);
  event ChangeOperator(address indexed oldOperator, address indexed newOperator);

  /// @notice Constructor
  /// @param assets The addresses of the assets
  constructor(address[] memory assets) {
    _operator = _msgSender();
    _addAssets(assets);
  }

  function _addAssets(address[] memory addresses) private {
    uint256 index = _addressList.length + 1;
    for (uint256 i = 0; i < addresses.length; i++) {
      address addr = addresses[i];
      if (_addressIndexes[addr] == 0) {
        _addressIndexes[addr] = index;
        _addressList.push(addr);
        index++;
      }
    }
  }

  function operator() external view returns (address) {
    return _operator;
  }

  function getAddressList() external view returns (address[] memory) {
    return _addressList;
  }

  function getIndex(address asset) external view returns (uint256) {
    return _addressIndexes[asset];
  }

  function addAssets(address[] memory assets) external onlyOwner {
    require(assets.length > 0);
    _addAssets(assets);
  }

  function setOperator(address newOperator) external onlyOwner {
    address oldOperator = _operator;
    _operator = newOperator;
    emit ChangeOperator(oldOperator, newOperator);
  }

  function _getPriceByIndex(uint256 index) private view returns(uint256) {
    Price memory cachePrice = _price;
    if (index == 1) {
      return cachePrice.v1;
    } else if (index == 2) {
      return cachePrice.v2;
    } else if (index == 3) {
      return cachePrice.v3;
    } else if (index == 4) {
      return cachePrice.v4;
    } else if (index == 5) {
      return cachePrice.v5;
    } else if (index == 6) {
      return cachePrice.v6;
    } else if (index == 7) {
      return cachePrice.v7;
    }
  }

  function getLatestTimestamp() external view returns (uint256) {
    return uint256(_price.ts);
  }

  // return in Wei
  function getAssetPrice(address asset) external view returns (uint256) {
    uint256 price = _getPriceByIndex(_addressIndexes[asset]);
    return price * 1e14;
  }

  function getNewPrice(
    uint256 latestPrice,
    uint256 currentPrice
  ) private view returns (uint256) {

    if (latestPrice == 0) {
      return currentPrice;
    }

    if (currentPrice == 0 || currentPrice == latestPrice) {
      return latestPrice;
    }

    uint256 percentDeviation;
    if (latestPrice > currentPrice) {
      percentDeviation = ((latestPrice - currentPrice) * PRECISION) / latestPrice;
    } else {
      percentDeviation = ((currentPrice - latestPrice) * PRECISION) / latestPrice;
    }

    if (percentDeviation > maxPriceDeviation) {
      return latestPrice;
    }
    return currentPrice;
  }

  function _setAssetPrice(uint256[7] memory prices) private {
    Price storage cachePrice = _price;
    // checkprice
    cachePrice.v1 = uint32(getNewPrice(cachePrice.v1, prices[0]));
    cachePrice.v2 = uint32(getNewPrice(cachePrice.v2, prices[1]));
    cachePrice.v3 = uint32(getNewPrice(cachePrice.v3, prices[2]));
    cachePrice.v4 = uint32(getNewPrice(cachePrice.v4, prices[3]));
    cachePrice.v5 = uint32(getNewPrice(cachePrice.v5, prices[4]));
    cachePrice.v6 = uint32(getNewPrice(cachePrice.v6, prices[5]));
    cachePrice.v7 = uint32(getNewPrice(cachePrice.v7, prices[6]));
    cachePrice.ts = uint32(block.timestamp);

    emit SetAssetData(cachePrice);
  }

  // set with 1e4
  function batchSetAssetPrice(address[] memory assets, uint256[] memory prices) external {
    require(_operator == _msgSender(), "NFTOracle: caller is not the operator");
    require(assets.length > 0 && assets.length == prices.length);

    if ((block.timestamp - uint256(_price.ts)) < minUpdateTime) {
      return;
    }
    uint256[7] memory newPrices;
    for (uint256 i = 0; i < assets.length; i++) {
      uint256 index = _addressIndexes[assets[i]];
      newPrices[index - 1] = prices[i];
    }
    _setAssetPrice(newPrices);
  }
}
