import { AccountsWithOpeningBalances } from "services/repository/Repository";
import formatMoney from "utils/formatMoney";

export default function SubAccounts({
  subAccounts,
}: {
  subAccounts: AccountsWithOpeningBalances[];
}) {
  return (
    <>
      {subAccounts.map((account) => (
        <tr key={account.id}>
          <td className="text-left border px-4 py-2">{account.name}</td>
          <td className="text-right border px-4 py-2">
            {account.debit ? formatMoney(account.debit) : null}
          </td>
          <td className="text-right border px-4 py-2">
            {account.credit ? formatMoney(account.credit) : null}
          </td>
        </tr>
      ))}
    </>
  );
}
