// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.8.11;

contract MockAggregator {
  int256 private _latestAnswer;
  uint8 private _decimals;

  event AnswerUpdated(int256 indexed current, uint256 indexed roundId, uint256 timestamp);

  constructor(int256 _initialAnswer, uint8 _initDecimals) public {
    _latestAnswer = _initialAnswer;
    _decimals = _initDecimals;
    emit AnswerUpdated(_initialAnswer, 0, block.timestamp);
  }

  function latestAnswer() external view returns (int256) {
    return _latestAnswer;
  }

  function getTokenType() external view returns (uint256) {
    return 1;
  }

  function decimals() external view returns (uint8) {
    return _decimals;
  }

  // function getSubTokens() external view returns (address[] memory) {
  // TODO: implement mock for when multiple subtokens. Maybe we need to create diff mock contract
  // to call it from the migration for this case??
  // }
}
