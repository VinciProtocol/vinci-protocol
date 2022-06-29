// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

import {INFTOracle} from '../interfaces/INFTOracle.sol';
import {Ownable} from '../dependencies/openzeppelin/contracts/Ownable.sol';

/**
 * @title NFTOracle
 * @author Vinci
 **/
contract NFTOracle is INFTOracle, Ownable {

  // batch update
  struct Input {
    uint64[4] prices;
    address[4] addresses;
    uint64 id;
  }

  // asset address
  struct Location {
    uint64 id;
    uint64 index;
  }
  mapping (address => Location) internal locations;
  address[] internal addressList;
  uint64 internal locationId;
  uint64 internal locationIndex;

  // price
  struct Price {
    uint64 v1;
    uint64 v2;
    uint64 v3;
    uint64 v4;
  }
  mapping (uint256 => Price) internal prices;

  /// @notice Constructor
  /// @param assets The addresses of the assets
  constructor(address[] memory assets) public {
    _addAssets(assets);
  }

  function _addAssets(address[] memory addresses) internal {
    uint64 id = locationId;
    uint64 index = locationIndex;
    for (uint256 i = 0; i < addresses.length; i++) {
      address _asset = addresses[i];
      Location memory cacheLocation = locations[_asset];
      if (cacheLocation.id == 0) {
        if (index >= 4) {
          index = 0;
          id++;
        }
        index++;
        addressList.push(_asset);
        cacheLocation.id = id + 1;
        cacheLocation.index = index;
        locations[_asset] = cacheLocation;
        emit AddAsset(_asset, id + 1, index);
      }
    }
    locationId = id;
    locationIndex = index;
  }

  function getAddressList() external view returns(address[] memory) {
    return addressList;
  }

  function getLocation(address _asset) external view returns (uint64, uint64) {
    Location memory cacheLocation = locations[_asset];
    return (cacheLocation.id, cacheLocation.index);
  }

  function _setAssetPrice(address _asset, uint64 _price) internal {
    Location memory location = locations[_asset];
    Price storage price = prices[location.id];
    if (location.index == 1) {
      price.v1 = _price;
    } else if (location.index == 2) {
      price.v2 = _price;
    } else if (location.index == 3) {
      price.v3 = _price;
    } else if (location.index == 4) {
      price.v4 = _price;
    }
  }

  function _setAllPrice(uint256 _id, uint64[4] memory _prices) internal {
    Price storage price = prices[_id];
    price.v1 = _prices[0];
    price.v2 = _prices[1];
    price.v3 = _prices[2];
    price.v4 = _prices[3];
  }

  function addAssets(address[] memory _assets) external onlyOwner {
    _addAssets(_assets);
  }

  function batchSetAssetPrice(Input[] calldata input) external onlyOwner {
    for (uint256 i = 0; i < input.length; i++) {
      Input memory cacheInput = input[i];
      uint64[4] memory _prices = cacheInput.prices;
      _setAllPrice(cacheInput.id, _prices);
      emit BatchSetAssetData(cacheInput.addresses, _prices, block.timestamp);
    }
  }

  // set in GWei
  function setAssetPriceInGwei(address _asset, uint64 _price) external onlyOwner {
    _setAssetPrice(_asset, _price);
    emit SetAssetData(_asset, _price, block.timestamp);
  }

  // return in Wei
  function getAssetPrice(address _asset) public view virtual returns (uint256) {
    Location memory location = locations[_asset];
    Price storage price = prices[location.id];
    uint256 _price;
    if (location.index == 1) {
      _price = price.v1;
    } else if (location.index == 2) {
      _price = price.v2;
    } else if (location.index == 3) {
      _price = price.v3;
    } else if (location.index == 4) {
      _price = price.v4;
    }
    return _price * 1e9;
  }
}
