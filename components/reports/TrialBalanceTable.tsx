import { AccountsWithOpeningBalances } from "services/repository/Repository.ts";
import { totalDebit, totalCredit } from "utils/accountsCalculation";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";
import TableHead from "./TableHead";
import SubAccounts from "./SubAccounts";

export default function TrialBalanceTable(
  accountsWithBalances: AccountsWithOpeningBalances[]
) {
  return (
    <table className="table-auto w-full">
      <TableHead />
      <tbody>
        <SubAccounts subAccounts={accountsWithBalances} />
      </tbody>
      <tfoot>
        <tr className="bg-light-blue">
          <td className="text-left border px-4 py-2">Total</td>
          <td className="text-right border px-4 py-2">
            {turnNumberIntoAudFormat(totalDebit(accountsWithBalances))}
          </td>
          <td className="text-right border px-4 py-2">
            {turnNumberIntoAudFormat(totalCredit(accountsWithBalances))}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
