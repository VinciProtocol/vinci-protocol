// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {NFTXEligibility} from "./NFTXEligibility.sol";

interface KittyCore {
    function ownerOf(uint256 _tokenId) external view returns (address owner);
    function getKitty(uint256 _id) external view returns (bool,bool,uint256 _cooldownIndex,uint256,uint256,uint256,uint256,uint256,uint256 _generation,uint256);
}

contract NFTXGen0FastKittyEligibility is NFTXEligibility {
    uint256 public constant GEN_0_FAST_ELIGIBILITY_REVISION = 0x1;

    function getRevision() internal pure override virtual returns (uint256) {
        return GEN_0_FAST_ELIGIBILITY_REVISION;
    }

    function name() public pure override virtual returns (string memory) {    
        return "Gen0FastKitty";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return 0x06012c8cf97BEaD5deAe237070F9587f8E7A266d;
    }

    event NFTXEligibilityInit();

    function __NFTXEligibility_init_bytes(
        bytes memory /* configData */
    ) public override virtual initializer {
        __NFTXEligibility_init();
    }

    // Parameters here should mirror the config struct. 
    function __NFTXEligibility_init() public initializer {
        emit NFTXEligibilityInit();
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        (,,uint256 _cooldownIndex,,,,,,uint256 _generation,) = KittyCore(targetAsset()).getKitty(_tokenId);
        return _cooldownIndex == 0 && _generation == 0;
    }
}
