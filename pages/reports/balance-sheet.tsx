import Layout from "@/components/Layout";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/Repository.ts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from "react";
import axios from "axios";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";
import useAlert from "hooks/useAlert";
import fillReportWithData from "utils/fillReportsWithData";
import TableHead from "@/components/reports/TableHead";
import SubAccounts from "@/components/reports/SubAccounts";
import SubDebitAccountsTotal from "@/components/reports/SubDebitAccountsTotal";
import SubCreditAccountsTotal from "@/components/reports/SubCreditAccountsTotal";

export default function BalanceSheet(props: {
  businessDetails: BusinessDetails;
}) {
  const [date, setDate] = useState<Date>(new Date());
  const [alert, setAlert] = useAlert();
  const [accounts, setAccounts] = useState<AccountsWithOpeningBalances[] | []>(
    []
  );
  const currentAssetAccounts = accounts.filter(
    (account) =>
      account.type === "Bank" ||
      account.type === "Inventory" ||
      account.type === "Current Asset"
  );
  const nonCurrentAssetAccounts = accounts.filter(
    (account) =>
      account.type === "Non-Current Asset" || account.type === "Fixed Asset"
  );
  const assets = accounts.filter(
    (account) =>
      account.type === "Bank" ||
      account.type === "Inventory" ||
      account.type === "Current Asset" ||
      account.type === "Non-Current Asset" ||
      account.type === "Fixed Asset"
  );
  const totalAssets = assets.reduce(
    (acc, account) => acc + (account.debit ?? 0),
    0
  );

  const currentLiabilityAccounts = accounts.filter(
    (account) => account.type === "Current Liability"
  );
  const nonCurrentLiabilityAccounts = accounts.filter(
    (account) => account.type === "Non-Current Liability"
  );
  const liabilities = accounts.filter(
    (account) =>
      account.type === "Current Liability" ||
      account.type === "Non-Current Liability"
  );
  const totalLiabilities = liabilities.reduce(
    (acc, account) => acc + (account.credit ?? 0),
    0
  );

  const equityAccountsWithoutRetainedEarnings = accounts.filter(
    (account) =>
      account.type === "Equity" && account.name !== "Retained Earnings"
  );
  const totalEquityAccountsWithoutRetainedEarnings =
    equityAccountsWithoutRetainedEarnings.reduce(
      (acc, account) => acc + (account.credit ?? 0),
      0
    );
  const retainedEarningsAccount =
    totalAssets - totalLiabilities - totalEquityAccountsWithoutRetainedEarnings;

  const generateBalanceSheet = async () => {
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
          <h2 className="">Balance sheet date:</h2>
          <DatePicker
            selected={date}
            onChange={(date: Date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border-2 px-1 rounded mb-4 flex justify-center"
          />
          <button
            onClick={() => generateBalanceSheet()}
            className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue w-fit sm:mt-6"
          >
            Generate Balance Sheet
          </button>
        </div>
        <div className="basis-3/4 h-full flex flex-col sm:p-10">
          <p className="text-lg">{alert}</p>
          {accounts.length > 0 && (
            <table className="table-auto w-full">
              <TableHead />
              <tbody>
                {currentAssetAccounts.length > 0 && (
                  <SubAccounts subAccounts={currentAssetAccounts} />
                )}
                {currentAssetAccounts.length > 0 && (
                  <SubDebitAccountsTotal
                    title="Total Current Assets"
                    subTotal={currentAssetAccounts.reduce(
                      (acc, account) => acc + (account.debit || 0),
                      0
                    )}
                  />
                )}
                {nonCurrentAssetAccounts.length > 0 && (
                  <SubAccounts subAccounts={nonCurrentAssetAccounts} />
                )}
                {nonCurrentAssetAccounts.length > 0 && (
                  <SubDebitAccountsTotal
                    title="Total Non-Current Assets"
                    subTotal={nonCurrentAssetAccounts.reduce(
                      (acc, account) => acc + (account.debit || 0),
                      0
                    )}
                  />
                )}
                {assets.length > 0 && (
                  <SubDebitAccountsTotal
                    title="Total Assets"
                    subTotal={totalAssets}
                  />
                )}
                {currentLiabilityAccounts.length > 0 && (
                  <SubAccounts subAccounts={currentLiabilityAccounts} />
                )}
                {currentLiabilityAccounts.length > 0 && (
                  <SubCreditAccountsTotal
                    title="Total Current Liabilities"
                    subTotal={currentLiabilityAccounts.reduce(
                      (acc, account) => acc + (account.credit || 0),
                      0
                    )}
                  />
                )}
                {nonCurrentLiabilityAccounts.length > 0 && (
                  <SubAccounts subAccounts={nonCurrentLiabilityAccounts} />
                )}
                {nonCurrentLiabilityAccounts.length > 0 && (
                  <SubCreditAccountsTotal
                    title=" Total Non-Current Liabilities"
                    subTotal={nonCurrentLiabilityAccounts.reduce(
                      (acc, account) => acc + (account.credit || 0),
                      0
                    )}
                  />
                )}
                {liabilities.length > 0 && (
                  <SubCreditAccountsTotal
                    title="Total Liabilities"
                    subTotal={totalLiabilities}
                  />
                )}
                {equityAccountsWithoutRetainedEarnings.length > 0 && (
                  <SubAccounts
                    subAccounts={equityAccountsWithoutRetainedEarnings}
                  />
                )}
                <tr>
                  <td className="text-left border px-4 py-2 ">
                    Retained Earnings
                  </td>
                  <td className="text-left border px-4 py-2">{null}</td>
                  <td className="text-left border px-4 py-2 ">
                    {turnNumberIntoAudFormat(retainedEarningsAccount)}
                  </td>
                </tr>

                <SubCreditAccountsTotal
                  title="Total Equity"
                  subTotal={
                    totalEquityAccountsWithoutRetainedEarnings +
                    retainedEarningsAccount
                  }
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
