// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../dependencies/openzeppelin/contracts/IERC1155.sol";

interface IERC1155Metadata is IERC1155 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}
