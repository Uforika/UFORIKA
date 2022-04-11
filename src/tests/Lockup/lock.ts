import assert from "assert";
import BN from "bn.js";
import { testReject } from "solowei";

import { MockedLockupInstance, ForaContract, ForaInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams, getTimestamp } from "@test-utils";
import { AllEvents, Locked } from "@contracts/MockedLockup";
import { lockupParams } from "./constants";

const MockedLockup = artifacts.require("MockedLockup");
const Fora = artifacts.require("Fora");

describe("Method: lock(address token, uint256 amount, uint256 cliff, uint256 vesting) returns (bool)", () => {
  const {
    INVALID_VALUE,
    ZERO_ADDRESS,
    APPROVE_LIMIT,
    CLIFF,
    VESTING,
    AMOUNT,
    MONTH
  } = lockupParams;
  const ID = "0";
  let account: string;
  let token: ForaInstance;
  let contract: MockedLockupInstance;
  before(async () => {
    [account] = getAccounts();
    let defaultParams = await getDefaultConstructorParams();
    token = await Fora.new(
      ...(defaultParams as Parameters<ForaContract["new"]>)
    );
    contract = await MockedLockup.new();
    await token.approve(contract.address, APPROVE_LIMIT);
  });
  describe("When token is zero address", () => {
    testReject(
      () => contract.methods["lock(address,uint256,uint256,uint256)"](
        ZERO_ADDRESS,
        AMOUNT,
        CLIFF,
        VESTING
      ),
      "Token is zero address"
    );
  });
  describe("When amount is zero", () => {
    testReject(
      () => contract.methods["lock(address,uint256,uint256,uint256)"](
        token.address,
        INVALID_VALUE,
        CLIFF,
        VESTING
      ),
      "Amount is zero"
    );
  });
  describe("When vesting is zero", () => {
    testReject(
      () => contract.methods["lock(address,uint256,uint256,uint256)"](
        token.address,
        AMOUNT,
        CLIFF,
        INVALID_VALUE
      ),
      "Vesting is zero"
    );
  });
  describe("When all conditions are good", () => {
    let lock: Truffle.TransactionResponse<AllEvents>;
    let timestamp: number;
    it("should success", async () => {
      lock = await contract.methods["lock(address,uint256,uint256,uint256)"](
        token.address,
        AMOUNT,
        CLIFF,
        VESTING
      );
      timestamp = await getTimestamp(web3);
    });
    describe("When should transfer token from caller to contract", () => {
      let balance: BN;
      before(async () => {
        balance = await token.balanceOf(contract.address);
      });
      it("balance contract equal to expected", () => {
        assert.strictEqual(balance.toString(10), AMOUNT);
      });
    });
    describe("When should be create lockup", () => {
      let lock: any;
      before(async () => {
        lock = await contract.methods["lock(uint256)"]("0");
      });
      it("should all params equal to expected", async () => {
        assert.strictEqual(lock.token, token.address);
        assert.strictEqual(lock.amount, AMOUNT);
        assert.strictEqual(
          lock.monthlyAmount,
          new BN(AMOUNT).div(VESTING).toString(10)
        );
        assert.strictEqual(
          lock.vesting,
          VESTING.mul(MONTH).toString(10)
        );
        assert.strictEqual(
          lock.cliff,
          CLIFF.mul(MONTH).toString(10)
        );
        assert.strictEqual(lock.withdrawnAmount, ID);
        assert(
          lock.lockTimestamp < timestamp
          && lock.lockTimestamp > timestamp - 15
        );
      });
    });
    describe("Should emit event Locked", () => {
      let LockedEvent: Truffle.TransactionLog<Locked>;
      describe("Event Locked", () => {
        before(async () => {
          LockedEvent = lock.logs[0] as Truffle.TransactionLog<Locked>;
        });
        it("with event name equal to expected", () => {
          assert.strictEqual(LockedEvent.event, "Locked");
        });
        it("with 'lockId' equal to expected", () => {
          assert.strictEqual(LockedEvent.args.lockId.toString(10), ID);
        });
        it("with 'amount' equal to expected", () => {
          assert.strictEqual(LockedEvent.args.amount.toString(10), AMOUNT);
        });
        it("with 'locker' equal to expected", () => {
          assert.strictEqual(LockedEvent.args.locker, account);
        });
      });
    });
  });
});
