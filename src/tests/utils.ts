let accounts: string[] = [];

export const setAccounts = (_accounts: string[]) => (accounts = _accounts);
export const getAccounts = () => accounts;

type ConstructorParams = {
  name_: string;
  symbol_: string;
  amount_: string;
};

export async function getDefaultConstructorParams(
  override?: Partial<ConstructorParams>
): Promise<string[]> {

  let obj: Object = {
    name_: "FORA",
    symbol_: "FORA",
    amount_: "7000000008",
    ...override
  };
  return Object.values(obj);
}
