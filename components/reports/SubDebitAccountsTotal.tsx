import formatMoney from "utils/formatMoney";

export default function SubDebitAccountsTotal({
  title,
  subTotal,
}: {
  title: string;
  subTotal: number;
}) {
  return (
    <tr>
      <td className="border px-4 py-2 font-black">{title}</td>
      <td className="border px-4 py-2 font-black">{formatMoney(subTotal)}</td>
      <td className="border px-4 py-2 font-black"></td>
    </tr>
  );
}
