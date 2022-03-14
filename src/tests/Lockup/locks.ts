import assert from "assert";
import BN from "bn.js";

import { ForaContract, ForaInstance, MockedLockupInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams } from "@test-utils";
import { lockupParams } from "./constants";

const Fora = artifacts.require("Fora");
const MockedLockup = artifacts.require("MockedLockup");

describe("Method: locks(offset: uint256, limit: uint256) returns(Lock[])", () => {
  const {
    APPROVE_LIMIT,
    CLIFF,
    VESTING
  } = lockupParams;
  let account: string;
  let result: any;
  let locksCount: BN;
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
    for (let i = 0; i < 8; i++) {
      await contract.methods["lock(address,uint256,uint256,uint256)"](
        token.address,
        10 + i,
        CLIFF,
        VESTING
      );
    }
    locksCount = await contract.locksCount();
  });
  describe("When limit > locks count", () => {
    it("should success", async () => {
      result = await contract.locks(0, locksCount.add(new BN(500)));
    });
    it("should result length be equal to locks count", () => {
      assert.strictEqual(result.length, locksCount.toNumber());
    });
    it("should result contains valid objects", async () => {
      for (let i = 0; i < locksCount.toNumber(); i++) {
        let lock = await contract.methods["lock(uint256)"](i);
        assert.strictEqual(lock.token, result[i].token);
        assert.strictEqual(lock.locker, result[i].locker);
        assert.strictEqual(lock.amount, result[i].amount);
        assert.strictEqual(lock.monthlyAmount, result[i].monthlyAmount);
        assert.strictEqual(lock.vesting, result[i].vesting);
        assert.strictEqual(lock.cliff, result[i].cliff);
        assert.strictEqual(lock.withdrawnAmount, result[i].withdrawnAmount);
        assert(lock.lockTimestamp, result[i].lockTimestamp);
      }
    });
  });
  describe("When offset > locks count", () => {
    it("should success", async () => {
      result = await contract.locks(locksCount, 1);
    });
    it("should result length be equal to zero", () =>
      assert.strictEqual(result.length, 0));
  });
  describe("When offset <= locks count; limit < locks count", () => {
    it("should success", async () => {
      result = await contract.locks(1, 1);
    });
    it("should result length be equal to 1", () => {
      assert.strictEqual(result.length, 1);
    });
    it("should result contains valid objects", async () => {
      let lock = await contract.methods["lock(uint256)"](1);
      assert.strictEqual(lock.token, result[0].token);
      assert.strictEqual(lock.locker, result[0].locker);
      assert.strictEqual(lock.amount, result[0].amount);
      assert.strictEqual(lock.monthlyAmount, result[0].monthlyAmount);
      assert.strictEqual(lock.vesting, result[0].vesting);
      assert.strictEqual(lock.cliff, result[0].cliff);
      assert.strictEqual(lock.withdrawnAmount, result[0].withdrawnAmount);
      assert(lock.lockTimestamp, result[0].lockTimestamp);
    });
  });
});
