import { Network } from "@utils";

const Lockup = artifacts.require("Lockup");

export = async function(_deployer, _network: Network) {
  await _deployer.deploy(Lockup);
} as Migration;
