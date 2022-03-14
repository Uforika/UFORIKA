import assert from "assert";
import BN from "bn.js";

import { ForaContract, ForaInstance, MockedLockupInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams } from "@test-utils";
import { lockupParams } from "./constants";


const MockedLockup = artifacts.require("MockedLockup");
const Fora = artifacts.require("Fora");

describe("When there are two lockup", () => {
  const {
    APPROVE_LIMIT,
    AMOUNT,
    CLIFF,
    MONTH,
    VESTING
  } = lockupParams;
  let contract: MockedLockupInstance;
  let token: ForaInstance;
  let account: string;
  let monthlyAmountOne: BN;
  let monthlyAmountTwo: BN;
  before(async () => {
    [account] = getAccounts();
    let defaultParams = await getDefaultConstructorParams();
    token = await Fora.new(...(defaultParams as Parameters<ForaContract["new"]>));
    contract = await MockedLockup.new();
    await token.approve(contract.address, APPROVE_LIMIT);
    await contract.methods["lock(address,uint256,uint256,uint256)"](
      token.address,
      "3333333333333333333333333333",
      CLIFF,
      VESTING
    );
    await contract.methods["lock(address,uint256,uint256,uint256)"](
      token.address,
      "9999999999999999999999999999",
      CLIFF,
      VESTING)
    ;
    monthlyAmountOne = (await contract.methods["lock(uint256)"]("0"))
      .monthlyAmount;
    monthlyAmountTwo = (await contract.methods["lock(uint256)"]("1"))
      .monthlyAmount;
    await contract.increaseTime(MONTH.add(CLIFF.mul(MONTH)));
    for (let i = 0; i < VESTING.toNumber(); i++) {
      await contract.withdraw(0, AMOUNT, account);
      await contract.withdraw(1, AMOUNT, account);
      await contract.increaseTime(MONTH);
    }
  });
  it("should balance equal to expected", async () => {
    let balance = await token.balanceOf(contract.address);
    assert.strictEqual(balance.toString(10), "0");
  });
});
