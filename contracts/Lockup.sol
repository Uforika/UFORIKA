// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Contract for lockup token
 * @notice You can use this contract for lockup and withdraw token
 */
contract Lockup is Ownable {
    using SafeERC20 for IERC20;

    struct Lock {
        IERC20 token;
        uint256 amount;
        uint256 monthlyAmount;
        uint256 vesting;
        uint256 cliff;
        uint256 withdrawnAmount;
        uint256 lockTimestamp;
        uint256 startTimestamp;
        uint256 endTimestamp;
    }

    uint256 private constant MONTH = 30 days;

    Lock[] private _locks;

    /**
    * @notice Returns lockup state
    * @param lockId Id existing lockup
    */
    function lock(uint256 lockId) external view returns (Lock memory) {
        return _locks[lockId];
    }

    /**
    * @notice Returns array lockup states
    * @param offset Output start lockup
    * @param limit Count existing lockup
    */
    function locks(uint256 offset, uint256 limit) external view returns (Lock[] memory locksData) {
        uint256 locksCount_ = locksCount();
        if (offset >= locksCount_) return new Lock[](0);
        uint256 to = offset + limit;
        if (locksCount_ < to) to = locksCount_;
        locksData = new Lock[](to - offset);
        for (uint256 i = 0; i < locksData.length; i++) locksData[i] = _locks[offset + i];
    }

    /**
    * @notice Returns count existing lockup
    * @dev Returns length array lockup state
    */
    function locksCount() public view returns (uint256) {
        return _locks.length;
    }

    /**
    * @notice Returns count possible to withdraw token
    * @param lockId Id existing lockup
    */
    function possibleToWithdraw(uint256 lockId) public view returns (uint256 possibleToWithdrawAmount) {
        require(lockId < locksCount(), "Invalid lock id");
        Lock memory lock_ = _locks[lockId];
        uint256 timestamp = getTimestamp();
        if (timestamp > lock_.startTimestamp && timestamp < lock_.endTimestamp) {
            uint256 closeMonths = (timestamp - lock_.startTimestamp) / MONTH;
            possibleToWithdrawAmount = closeMonths * lock_.monthlyAmount;
            possibleToWithdrawAmount -= lock_.withdrawnAmount;
        } else if (timestamp >= lock_.endTimestamp) {
            possibleToWithdrawAmount = lock_.amount - lock_.withdrawnAmount;
        }
    }

    event Locked(uint256 indexed lockId, uint256 amount, address locker);
    event Withdrawn(uint256 indexed lockId, uint256 amount, address recipient);

    /**
     * @notice Method for lockup token
     * @param token Address existing token
     * @param amount Amount token for lockup
     * @param cliff Delay before starting vesting token period
     * @param cliff Vesting token period
     * @return boolean value indicating whether the operation succeeded
     * Emits a {Locked} event
     *
     * Requirements:
     *
     * - `token` cannot be the zero
     * - `amount` cannot be the zero
     * - `vesting` cannot be the zero
     */
    function lock(address token, uint256 amount, uint256 cliff, uint256 vesting) external onlyOwner returns (bool) {
        require(token != address(0), "Token is zero address");
        require(amount > 0, "Amount is zero");
        require(vesting > 0, "Vesting is zero");
        address caller = msg.sender;
        Lock memory lock_;
        lock_.token = IERC20(token);
        lock_.amount = amount;
        lock_.monthlyAmount = amount / vesting;
        lock_.vesting = vesting * MONTH;
        lock_.cliff = cliff * MONTH;
        lock_.lockTimestamp = getTimestamp();
        lock_.startTimestamp = lock_.lockTimestamp + lock_.cliff;
        lock_.endTimestamp = lock_.startTimestamp + lock_.vesting;
        lock_.token.safeTransferFrom(caller, address(this), amount);
        _locks.push(lock_);
        emit Locked(locksCount() - 1, amount, caller);
        return true;
    }

    /**
     * @notice Method for withdraw unlock token
     * @param lockId Id existing lockup
     * @param amount Amount token for withdraw
     * @param recipient Recipient of the token
     * @return boolean value indicating whether the operation succeeded
     * Emits a {Withdrawn} event
     *
     * NOTE: doesn't withdraw if lockId non-existent
     *       or caller isn't owner contract
     *       or the period has not passed
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero
     * - `possibleToWithdraw_` cannot be the zero
     * - `amount` cannot be the zero
     * - `amount` cannot be less than or equal to possibleToWithdraw_
     */
    function withdraw(uint256 lockId, uint256 amount, address recipient) external onlyOwner returns (bool) {
        uint256 possibleToWithdraw_ = possibleToWithdraw(lockId);
        uint256 withdrawAmount;
        require(recipient != address(0), "Recipient is zero address");
        require(possibleToWithdraw_ > 0, "Possible to withdraw is zero");
        require(amount > 0, "Amount is zero");
        Lock storage lock_ = _locks[lockId];
        if (amount > possibleToWithdraw_) {
            lock_.withdrawnAmount += possibleToWithdraw_;
            withdrawAmount = possibleToWithdraw_;
        } else {
            lock_.withdrawnAmount += amount;
            withdrawAmount = amount;
        }
        lock_.token.safeTransfer(recipient, withdrawAmount);
        emit Withdrawn(lockId, withdrawAmount, recipient);
        return true;
    }

    /**
     * @notice Returns current timestamp
     */
    function getTimestamp() internal virtual view returns (uint256) {
        return block.timestamp;
    }
}
