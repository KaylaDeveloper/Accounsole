import {
  AccountsWithOpeningBalances,
  BankBalances,
} from "services/repository/Repository";

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
      debit: Number(account.debit ?? 0) + Number(bankBalance?.debit ?? 0),
      credit: Number(account.credit ?? 0) + Number(bankBalance?.credit ?? 0),
    };
  });
  return bankAccounts;
}
