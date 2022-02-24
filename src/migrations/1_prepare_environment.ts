import config from "config";
import { inspect } from "util";
import { Network } from "@utils";

export = async function (_deployer, _network: Network) {
  console.log(inspect(config, false, null, true));
  if ([Network.MAINNET].includes(_network)) {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 3e3));
    return;
  }
} as Migration;
