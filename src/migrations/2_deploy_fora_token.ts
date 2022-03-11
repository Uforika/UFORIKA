import { Network } from "@utils";
import { TOKEN } from "config";

const Fora = artifacts.require("Fora");

export = async function(_deployer, _network: Network) {
  if (TOKEN.DEPLOY) {
    await _deployer.deploy(
      Fora,
      TOKEN.PARAMS.NAME,
      TOKEN.PARAMS.SYMBOL,
      TOKEN.PARAMS.AMOUNT
    );
  }
} as Migration;
