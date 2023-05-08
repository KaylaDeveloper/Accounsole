import axios from "axios";
import { FormEvent, useState } from "react";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";
import Link from "next/link";
import useAlert from "hooks/useAlert";

export default function BankAccount(props: {
  bankAccountId: number;
  bankAccountName: string;
  bankBalance: number;
}) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [alert, setAlert] = useAlert();
  const [bankBalance, setBankBalance] = useState<number>(props.bankBalance);

  const handleUploadCsv = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setAlert("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("csvFile", file);
    formData.append("bankAccountName", props.bankAccountName);

    await axios
      .post("/api/bank/uploadCsv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        setAlert("File uploaded successfully.");
        setBankBalance(bankBalance + res.data.totalAmount);
      })
      .catch((err) => setAlert(err.response.data));
  };

  return (
    <div className="border-2 flex flex-col p-4 gap-4 items-center relative">
      <h1 className="text-md font-semibold text-gray-700 hover:underline transition-underline duration-300 py-1 px-4 ">
        <Link
          href={`/bank/${props.bankAccountId}-${props.bankAccountName}?type=allTransactions`}
        >
          {props.bankAccountName}
        </Link>
      </h1>
      <p className="text-sm absolute top-9 whitespace-nowrap">{alert}</p>
      <p>
        {"Current Balance: "}
        {turnNumberIntoAudFormat(bankBalance)}
      </p>
      <Link
        href={`/bank/${props.bankAccountId}-${props.bankAccountName}?type=unreconciledTransactions`}
        className="border border-gray-300 py-1 px-4 rounded-lg hover:bg-gray-100 transition-colors duration-300"
      >
        Reconcile Transactions
      </Link>
      <form
        onSubmit={(e) => {
          handleUploadCsv(e);
        }}
        className="text-gray-700 flex flex-col  gap-1"
      >
        <label htmlFor="csvFile" className="font-medium">
          Import Bank Transactions(.csv):
        </label>
        <Link
          className="text-sm text-gray-700 hover:text-gray-900 underline"
          href="/api/bank/downloadCsvTemplate"
        >
          Download CSV Template
        </Link>
        <input
          type="file"
          name="csvFile"
          id="csvFile"
          onChange={(e) => setFile(e.target.files?.[0])}
          className="text-sm  focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
        />
        <button
          type="submit"
          className="py-1 px-2 bg-primary-color rounded hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-primary-color focus:ring-opacity-50 mt-1 transition-colors duration-300"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
