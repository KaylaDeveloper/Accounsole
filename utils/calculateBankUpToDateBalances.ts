import {
  AccountsWithOpeningBalances,
  BankBalances,
} from "services/repository/repository";

export default function calculateBankUpToDateBalances(
  accountsWithOpeningBalances: AccountsWithOpeningBalances[],
  bankBalances: BankBalances[] | []
): AccountsWithOpeningBalances[] {
  const bankAccountsWithOpeningBalances =
    accountsWithOpeningBalances.filter((account) => account.type === "Bank") ??
    [];

  if (bankBalances.length === 0) return bankAccountsWithOpeningBalances;

  const bankAccounts = bankAccountsWithOpeningBalances.map((account) => {
    const bankBalance = bankBalances.find(
      (bankBalance) => bankBalance.name === account.name
    );
    return {
      ...account,
      debit: account.debit ?? 0 + (bankBalance?.debit ?? 0),
      credit: account.credit ?? 0 + (bankBalance?.credit ?? 0),
    };
  });
  return bankAccounts;
}
