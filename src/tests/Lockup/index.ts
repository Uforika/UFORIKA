import { setAccounts } from "@test-utils";

contract("Lockup", (accounts) => {
  before(() => setAccounts(accounts));
  require("./lock");
  require("./withdraw");
  require("./locks");
  require("./lockup_period");
});
