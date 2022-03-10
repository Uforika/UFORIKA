// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;
pragma experimental ABIEncoderV2;

import "../Lockup.sol";

contract MockedLockup is Lockup {
    uint256 public mockedTimestamp;

    constructor() {
        mockedTimestamp = block.timestamp;
    }

    function increaseTime(uint256 count) external returns (bool) {
        mockedTimestamp += count;
        return true;
    }

    function getTimestamp() internal override(Lockup) view returns (uint256) {
        return mockedTimestamp;
    }
}
