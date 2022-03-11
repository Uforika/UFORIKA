declare module "config" {
  export interface Token {
    readonly DEPLOY: string,
    PARAMS: {
      readonly NAME: string,
      readonly SYMBOL: string,
      readonly AMOUNT: string,
    }
  }

  export const INFURA_KEY: string;
  export const PRIVATE_KEY: string;
  export const POLYGONSCAN_KEY: string;
  export const MIGRATION_DIRECTORY: string;
  export const GAS_PRICE: number | string;
  export const TOKEN: Token;
}
