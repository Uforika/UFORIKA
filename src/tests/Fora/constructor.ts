import { testReject } from "solowei";
import { ForaContract, ForaInstance } from "@contracts";
import { getAccounts, getDefaultConstructorParams } from "@test-utils";
import BN from "bn.js";

const Fora = artifacts.require("Fora");

describe("Constructor", () => {
  const INVALID_VALUE: string = "0";
  let contract: ForaInstance;
  let defaultParams: string[];
  let account: string;
  describe("When amount is not positive", () => {
    before(async () => {
      [account] = getAccounts();
      defaultParams = await getDefaultConstructorParams({ amount_: INVALID_VALUE });
    });
    testReject(() => Fora.new(...(defaultParams as Parameters<ForaContract["new"]>)),
      "Amount is not positive"
    );
  });
  describe("When all parameters is correct", () => {
    let totalSupply: BN;
    before(async () => {
      defaultParams = await getDefaultConstructorParams();
      contract = await Fora.new(...(defaultParams as Parameters<ForaContract["new"]>));
      totalSupply = await contract.totalSupply();
    });
    it("should success", async () => {
      await Fora.new(...(defaultParams as Parameters<ForaContract["new"]>));
    });
    it("should balance account equal to expected", async () => {
      const balance = await contract.balanceOf(account);
      assert.strictEqual(totalSupply.toString(10), balance.toString(10));
    });
  });
});
