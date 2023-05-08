import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";

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
      <td className="border px-4 py-2 font-black">
        {turnNumberIntoAudFormat(subTotal)}
      </td>
      <td className="border px-4 py-2 font-black"></td>
    </tr>
  );
}
