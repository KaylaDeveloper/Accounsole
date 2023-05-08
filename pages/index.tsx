import Layout from "@/components/Layout";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import Repository, { BusinessDetails } from "services/repository/repository";
import React from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import UserHome from "@/components/UserHome";

const date = new Date();
const year = date.getFullYear();
const month =
  date.getMonth() + 1 < 10
    ? `0${date.getMonth() + 1}`
    : `${date.getMonth() + 1}`;

export const allMonths = [
  { month: "07", fromDate: `${year - 1}-07-01`, toDate: `${year - 1}-07-31` },
  { month: "08", fromDate: `${year - 1}-08-01`, toDate: `${year - 1}-08-31` },
  { month: "09", fromDate: `${year - 1}-09-01`, toDate: `${year - 1}-09-31` },
  { month: "10", fromDate: `${year - 1}-10-01`, toDate: `${year - 1}-10-31` },
  { month: "11", fromDate: `${year - 1}-11-01`, toDate: `${year - 1}-11-31` },
  { month: "12", fromDate: `${year - 1}-12-01`, toDate: `${year - 1}-12-31` },
  { month: "01", fromDate: `${year}-01-01`, toDate: `${year}-01-31` },
  { month: "02", fromDate: `${year}-02-01`, toDate: `${year}-02-31` },
  { month: "03", fromDate: `${year}-03-01`, toDate: `${year}-03-31` },
  { month: "04", fromDate: `${year}-04-01`, toDate: `${year}-04-31` },
  { month: "05", fromDate: `${year}-05-01`, toDate: `${year}-05-31` },
  { month: "06", fromDate: `${year}-06-01`, toDate: `${year}-06-31` },
];

const index = allMonths.findIndex((m) => m.month === month);

const months = allMonths.slice(0, index + 1);

export default function Home(props: {
  businessDetails: BusinessDetails;
  monthlyExpenses: number[];
  monthlyIncome: number[];
}) {
  if (!props.businessDetails) {
    return (
      <Layout>
        <div className="py-10 px-6 flex flex-col gap-16 items-center bg-gray-100">
          <div className="flex flex-col gap-6 items-center w-full">
            <div className="flex flex-col gap-6 items-center w-200">
              <h1 className="text-2xl font-bold">Your Home </h1>
              <p>Stay on top of your business&apos;s income and expenses</p>
              <p>Be reminded of your next due date</p>
              <Image
                src="/pics/home/home.png"
                alt="home page"
                width={1000}
                height={500}
                priority
                className="w-full rounded"
              />
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center w-full">
            <h1 className="text-2xl font-bold">Your Bank </h1>
            <div className="flex flex-col gap-6 items-center">
              <p>Start by adding your business&apos; bank accounts</p>
              <p>Simply import your bank transactions and start to reconcile</p>
              <p>
                You can also click the bank name to check the details of all
                your bank transactions
              </p>
              <div className="w-200">
                <Image
                  src="/pics/bank/bank3.png"
                  alt="add bank account and import bank transactions"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
              <p>
                Choose the account to allocate your bank transaction and select
                GST{" "}
              </p>
              <div className="w-200">
                <Image
                  src="/pics/bank/bank1.png"
                  alt="Choose the account to allocate your bank transaction and select
                GST"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
              <p>
                You can also split your bank transactions and allocate one bank
                transaction into different accounts
              </p>
              <div className="w-200">
                <Image
                  src="/pics/bank/bank2.png"
                  alt="split your bank transactions and allocate one bank
                transaction into different accounts"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center w-full">
            <h1 className="text-2xl font-bold">Your Manual Entries </h1>
            <div className="flex flex-col gap-6 items-center">
              <p>Check all your manual entries here and create new ones</p>
              <div className="w-200">
                <Image
                  src="/pics/manualEntries/manualEntries1.png"
                  alt="check all your manual entries here and create new ones"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center w-full">
            <h1 className="text-2xl font-bold">Your Reports </h1>
            <div className="flex flex-col gap-6 items-center">
              <p>Choose a date and generate your trial balance report</p>
              <div className="w-200">
                <Image
                  src="/pics/reports/reports1.png"
                  alt="choose a date and generate your trial balance report"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
              <p>Or view your balance sheet</p>
              <div className="w-200">
                <Image
                  src="/pics/reports/reports2.png"
                  alt="view your balance sheet"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
              <p>And your income statement for chosen period of time</p>
              <div className="w-200">
                <Image
                  src="/pics/reports/reports3.png"
                  alt="view your income statement for chosen period of time"
                  width={1000}
                  height={500}
                  className="w-full rounded"
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6 items-center w-full">
            <h1 className="text-2xl font-bold">Your Business Settings </h1>
            <div className="flex flex-col gap-6 items-center">
              <p>Fill in your business details</p>
              <p>
                If you are an existing business migrate from another system, you
                need to fill in the opening balances
              </p>
              <div className="w-200">
                <Image
                  src="/pics/settings/settings2.png"
                  alt="home"
                  width={1000}
                  height={500}
                  className="w-full rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col gap-6 items-center">
              <p>
                Can&apos;t find the account you need? You can add your own
                accounts.
              </p>
              <div className="w-200">
                <Image
                  src="/pics/settings/settings1.png"
                  alt="home"
                  width={1000}
                  height={500}
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-gray-800 text-white py-10">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <h2 className="text-lg font-bold">Contact Us</h2>
              <p className="mt-4">123 Main St.</p>
              <p className="mt-1">Sydney, NSW 2000</p>
              <p className="mt-1">Australia</p>
              <p className="mt-1">kaylalee2326@gmail.com</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center">
            <p>&copy; 2023 Accounsole. All rights reserved.</p>
          </div>
        </footer>
      </Layout>
    );
  }
  return (
    <Layout businessDetails={props.businessDetails}>
      <UserHome
        monthlyExpenses={props.monthlyExpenses}
        monthlyIncome={props.monthlyIncome}
        months={months}
      />
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, accountId?: string) => {
    if (!accountId) return props;
    const repository = new Repository(accountId);
    props.monthlyExpenses = repository.getMonthlyExpenses(months);
    props.monthlyIncome = repository.getMonthlyIncome(months);
    return props;
  }
);
