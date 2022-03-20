// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

interface IParaSwapAugustusRegistry {
  function isValidAugustus(address augustus) external view returns (bool);
}
