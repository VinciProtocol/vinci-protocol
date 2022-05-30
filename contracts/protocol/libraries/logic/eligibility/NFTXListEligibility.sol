// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {UniqueEligibility} from "./UniqueEligibility.sol";
import {NFTXEligibility} from "./NFTXEligibility.sol";

contract NFTXListEligibility is NFTXEligibility, UniqueEligibility {
    uint256 public constant LIST_ELIGIBILITY_REVISION = 0x1;

    function getRevision() internal pure override virtual returns (uint256) {
        return LIST_ELIGIBILITY_REVISION;
    }

    function name() public pure override virtual returns (string memory) {    
        return "List";
    }

    function finalized() public view override virtual returns (bool) {    
        return true;
    }

    function targetAsset() public pure override virtual returns (address) {
        return address(0);
    }

    struct Config {
        uint256[] tokenIds;
    }

    event NFTXEligibilityInit(uint256[] tokenIds);

    function __NFTXEligibility_init_bytes(
        bytes memory _configData
    ) public override virtual initializer {
        (uint256[] memory _ids) = abi.decode(_configData, (uint256[]));
        __NFTXEligibility_init(_ids);
    }

    function __NFTXEligibility_init(
        uint256[] memory tokenIds
    ) public initializer {
        _setUniqueEligibilities(tokenIds, true);
        emit NFTXEligibilityInit(tokenIds);
    }

    function _checkIfEligible(
        uint256 _tokenId
    ) internal view override virtual returns (bool) {
        return isUniqueEligible(_tokenId);
    }
}
