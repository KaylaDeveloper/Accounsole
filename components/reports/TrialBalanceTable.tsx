import { AccountsWithOpeningBalances } from "services/repository/Repository";
import { totalDebit, totalCredit } from "utils/accountsCalculation";
import formatMoney from "utils/formatMoney";
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
            {formatMoney(totalDebit(accountsWithBalances))}
          </td>
          <td className="text-right border px-4 py-2">
            {formatMoney(totalCredit(accountsWithBalances))}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
