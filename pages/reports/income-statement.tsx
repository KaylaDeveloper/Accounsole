import Layout from "@/components/Layout";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/repository";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import axios from "axios";
import useAlert from "hooks/useAlert";
import fillReportWithData from "utils/fillReportsWithData";
import TableHead from "@/components/reports/TableHead";
import SubAccounts from "@/components/reports/SubAccounts";
import SubCreditAccountsTotal from "@/components/reports/SubCreditAccountsTotal";
import SubDebitAccountsTotal from "@/components/reports/SubDebitAccountsTotal";

export default function IncomeStatement(props: {
  businessDetails: BusinessDetails;
}) {
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [alert, setAlert] = useAlert();
  const [accounts, setAccounts] = useState<AccountsWithOpeningBalances[] | []>(
    []
  );

  const revenueAccounts = accounts.filter(
    (account) => account.type === "Revenue"
  );
  const totalRevenue = revenueAccounts.reduce(
    (acc, account) => acc + (account.credit ?? 0),
    0
  );

  const expenseAccounts = accounts.filter(
    (account) => account.type === "Expense" || account.type === "Direct Costs"
  );
  const totalExpense = expenseAccounts.reduce(
    (acc, account) => acc + (account.debit ?? 0),
    0
  );

  const netProfit = totalRevenue - totalExpense;

  const generateBalanceSheet = async () => {
    await axios
      .post("/api/reports/income-statement", { fromDate, toDate })
      .then((res) => {
        fillReportWithData(setAlert, setAccounts, res);
      })
      .catch((err) => setAlert(err.response.data));
  };

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col sm:flex-row h-full">
        <div className="p-10 flex flex-col basis-1/4 bg-gray-100 h-full">
          <h2 className="mb-4">Income Statement Period</h2>
          <div className="flex ">
            <h3 className="basis-1/3">From:</h3>
            <DatePicker
              selected={fromDate}
              onChange={(date: Date) => setFromDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border-2 px-1 rounded mb-4 flex justify-center basis-2/3"
            />
          </div>
          <div className="flex ">
            <h3 className="basis-1/3">To:</h3>
            <DatePicker
              selected={toDate}
              onChange={(date: Date) => setToDate(date)}
              dateFormat="dd/MM/yyyy"
              className="border-2 px-1 rounded mb-4 flex justify-center basis-2/3"
            />
          </div>
          <button
            onClick={() => generateBalanceSheet()}
            className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue w-fit sm:mt-6"
          >
            Generate Income Statement
          </button>
        </div>
        <div className="basis-3/4 h-full flex flex-col sm:p-10">
          <p className="text-lg">{alert}</p>
          {accounts.length > 0 && (
            <table className="table-auto w-full">
              <TableHead />
              <tbody>
                {revenueAccounts.length > 0 && (
                  <SubAccounts subAccounts={revenueAccounts} />
                )}
                {revenueAccounts.length > 0 && (
                  <SubCreditAccountsTotal
                    title="Total Revenue"
                    subTotal={totalRevenue}
                  />
                )}
                {expenseAccounts.length > 0 && (
                  <SubAccounts subAccounts={expenseAccounts} />
                )}
                {expenseAccounts.length > 0 && (
                  <SubDebitAccountsTotal
                    title="Total Expense"
                    subTotal={totalExpense}
                  />
                )}
                <SubCreditAccountsTotal
                  title="Net Profit"
                  subTotal={netProfit}
                />
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}
export const getServerSideProps = getDefaultServerSideProps();
