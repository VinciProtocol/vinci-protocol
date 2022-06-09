// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

interface IPunkGateway {
  function depositPunk(
    address lendingPool,
    uint256[] calldata punkIndices,
    uint256[] calldata amounts,
    address onBehalfOf,
    uint16 referralCode
  ) external;

  function depositAndLockPunk(
    address lendingPool,
    uint256[] calldata punkIndices,
    uint256[] calldata amounts,
    address onBehalfOf,
    uint16 lockType,
    uint16 referralCode
  ) external;

  function withdrawPunk(
    address lendingPool,
    uint256[] calldata punkIndices,
    uint256[] calldata amounts,
    address to
  ) external;
}
