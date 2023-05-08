import { AccountsWithOpeningBalances } from "services/repository/repository";

export function totalDebit(accounts: AccountsWithOpeningBalances[]) {
  return accounts.reduce((acc, curr) => acc + (curr.debit ?? 0), 0);
}

export function totalCredit(accounts: AccountsWithOpeningBalances[]) {
  return accounts.reduce((acc, curr) => acc + (curr.credit ?? 0), 0);
}

export function getOnlyAccountsWithBalances(
  accounts: AccountsWithOpeningBalances[]
) {
  return accounts.filter(
    (formatedAccount) =>
      (formatedAccount.debit !== null && formatedAccount.debit !== 0) ||
      (formatedAccount.credit !== null && formatedAccount.credit !== 0)
  );
}
