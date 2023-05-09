import Layout from "@/components/Layout";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/Repository";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { useState } from "react";
import axios from "axios";
import TrialBalanceTable from "@/components/reports/TrialBalanceTable";
import useAlert from "hooks/useAlert";
import fillReportWithData from "utils/fillReportsWithData";

export type TrialBalanceAccounts = {
  id: number;
  name: string;
  type: string;
  debit: number;
  credit: number;
};

export const debitBalanceAccounts = [
  "Bank",
  "Direct Costs",
  "Expense",
  "Inventory",
  "Current Asset",
  "Non-Current Asset",
  "Fixed Asset",
];
export const creditBalanceAccounts = [
  "Revenue",
  "Current Liability",
  "Non-Current Liability",
  "Equity",
];

export default function TrialBalance(props: {
  businessDetails: BusinessDetails;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [alert, setAlert] = useAlert();

  const [accounts, setAccounts] = useState<AccountsWithOpeningBalances[] | []>(
    []
  );

  const generateTrialBalance = async () => {
    await axios
      .post("/api/reports/trial-balance", { date })
      .then((res) => {
        fillReportWithData(setAlert, setAccounts, res);
      })
      .catch((err) => setAlert(err.response.data));
  };

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col sm:flex-row h-full">
        <div className="p-10 flex flex-col basis-1/4 bg-gray-100 h-full">
          <h2>Trial balance date:</h2>
          <DatePicker
            selected={date}
            onChange={(date: Date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border-2 px-1 rounded mb-4 flex justify-center"
          />
          <button
            onClick={() => generateTrialBalance()}
            className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue w-fit sm:mt-6"
          >
            Generate Trial Balance
          </button>
        </div>
        <div className="basis-3/4 h-full flex flex-col sm:p-10">
          <p className="text-lg">{alert}</p>
          {accounts.length > 0 && TrialBalanceTable(accounts)}
        </div>
      </div>
    </Layout>
  );
}
export const getServerSideProps = getDefaultServerSideProps();
