// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../dependencies/openzeppelin/contracts/IERC1155.sol";

interface IERC1155Stat is IERC1155 {
    function balanceOf(address user) external view returns (uint256);
    function balanceOfBatch(address user, uint256[] calldata ids) external view returns (uint256[] memory);
    function totalSupply() external view returns (uint256);
    function totalSupply(uint256 tokenId) external view returns (uint256);
    function totalSupplyBatch(uint256[] calldata tokenIds) external view returns (uint256[] memory);

    function totalHolders(uint256 tokenId) external view returns (uint256);
    function holdersByToken(uint256 tokenId) external view returns (address[] memory);
    function tokensByAccount(address account) external view returns (uint256[] memory);
    /**
     * @dev Returns the scaled balance of the user and the scaled total supply.
     * @param user The address of the user
     * @return The scaled balance of the user
     * @return The scaled balance and the scaled total supply
     **/
    function getUserBalanceAndSupply(address user) external view returns (uint256, uint256);
}
