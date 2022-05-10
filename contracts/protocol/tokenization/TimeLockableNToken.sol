pragma solidity 0.8.11;

import {NToken} from './NToken.sol';

contract TimeLockableNToken is NToken {
  mapping(uint256 => uint256) private _unlockTime;

  function lock(uint256 tokenId, uint16 lockType) public virtual override onlyLendingPool
  {
    uint16[6] memory lock_days = [0, 60, 90, 120, 240, 360];
    require(lockType < lock_days.length, "NToken: Unknown lockType.");
    uint256 expirationTime = block.timestamp + uint256(lock_days[lockType]) * 24 * 3600;
    _unlockTime[tokenId] = expirationTime;
    emit TimeLocked(tokenId, lockType, expirationTime);
  }

  function getUnlockTime(uint256 tokenId) public view virtual override returns(uint256 unlockTime)
  {
    require(_exists(tokenId), "NToken: query unlock time for nonexistent token");
    return _unlockTime[tokenId];
  }

  function unlockedBalanceOfBatch(address user, uint256[] calldata tokenIds) public view virtual override returns(uint256[] memory amounts)
  {
    uint256[] memory amounts = new uint256[](tokenIds.length);
    uint256 now = block.timestamp;
    for(uint256 i = 0; i < tokenIds.length; ++i){
        if(now > _unlockTime[tokenIds[i]]){
            amounts[i] = 1;
        } else {
            amounts[i] = 0;
        }
    }
    return amounts;
  }

  function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        if (to == address(0)) {
            if (_unlockTime[tokenId] != 0){
                delete _unlockTime[tokenId];
            }
        }
        super._beforeTokenTransfer(from, to, tokenId);
    }
}