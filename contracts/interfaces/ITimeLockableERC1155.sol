pragma solidity 0.8.11;

import {IERC1155} from '../dependencies/openzeppelin/contracts/IERC1155.sol';

interface ITimeLockableERC1155 is IERC1155 {
  event TimeLocked(
    address indexed user,
    uint256 indexed tokenid,
    uint256 amount,
    uint256 lockType
  );

  function lock(address user, uint256 tokenid, uint256 amount, uint256 lockType) external;

  function getUnlockTime(address user, uint256 tokenId) external returns(uint256[] memory amounts, uint256[] memory unlockTime);

  function unlockedBalanceOfBatch(address user, uint256[] memory tokenIds) external returns(uint256[] memory amounts);
}