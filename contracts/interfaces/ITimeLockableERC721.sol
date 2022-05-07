pragma solidity 0.8.11;

import {IERC721} from '../dependencies/openzeppelin/contracts/IERC721.sol';

interface ITimeLockableERC721 is IERC721 {
  event TimeLocked(
    address indexed user,
    uint256 indexed tokenid,
    uint256 lockType
  );

  function lock(uint256 tokenid, uint16 lockType) external;

  function getUnlockTime(address user, uint256 tokenId) external returns(uint256 unlockTime);

  function unlockedBalanceOfBatch(address user, uint256[] memory tokenIds) external returns(uint256[] memory amounts);
}