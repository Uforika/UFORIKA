import assert from "assert";
import BN from "bn.js";
import { testReject } from "solowei";

import { ForaContract, ForaInstance, MockedLockupInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams } from "@test-utils";
import { AllEvents, Withdrawn } from "@contracts/MockedLockup";
import { lockupParams } from "./constants";

const MockedLockup = artifacts.require("MockedLockup");
const Fora = artifacts.require("Fora");

describe("Method: withdraw(uint256 lockId, uint256 amount, address recipient) returns (bool)", () => {
  const {
    INVALID_VALUE,
    ZERO_ADDRESS,
    APPROVE_LIMIT,
    CLIFF,
    VESTING,
    AMOUNT,
    MONTHLY_AMOUNT,
    MONTH
  } = lockupParams;
  let contract: MockedLockupInstance;
  let defaultParams: string[];
  let token: ForaInstance;
  let account: string;
  let id = 0;
  before(async () => {
    [account] = getAccounts();
    defaultParams = await getDefaultConstructorParams();
    token = await Fora.new(
      ...(defaultParams as Parameters<ForaContract["new"]>)
    );
    contract = await MockedLockup.new();
    await token.approve(contract.address, APPROVE_LIMIT);
    await contract.methods["lock(address,uint256,uint256,uint256)"](
      token.address,
      AMOUNT,
      CLIFF,
      VESTING
    );
  });
  describe("When recipient is zero address", () => {
    testReject(
      () => contract.withdraw(id, MONTHLY_AMOUNT, ZERO_ADDRESS),
      "Recipient is zero address"
    );
  });
  describe("When possible to withdraw is zero", () => {
    testReject(
      () => contract.withdraw(id, MONTHLY_AMOUNT, account),
      "Possible to withdraw is zero"
    );
  });
  describe("When token already withdrawn", () => {
    before(async () => {
      await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
      await contract.withdraw(id, MONTHLY_AMOUNT, account);
    });
    testReject(
      () => contract.withdraw(id, MONTHLY_AMOUNT, account),
      "Possible to withdraw is zero"
    );
  });
  describe("When amount is zero", () => {
    before(async () => {
      await contract.increaseTime(MONTH);
    });
    testReject(
      () => contract.withdraw(id, INVALID_VALUE, account),
      "Amount is zero"
    );
  });
  describe("When all conditions are good", () => {
    let withdraw: Truffle.TransactionResponse<AllEvents>;
    it("should success", async () => {
      await contract.withdraw(
        id,
        MONTHLY_AMOUNT.div(new BN(2)),
        account
      );
      await contract.withdraw(
        id,
        MONTHLY_AMOUNT.div(new BN(2)),
        account
      );
    });
    describe("Should balance recipient equal expected", () => {
      let balanceBefore: BN;
      let balanceAfter: BN;
      before(async () => {
        id++;
        await contract.methods["lock(address,uint256,uint256,uint256)"](
          token.address,
          AMOUNT,
          CLIFF,
          VESTING
        );
        balanceBefore = await token.balanceOf(account);
        await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
        await contract.withdraw(id, MONTHLY_AMOUNT, account);
        balanceAfter = await token.balanceOf(account);
      });
      it("balance should equal to expected", () => {
        assert.strictEqual(
          balanceAfter.toString(10),
          balanceBefore.add(MONTHLY_AMOUNT).toString(10)
        );
      });
    });
    describe("When amount > possibleToWithdraw", () => {
      let possibleToWithdraw: BN;
      let balanceBefore: BN;
      let balanceAfter: BN;
      before(async () => {
        id++;
        await contract.methods["lock(address,uint256,uint256,uint256)"](
          token.address,
          AMOUNT,
          CLIFF,
          VESTING
        );
        await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
        possibleToWithdraw = await contract.possibleToWithdraw(id);
        balanceBefore = await token.balanceOf(account);
        await contract.withdraw(id, AMOUNT, account);
        balanceAfter = await token.balanceOf(account);
      });
      it("balance should equal to expected", () => {
        assert.strictEqual(
          balanceAfter.toString(10),
          balanceBefore.add(possibleToWithdraw).toString(10)
        );
      });
    });
    describe("When amount < possibleToWithdraw", () => {
      let possibleToWithdraw: BN;
      let balanceBefore: BN;
      let balanceAfter: BN;
      before(async () => {
        id++;
        await contract.methods["lock(address,uint256,uint256,uint256)"](
          token.address,
          AMOUNT,
          CLIFF,
          VESTING
        );
        await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
        possibleToWithdraw = await contract.possibleToWithdraw(id);
        balanceBefore = await token.balanceOf(account);
        await contract.withdraw(id, possibleToWithdraw.sub(new BN(99999)), account);
        balanceAfter = await token.balanceOf(account);
      });
      it("balance should equal to expected", () => {
        assert.strictEqual(
          balanceAfter.toString(10),
          balanceBefore.add(possibleToWithdraw.sub(new BN(99999))).toString(10)
        );
      });
    });
    describe("When withdraw in two months", () => {
      let possibleToWithdrawBefore: BN;
      let possibleToWithdrawAfter: BN;
      let balanceBefore: BN;
      let balanceAfter: BN;
      before(async () => {
        id++;
        await contract.methods["lock(address,uint256,uint256,uint256)"](
          token.address,
          AMOUNT,
          CLIFF,
          VESTING
        );
        await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
        await contract.increaseTime(MONTH.mul(new BN(2)));
        possibleToWithdrawBefore = await contract.possibleToWithdraw(id);
        balanceBefore = await token.balanceOf(contract.address);
        await contract.withdraw(id, possibleToWithdrawBefore, account);
        balanceAfter = await token.balanceOf(contract.address);
        possibleToWithdrawAfter = await contract.possibleToWithdraw(id);
      });
      it("possibleToWithdrawBefore should equal to expected", () => {
        assert.strictEqual(
          possibleToWithdrawBefore.toString(10),
          MONTHLY_AMOUNT.mul(new BN(3)).toString(10)
        );
      });
      it("possibleToWithdrawAfter should equal to expected", () => {
        assert.strictEqual(possibleToWithdrawAfter.toString(10), "0");
      });
      it("should contract balance equal to expected", () => {
        assert.strictEqual(
          balanceBefore.toString(10),
          balanceAfter.add(MONTHLY_AMOUNT.mul(new BN(3))).toString(10)
        );
      });
    });
    describe("When full lockup period check", () => {
      let balance: BN;
      let balanceAfter: BN;
      before(async () => {
        id = 0;
        let token = await Fora.new(
          ...(defaultParams as Parameters<ForaContract["new"]>)
        );
        contract = await MockedLockup.new();
        await token.approve(contract.address, APPROVE_LIMIT);
        await contract.methods["lock(address,uint256,uint256,uint256)"](
          token.address,
          AMOUNT,
          CLIFF,
          VESTING
        );
        balanceAfter = await token.balanceOf(contract.address);
        await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
        for (let i = 0; i < VESTING.toNumber(); i++) {
          withdraw = await contract.withdraw(id, MONTHLY_AMOUNT, account);
          await contract.increaseTime(MONTH);
        }
        balance = await token.balanceOf(contract.address);
      });
      it("balance should equal to expected", () => {
        assert.strictEqual(balanceAfter.toString(10), AMOUNT);
        assert.strictEqual(balance.toString(10), "0");
      });
    });
    describe("Should emit event Withdrawn", () => {
      let WithdrawnEvent: Truffle.TransactionLog<Withdrawn>;
      describe("Event Withdrawn", () => {
        before(async () => {
          WithdrawnEvent = withdraw.logs[0] as Truffle.TransactionLog<Withdrawn>;
        });
        it("with event name equal to expected", () => {
          assert.strictEqual(WithdrawnEvent.event, "Withdrawn");
        });
        it("with 'lockId' equal to expected", () => {
          assert.strictEqual(WithdrawnEvent.args.lockId.toNumber(), id);
        });
        it("with 'recipient' equal to expected", () => {
          assert.strictEqual(WithdrawnEvent.args.recipient, account);
        });
      });
    });
  });
});
