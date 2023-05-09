import {
  creditBalanceAccounts,
  debitBalanceAccounts,
  TrialBalanceAccounts,
} from "@/pages/reports/trial-balance";
import { AxiosResponse } from "axios";
import { SetStateAction } from "react";
import { AccountsWithOpeningBalances } from "../services/repository/Repository";

export default function fillReportWithData(
  setAlert: (value: SetStateAction<string>) => void,
  setAccounts: (
    value: SetStateAction<[] | AccountsWithOpeningBalances[]>
  ) => void,
  res: AxiosResponse<any, any>
) {
  if (res.data.accountsWithBalances.length === 0) {
    setAccounts([]);
    setAlert("No accounts found for this date.");
  }

  const accounts = res.data.accountsWithBalances.map(
    (account: TrialBalanceAccounts): AccountsWithOpeningBalances => {
      return {
        ...account,
        debit: debitBalanceAccounts.includes(account.type)
          ? Number((account.debit - account.credit).toFixed(2))
          : null,
        credit: creditBalanceAccounts.includes(account.type)
          ? Number((account.credit - account.debit).toFixed(2))
          : null,
      };
    }
  );
  setAccounts(accounts);
}
