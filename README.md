# Lockup SmartContracts

This repo will have a code of lockup smartcontracts.

## Config files

Config files used by scripts: `default.json`, `development.json`, `production.json` and `local.json`
​
`local.json` override all other config files

## Config and node types

In `/config` directory create needed config file and update all config variables

#### Deployment config ####

```
{
  "INFURA_KEY": "",
  "PRIVATE_KEY": "",
  "POLYGONSCAN_KEY": "",
  "MIGRATION_DIRECTORY": "",
  "GAS_PRICE": "",
  "TOKEN": {
    "DEPLOY": "",
    "PARAMS": {
      "NAME": "",
      "SYMBOL": "",
      "AMOUNT": ""
    }
  }
}
```

#### Migration ####

```bash
# Install packages
$ yarn
# Compile contracts
$ yarn compile
# Testnet
$ yarn migrate:testnet
# Mainnet
$ yarn migrate:mainnet
# Verify contracts testnet
$ yarn verify:testnet <CONTRACT_NAME>
# Verify contracts mainnet
$ yarn verify:mainnet <CONTRACT_NAME>
```

### Tests

For tests running it's needed to pre install and run [ganache-cli](https://github.com/trufflesuite/ganache-cli)

```bash
yarn test
```

For coverage:

```bash
yarn coverage
```

### CONTRACT METHODS ###

    Getters:
    1. lock - Get the lockup state
    2. locks - Get all the lockup states
    3. locksCount - Get locks count
    4. possibleToWithdraw - Get count possible to withdraw token

    External: 
    1. lock - lock token. (Maybe only owner)
        Conditions:
            1. Token is not zero address
            2. amount > 0
            3. vesting > 0
    2. withdraw - withdraw token. (Maybe only owner)
        Conditions:
            1. recipient is not zero address
            2. possibleToWithdraw_ > 0
            3. amount > 0
            4. amount <= possibleToWithdraw_
    