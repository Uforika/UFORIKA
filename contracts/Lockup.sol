// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Lockup is Ownable {
    using SafeERC20 for IERC20;

    struct Lock {
        IERC20 token;
        address locker;
        uint256 amount;
        uint256 monthlyAmount;
        uint256 vesting;
        uint256 cliff;
        uint256 withdrawAmount;
        uint256 lockTimestamp;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    uint256 constant MONTH = 30 days;

    Lock[] private _locks;

    function lock(uint256 lockId) external view returns (Lock memory) {
        return _locks[lockId];
    }

    function locks(uint256 offset, uint256 limit) external view returns (Lock[] memory locksData) {
        uint256 locksCount_ = locksCount();
        if (offset >= locksCount_) return new Lock[](0);
        uint256 to = offset + limit;
        if (locksCount_ < to) to = locksCount_;
        locksData = new Lock[](to - offset);
        for (uint256 i = 0; i < locksData.length; i++) locksData[i] = _locks[offset + i];
    }

    function locksCount() public view returns (uint256) {
        return _locks.length;
    }

    function possibleToWithdraw(uint256 lockId) public view returns (uint256 possibleToWithdrawAmount) {
        require(lockId < locksCount(), "Invalid lock id");
        Lock memory lock_ = _locks[lockId];
        uint256 closeMonths = (getTimestamp() - lock_.startTimestamp) / MONTH;
        possibleToWithdrawAmount = closeMonths * lock_.monthlyAmount;
        possibleToWithdrawAmount -= lock_.withdrawAmount;
        return possibleToWithdrawAmount;
    }

    event Locked(uint256 indexed lockId, uint256 amount, address locker);
    event Withdrawn(uint256 indexed lockId, uint256 amount, address recipient);

    function lock(address token, uint256 amount, uint256 cliff, uint256 vesting) external onlyOwner returns (bool) {
        require(token != address(0), "Token is zero address");
        require(amount > 0, "Amount is not positive");
        require(vesting > 0, "Vesting is not positive");
        Lock memory lock_;
        lock_.token = IERC20(token);
        lock_.locker = msg.sender;
        lock_.amount = amount;
        lock_.monthlyAmount = amount / vesting;
        lock_.vesting = vesting * MONTH;
        lock_.cliff = cliff * MONTH;
        lock_.lockTimestamp = getTimestamp();
        lock_.startTimestamp = lock_.lockTimestamp + lock_.cliff;
        lock_.endTimestamp = lock_.startTimestamp + lock_.vesting;
        lock_.token.transferFrom(lock_.locker, address(this), amount);
        _locks.push(lock_);
        emit Locked(locksCount(), amount, lock_.locker);
        return true;
    }

    function withdraw(uint256 lockId, uint256 amount, address recipient) external onlyOwner returns (bool) {
        uint256 possibleToWithdraw_ = possibleToWithdraw(lockId);
        require(recipient != address(0), "Recipient is zero address");
        require(possibleToWithdraw_ > 0, "Possible to withdraw is zero");
        require(amount > 0, "Amount is not positive");
        Lock storage lock_ = _locks[lockId];
        if (getTimestamp() >= lock_.endTimestamp && amount >= possibleToWithdraw_) {
            lock_.withdrawAmount = possibleToWithdraw_;
        }
        else {
            lock_.withdrawAmount = amount;
        }
        require(amount <= lock_.withdrawAmount, "Amount is more available");
        lock_.token.transfer(recipient, lock_.withdrawAmount);
        emit Withdrawn(lockId, lock_.withdrawAmount, recipient);
        return true;
    }

    function getTimestamp() internal virtual view returns (uint256) {
        return block.timestamp;
    }
}
