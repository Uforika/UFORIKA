import { Network } from "@utils";

const Lockup = artifacts.require("Lockup");

const MockedLockup = artifacts.require("MockedLockup");

export = async function(_deployer, _network: Network) {
  if ([Network.MAINNET].includes(_network)) {
    await _deployer.deploy(Lockup);
  } else {
    await _deployer.deploy(MockedLockup);
  }
} as Migration;
