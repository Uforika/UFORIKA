import { setAccounts } from "@test-utils";

contract("Fora", (accounts) => {
  before(() => setAccounts(accounts));
  require("./constructor");
});
