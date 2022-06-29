// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

/************
@title INFTOracle interface
@notice Interface for the NFT price oracle.*/
interface INFTOracle {

  event OracleUpdaterChange(address newOracleUpdater);
  event SetAssetData(address indexed asset, uint64 price, uint256 timestamp);
  event BatchSetAssetData(address[4] addresses,  uint64[4] prices, uint256 timestamp);
  event AddAsset(address indexed asset, uint64 id, uint64 index);

  /***********
    @dev returns the nft asset price in wei
     */
  function getAssetPrice(address asset) external view returns (uint256);

  /***********
    @dev returns the addresses of the assets
  */
  function getAddressList() external view returns(address[] memory);

  /***********
    @dev returns the location of the asset
  */
  function getLocation(address _asset) external view returns (uint64, uint64);
}
