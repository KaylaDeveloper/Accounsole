import AccessDenied from "@/components/AccessDenied";
import Layout from "@/components/Layout";
import { JournalEntry } from "@/pages/api/bank/markAsReconciled";
import { GetServerSidePropsContext } from "next";
import { useState } from "react";
import DataGrid, { Column } from "react-data-grid";
import formatMoney from "utils/formatMoney";
import { getDefaultServerSideProps } from "../../../services/defaultServerSideProps";
import Repository, {
  AccountsWithOpeningBalances,
  BankTransaction,
  BusinessDetails,
} from "../../../services/repository/Repository";
import "react-data-grid/lib/styles.css";
import axios from "axios";
import { useRouter } from "next/router";
import useAlert from "hooks/useAlert";
import { createEntryData, validateRows } from "utils/markAsReconciled";

export type Row = {
  date: string;
  description: string;
  account: string;
  debit: string | number;
  credit: string | number;
  GST: string;
};

export default function BankAccountTransactions(props: {
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  businessDetails: BusinessDetails;
  bankTransaction: BankTransaction;
  journalEntry?: JournalEntry[];
}) {
  const router = useRouter();
  const bankAccountId = (router.query.bankAccount as string).split("-")[0];

  const transactionRows: Row[] = [
    {
      date: props.bankTransaction.date,
      description: props.bankTransaction.description,
      account: bankAccountId + " " + props.bankTransaction.bankAccountName,
      debit:
        props.bankTransaction.debit === null ? "" : props.bankTransaction.debit,
      credit:
        props.bankTransaction.credit === null
          ? ""
          : props.bankTransaction.credit,
      GST: "",
    },
    {
      date: "",
      description: "",
      account: "Select an account",
      debit: "",
      credit: "",
      GST: "Select GST",
    },
  ];

  const [rows, setRows] = useState<Row[]>(transactionRows);

  const [alert, setAlert] = useAlert();

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  let columns: readonly Column<Row>[] = [
    {
      key: "date",
      name: "Date",
      width: 100,
    },
    {
      key: "description",
      name: "Description",
      width: 500,
      resizable: true,
    },
    {
      key: "account",
      name: "Account",
      width: 150,
      editor: (p) => {
        if (p.row.date !== props.bankTransaction.date) {
          return (
            <select
              required
              value={p.row.account}
              onChange={(e) => {
                p.onRowChange({ ...p.row, account: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            >
              <option value="">Select an account</option>
              {props.accountsWithOpeningBalances.map((account) => {
                return (
                  <option
                    key={account.id}
                    value={account.id + " " + account.name}
                  >
                    {account.id} &nbsp; {account.name}
                  </option>
                );
              })}
            </select>
          );
        } else {
          return <span>{props.bankTransaction.bankAccountName}</span>;
        }
      },
    },
    {
      key: "debit",
      name: "Money In",
      width: 100,
      editor: (p) => {
        if (p.row.date !== props.bankTransaction.date) {
          return (
            <input
              autoFocus
              value={p.row.debit}
              onChange={(e) => {
                p.onRowChange({ ...p.row, debit: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{p.row.debit}</span>;
        }
      },
      formatter: ({ row }) => (
        <span>{row.debit !== "" ? formatMoney(Number(row.debit)) : ""}</span>
      ),
    },
    {
      key: "credit",
      name: "Money Out",
      width: 100,
      editor: (p) => {
        if (p.row.date !== props.bankTransaction.date) {
          return (
            <input
              autoFocus
              value={p.row.credit}
              onChange={(e) => {
                p.onRowChange({ ...p.row, credit: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{p.row.credit}</span>;
        }
      },
      formatter: ({ row }) => (
        <span>{row.credit !== "" ? formatMoney(Number(row.credit)) : ""}</span>
      ),
    },
    {
      key: "GST",
      name: "GST",
      width: 100,
      editor: (p) => {
        if (p.row.date !== props.bankTransaction.date) {
          return (
            <select
              required
              value={p.row.GST}
              onChange={(e) => {
                p.onRowChange({ ...p.row, GST: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            >
              <option value="">Select GST</option>
              <option value="GST Included">GST Included</option>
              <option value="No GST">No GST</option>
            </select>
          );
        }
      },
    },
  ];
  if (!props.businessDetails.GST_registration) {
    columns = columns.filter((column) => column.key !== "GST");
  }

  const addNewRow = (): void => {
    const newRow = {
      date: "",
      description: "",
      account: "Select a Account",
      debit: "",
      credit: "",
      GST: "Select GST",
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const markAsReconciled = async (rows: Row[]) => {
    const debitTotal = rows.reduce(
      (acc, row) => acc + (row.debit === "" ? 0 : Number(row.debit)),
      0
    );
    const creditTotal = rows.reduce(
      (acc, row) => acc + (row.credit === "" ? 0 : Number(row.credit)),
      0
    );

    try {
      validateRows(debitTotal, creditTotal, rows, props.businessDetails);
    } catch (error: any) {
      setAlert(error.message);
      return;
    }

    const newRows = [...rows];
    newRows.shift();
    newRows.forEach((row) => {
      row.debit = row.debit !== "" ? Number(row.debit) : "";
      row.credit = row.credit !== "" ? Number(row.credit) : "";
    });

    const entryData = createEntryData(
      rows[0],
      newRows,
      props.businessDetails,
      bankAccountId,
      props.bankTransaction.bankAccountName
    );

    await axios
      .post("/api/bank/markAsReconciled", {
        entryData,
        entryId: props.bankTransaction.entryId,
        id: props.bankTransaction.id,
      })
      .then(() => {
        setAlert("Reconciled successfully");
      })
      .catch((err) => {
        setAlert(err.response.data);
      });
  };

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col items-center h-full w-full p-10 gap-4">
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={setRows}
          className="border-2 border-gray-200 border-collapse rdg-light h-48"
          onCellClick={(args, event) => {
            if (
              args.column.key === "account" ||
              args.column.key === "GST" ||
              args.column.key === "debit" ||
              args.column.key === "credit"
            ) {
              event.preventGridDefault();
              args.selectCell(true);
            }
          }}
        />
        <div className="flex gap-96">
          <button
            onClick={() => addNewRow()}
            className="px-2 py-1 grid place-center  border border-transparent bg-primary-color  rounded hover:bg-dark-blue font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue focus-visible:ring-offset-2"
          >
            Add New row
          </button>
          <button
            onClick={() => {
              markAsReconciled(rows);
              router.replace(location.href);
            }}
            className="px-2 py-1 grid place-center  border border-transparent bg-primary-color  rounded hover:bg-dark-blue font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            {props.journalEntry ? "Redo Reconciliation" : "Mark as Reconciled"}
          </button>
        </div>
        <div className="mt-16 relative">
          <p className="absolute -mt-10 ">{alert}</p>
          {props.journalEntry && (
            <div className="">
              <table className="table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-2 border-gray-200 border-collapse px-2">
                      Date
                    </th>
                    <th className="border-2 border-gray-200 border-collapse px-2">
                      Description
                    </th>
                    <th className="border-2 border-gray-200 border-collapse px-2">
                      Account
                    </th>
                    <th className="border-2 border-gray-200 border-collapse px-2">
                      Money In
                    </th>
                    <th className="border-2 border-gray-200 border-collapse px-2">
                      Money Out
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {props.journalEntry.map((entry: JournalEntry, index) => (
                    <tr key={index}>
                      <td className="border-2 border-gray-200 border-collapse px-2">
                        {index === 0 ? entry.date : null}
                      </td>
                      <td className="border-2 border-gray-200 border-collapse px-2">
                        {index === 0 ? entry.description : null}
                      </td>
                      <td className="border-2 border-gray-200 border-collapse px-2">
                        {entry.account_name}
                      </td>
                      <td className="border-2 border-gray-200 border-collapse px-2">
                        {entry.debit ? formatMoney(Number(entry.debit)) : null}
                      </td>
                      <td className="border-2 border-gray-200 border-collapse px-2">
                        {entry.credit
                          ? formatMoney(Number(entry.credit))
                          : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, repository?: Repository) => {
    if (!repository) return props;

    const accountsWithOpeningBalances =
      repository.getAccountsWithOpeningBalances();

    const bankTransactionId = Number(context.query.id);
    const bankTransaction =
      repository.getBankTransactionById(bankTransactionId);
    const { reconciled, entryId } = bankTransaction;
    if (reconciled) {
      const journalEntry = repository.getJournalEntryByEntryId(entryId);
      return {
        ...props,
        journalEntry,
        bankTransaction,
        accountsWithOpeningBalances,
      };
    } else {
      return {
        ...props,
        bankTransaction,
        accountsWithOpeningBalances,
      };
    }
  }
);
