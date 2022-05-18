pragma solidity 0.8.11;

import {TimeLockableNToken} from './TimeLockableNToken.sol';
import {DataTypes} from '../libraries/types/DataTypes.sol';

contract TimeLockableNTokenForTest is TimeLockableNToken {

  function lock(uint256 tokenId, uint16 lockType) public virtual override onlyLendingPool
  {
    uint40[6] memory lock_days = [uint40(0), 60, 120, 180, 300, 360 * 24 * 3600];
    require(lockType < lock_days.length, "NToken: Unknown lockType.");
    require(_exists(tokenId), "NToken: lock for nonexistent token.");
    uint40 expirationTime = 0;
    if(lockType != 0){
      expirationTime = uint40(block.timestamp) + lock_days[lockType];
      _locks[tokenId] = DataTypes.TimeLock(expirationTime, lockType);
    }
    emit TimeLocked(tokenId, lockType, expirationTime);
  }
}