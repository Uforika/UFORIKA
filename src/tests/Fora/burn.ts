import { ForaContract, ForaInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams } from "@test-utils";
import BN from "bn.js";
import { lockupParams } from "../Lockup/constants";
import { testReject } from "solowei";

const Fora = artifacts.require("Fora");

describe("Method: burn(uint256 amount) returns (bool)", () => {
  const { AMOUNT } = lockupParams;
  const INVALID_VALUE = "0";
  let contract: ForaInstance;
  let defaultParams: string[];
  let account: string;
  before(async () => {
    [account] = getAccounts();
    defaultParams = await getDefaultConstructorParams();
    contract = await Fora.new(...(defaultParams as Parameters<ForaContract["new"]>));
  });
  describe("When amount is not positive", () => {
    testReject(() => contract.burn(INVALID_VALUE),
      "Amount is zero"
    );
  });
  describe("When all parameters is correct", () => {
    let balanceBefore: BN;
    before(async () => {
      balanceBefore = await contract.balanceOf(account);
    });
    it("should success", async () => {
      await contract.burn(AMOUNT);
    });
    it("should balance account equal to expected", async () => {
      const balance = await contract.balanceOf(account);
      assert.strictEqual(balanceBefore.toString(10), balance.add(new BN(AMOUNT)).toString(10));
    });
  });
});
