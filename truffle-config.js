const HDWalletProvider = require("@truffle/hdwallet-provider");
const { INFURA_KEY, PRIVATE_KEY, POLYGONSCAN_KEY, MIGRATION_DIRECTORY, GAS_PRICE } = require("config");

const gasPrice = GAS_PRICE * 10 ** 9;

module.exports = {
  migrations_directory: MIGRATION_DIRECTORY,
  networks: {
    development: { host: "127.0.0.1", network_id: "*", port: 8545, confirmations: 0, skipDryRun: true, gasPrice },
    mainnet: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`),
      network_id: 137,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: gasPrice
    },
    testnet: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`),
      network_id: 80001,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: true,
      gasPrice: gasPrice
    },
  },
  compilers: {
    solc: {
      version: "0.8.11",
      docker: false,
      settings: { optimizer: { enabled: true, runs: 200 }, evmVersion: "constantinople" },
    },
  },
  plugins: ["solidity-coverage", "truffle-plugin-verify"],
  api_keys: { polygonscan: POLYGONSCAN_KEY },
  mocha: { reporter: 'eth-gas-reporter', reporterOptions: { currency: "USD" } },
};
