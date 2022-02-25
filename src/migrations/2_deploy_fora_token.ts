import { Network } from "@utils";
import { TOKEN } from "config";

const Fora = artifacts.require("Fora");

export = async function(_deployer, _network: Network) {
  await _deployer.deploy(
    Fora,
    TOKEN.NAME,
    TOKEN.SYMBOL,
    TOKEN.AMOUNT
  );
} as Migration;
