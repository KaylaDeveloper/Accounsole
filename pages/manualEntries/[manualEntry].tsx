import AccessDenied from "@/components/AccessDenied";
import Layout from "@/components/Layout";
import { GetServerSidePropsContext } from "next";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import Repository, {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/Repository";
import "react-datepicker/dist/react-datepicker.css";
import { Row } from "../bank/[bankAccount]/[id]";
import { useState } from "react";
import useAlert from "hooks/useAlert";
import DataGrid, { Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import formatMoney from "utils/formatMoney";
import axios from "axios";

interface ManualEntry extends Omit<Row, "GST"> {
  firstRow: boolean;
}

export default function ManualEntries(props: {
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  businessDetails: BusinessDetails;
  manualEntry?: {
    id: string;
    date: string;
    description: string;
    accound_id: number;
    debit: number | null;
    credit: number | null;
    account_name: string;
    type: "Manual Entry";
  }[];
}) {
  const initialEntries = [
    {
      date: "Select a date",
      description: "Enter a description",
      account: "Select an account",
      debit: "",
      credit: "",
      firstRow: true,
    },
    {
      date: "",
      description: "",
      account: "Select an account",
      debit: "",
      credit: "",
      firstRow: false,
    },
  ];

  const manualEntries: ManualEntry[] = props.manualEntry
    ? props.manualEntry.map((entry, i) => {
        return {
          date: i === 0 ? entry.date : "",
          description: i === 0 ? entry.description : "",
          account: entry.account_name,
          debit: entry.debit ? entry.debit : "",
          credit: entry.credit ? entry.credit : "",
          firstRow: i === 0,
        };
      })
    : initialEntries;

  const [rows, setRows] = useState<ManualEntry[]>(manualEntries);

  const [alert, setAlert] = useAlert();

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  let columns: readonly Column<ManualEntry>[] = [
    {
      key: "date",
      name: "Date",
      width: 100,
      editor: (p) => {
        if (p.row.firstRow) {
          return (
            <input
              autoFocus
              type="date"
              value={p.row.date}
              onChange={(e) => {
                p.onRowChange({ ...p.row, date: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{""}</span>;
        }
      },
    },
    {
      key: "description",
      name: "Description",
      width: 400,
      resizable: true,
      editor: (p) => {
        if (p.row.firstRow) {
          return (
            <input
              autoFocus
              value={
                p.row.description === "Enter a description"
                  ? ""
                  : p.row.description
              }
              onChange={(e) => {
                p.onRowChange({ ...p.row, description: e.target.value });
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{""}</span>;
        }
      },
    },
    {
      key: "account",
      name: "Account",
      width: 150,
      editor: (p) => {
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
      },
    },
    {
      key: "debit",
      name: "Debit",
      width: 100,
      editor: (p) => {
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
      },
      formatter: ({ row }) => (
        <span>{row.debit !== "" ? formatMoney(Number(row.debit)) : ""}</span>
      ),
    },
    {
      key: "credit",
      name: "Credit",
      width: 100,
      editor: (p) => {
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
      },
      formatter: ({ row }) => (
        <span>{row.credit !== "" ? formatMoney(Number(row.credit)) : ""}</span>
      ),
    },
  ];

  const addNewRow = (): void => {
    const newRow = {
      date: "",
      description: "",
      account: "Select an Account",
      debit: "",
      credit: "",
      firstRow: false,
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const postManualEntry = async (
    rows: {
      date: string;
      description: string;
      account: string;
      debit: string | number;
      credit: string | number;
    }[]
  ) => {
    const firstRow = rows[0];

    const debitTotal = rows.reduce(
      (acc, row) => acc + (row.debit === "" ? 0 : Number(row.debit)),
      0
    );
    const creditTotal = rows.reduce(
      (acc, row) => acc + (row.credit === "" ? 0 : Number(row.credit)),
      0
    );

    if (Number(debitTotal.toFixed(2)) !== Number(creditTotal.toFixed(2))) {
      setAlert("Please ensure the total debit and credit are equal.");
      return;
    }

    if (debitTotal === 0 && creditTotal === 0) {
      setAlert("Please enter a debit or credit.");
      return;
    }

    if (rows.find((row) => row.debit !== "" && row.credit !== "")) {
      setAlert("Please enter either a debit or a credit.");
      return;
    }

    if (firstRow.date === "Select a date") {
      setAlert("Please enter a date.");
      return;
    }

    if (firstRow.description === "Enter a description") {
      setAlert("Please enter a description.");
      return;
    }

    if (
      rows.find(
        (row) =>
          (row.account === "" || row.account === "Select an account") &&
          (row.debit !== "" || row.credit !== "")
      )
    ) {
      setAlert("Please select an account for each row.");
      return;
    }

    const entryData: {
      date: string;
      description: string;
      account_id: number;
      account_name: string;
      debit: string | null | number;
      credit: string | null | number;
    }[] = [];
    rows.forEach((row) => {
      entryData.push({
        date: firstRow.date,
        description: firstRow.description,
        account_id: Number(row.account?.split(" ")[0]),
        account_name: row.account?.split(" ").slice(1).join(" "),
        debit: row.debit === "" ? null : Number(Number(row.debit).toFixed(2)),
        credit:
          row.credit === "" ? null : Number(Number(row.credit).toFixed(2)),
      });
    });

    await axios
      .post("/api/manualEntries/createManualEntries", {
        entryData,
        entryId: props.manualEntry ? props.manualEntry[0].id : undefined,
      })
      .then(() => {
        setRows(initialEntries);
        setAlert("Manual entry created successfully");
      })
      .catch((err) => {
        setAlert(err.response.data);
      });
  };

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col justify-center items-center gap-16 relative py-16 px-6 w-full">
        <p className="absolute top-6">{alert}</p>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={setRows}
          className="border-2 border-gray-200 border-collapse rdg-light h-48 max-w-full"
          onCellClick={(args, event) => {
            if (
              args.column.key === "date" ||
              args.column.key === "description" ||
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
        <div className="flex gap-6 sm:gap-96">
          <button
            onClick={() => addNewRow()}
            className="px-2 py-1 grid place-center  border border-transparent bg-primary-color  rounded hover:bg-dark-blue font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue focus-visible:ring-offset-2"
          >
            Add New row
          </button>
          <button
            onClick={() => {
              postManualEntry(rows);
            }}
            className="px-2 py-1 grid place-center  border border-transparent bg-primary-color  rounded hover:bg-dark-blue font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
          >
            {props.manualEntry ? "Update" : "Post"}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (
    props: {
      businessDetails?: BusinessDetails;
    },
    context: GetServerSidePropsContext,
    repository?: Repository
  ) => {
    if (!repository) return props;

    const accountsWithOpeningBalances =
      repository.getAccountsWithOpeningBalances();

    const { id } = context.query;

    if (typeof id === "string") {
      const manualEntry = repository.getManualEntry(id);

      return {
        ...props,
        manualEntry,
        accountsWithOpeningBalances,
      };
    } else {
      return {
        ...props,
        accountsWithOpeningBalances,
      };
    }
  }
);
