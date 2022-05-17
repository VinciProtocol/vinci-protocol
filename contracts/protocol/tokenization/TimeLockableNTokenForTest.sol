pragma solidity 0.8.11;

import {TimeLockableNToken} from './TimeLockableNToken.sol';

contract TimeLockableNTokenForTest is TimeLockableNToken {

  function lock(uint256 tokenId, uint16 lockType) public virtual override onlyLendingPool
  {
    uint40[6] memory lock_days = [uint40(0), uint40(60), uint40(120), uint40(180), uint40(300), uint40(360 * 24 * 3600)];
    require(lockType < lock_days.length, "NToken: Unknown lockType.");
    // solidium-disable-next-line
    uint40 expirationTime = uint40(block.timestamp) + lock_days[lockType];
    _unlockTime[tokenId] = expirationTime;
    emit TimeLocked(tokenId, lockType, expirationTime);
  }
}