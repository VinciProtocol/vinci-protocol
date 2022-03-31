// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {NFTXEligibility} from "./NFTXEligibility.sol";

contract NFTXAllowAllEligibility is NFTXEligibility {

    function name() public pure override virtual returns (string memory) {    
        return "AllowAll";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return address(0);
    }

    event NFTXEligibilityInit();

    function __NFTXEligibility_init_bytes(
        bytes memory configData
    ) public override virtual initializer {
        __NFTXEligibility_init();
    }

    // Parameters here should mirror the config struct. 
    function __NFTXEligibility_init(
    ) public initializer {
        emit NFTXEligibilityInit();
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        return true;
    }
}
