import { TransactionRow } from "@/pages/bank/[bankAccount]";
import axios from "axios";
import useAlert from "hooks/useAlert";
import DataGrid, { Column } from "react-data-grid";
import {
  AccountsWithOpeningBalances,
  BankTransaction,
  BusinessDetails,
} from "services/repository/repository";
import { createEntryData, validateRows } from "utils/markAsReconciled";
import SelectColumn from "../reactDataGrid/selectColumn";
import { useState } from "react";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";

export default function UnreconciledTransactions(props: {
  businessDetails: BusinessDetails;
  allBankTransactionsForSelectedAccount: BankTransaction[];
  currentAccountUnreconciledTransactions: BankTransaction[];
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  bankAccount: string;
}) {
  const [alert, setAlert] = useAlert();

  const splitTransaction = (id: number) => {
    const rowIndex = rows.findIndex((r) => r.id === id);

    const row = rows[rowIndex];
    const { children } = row;
    if (!children) return rows;

    const newRows = [...rows];
    newRows.splice(rowIndex + 1, 0, ...children);

    newRows[rowIndex] = {
      ...row,
      split: !row.split,
    };

    setRows(newRows);
  };

  const addNewRow = (parentId: number) => {
    const rowIndex = rows.findIndex((r) => r.id === parentId);
    const row = rows[rowIndex];
    const { children } = row;
    if (!children) return rows;

    const newRows = [...rows];
    const newChild = {
      id:
        children.length < 9
          ? parseFloat(parentId + "0" + (children.length + 1))
          : parseFloat(parentId + "" + (children.length + 1)),
      bankAccountName: row.bankAccountName,
      date: "",
      description: "",
      debit: "",
      credit: "",
      account: "Select an account",
      GST: "Select GST",
      parentId: parentId,
    };
    newRows[rowIndex].children?.push(newChild);
    newRows.splice(rowIndex + children.length, 0, newChild);
    setRows(newRows);
  };

  const markAsReconciled = async (id: number) => {
    const row = rows.find((r) => r.id === id);
    if (!row) {
      setAlert("Please select a row to mark as reconciled.");
      return;
    }
    const children = row.children;
    if (!children) {
      setAlert("Please select a row to mark as reconciled.");
      return;
    }

    const childrenDebitTotal = children.reduce(
      (debitTotal, child) =>
        debitTotal + (typeof child.debit === "string" ? 0 : child.debit),
      0
    );
    const debitTotal =
      (typeof row.debit === "string" ? 0 : row.debit) + childrenDebitTotal;

    const childrenCreditTotal = children.reduce(
      (creditTotal, child) =>
        creditTotal + (typeof child.credit === "string" ? 0 : child.credit),
      0
    );
    const creditTotal =
      (typeof row.credit === "string" ? 0 : row.credit) + childrenCreditTotal;

    try {
      validateRows(debitTotal, creditTotal, children, props.businessDetails);
    } catch (error: any) {
      setAlert(error.message);
      return;
    }

    const entryData = createEntryData(
      row,
      children,
      props.businessDetails,
      props.bankAccount.split("-")[0],
      row.bankAccountName
    );

    await axios
      .post("/api/bank/markAsReconciled", { entryData, id })
      .then(() => {
        setAlert("Reconciled successfully");
        const rowIndex = rows.findIndex((r) => r.id === id);
        const newRows = [...rows];
        newRows.splice(rowIndex, children.length + 1);
        setRows(newRows);
      })
      .catch((err) => {
        setAlert(err.response.data);
      });
  };

  const markSelectedAsReconciled = async (
    selectedRows: ReadonlySet<number>
  ) => {
    if (selectedRows.size === 0) {
      setAlert("Please select at least one row to reconcile.");
      return;
    }

    const selectedIds = Array.from(selectedRows.values());

    const selectedRowsToMark = selectedIds.map((id) =>
      rows.find((r) => r.id === id)
    );

    if (
      selectedRowsToMark.find((row) => row?.account === "Select an account")
    ) {
      setAlert("Please select an account for transaction selected.");
      return;
    }
    if (props.businessDetails.GST_registration) {
      if (selectedRowsToMark.find((row) => row?.GST === "Select GST")) {
        setAlert("Please select GST for transaction selected.");
        return;
      }
    }

    const allEntries: {
      bankTransactionId: number;
      entry: {
        description: string;
        date: string;
        account_id: number;
        account_name: string;
        debit: number | null;
        credit: number | null;
      }[];
    }[] = [];
    selectedRowsToMark.forEach((row) => {
      if (!row) {
        return;
      }
      const entry = [];
      entry.push({
        description: row.description,
        date: row.date,
        account_id: Number(props.bankAccount.split("-")[0]),
        account_name: row.bankAccountName,
        debit: typeof row.debit !== "string" ? row.debit : null,
        credit: typeof row.credit !== "string" ? row.credit : null,
      });

      entry.push({
        description: row.description,
        date: row.date,
        account_id: Number(row.account?.split(" ")[0]),
        account_name: row.account?.split(" ").slice(1).join(" "),
        debit:
          typeof row.credit === "string"
            ? null
            : row.GST === "GST Included"
            ? parseFloat(((row.credit / 11) * 10).toFixed(2))
            : row.credit,
        credit:
          typeof row.debit === "string"
            ? null
            : row.GST === "GST Included"
            ? parseFloat(((row.debit / 11) * 10).toFixed(2))
            : row.debit,
      });

      if (row.GST === "GST Included") {
        entry.push({
          description: row.description,
          date: row.date,
          account_id: 44,
          account_name: "GST",
          debit:
            typeof row.credit === "string"
              ? null
              : parseFloat((row.credit / 11).toFixed(2)),
          credit:
            typeof row.debit === "string"
              ? null
              : parseFloat((row.debit / 11).toFixed(2)),
        });
      }

      allEntries.push({ bankTransactionId: row.id, entry });
    });

    await axios
      .post("/api/bank/markSelectedAsReconciled", { allEntries })
      .then(() => {
        setAlert("Reconciled successfully");
        if (selectedIds.length > 0) {
          const newRows = [...rows].filter(
            (row) => !selectedIds.includes(row.id)
          );

          setRows(newRows);
        }
      })
      .catch((err) => {
        setAlert(err.response.data.message);
      });
  };

  const transactionRows: TransactionRow[] =
    props.currentAccountUnreconciledTransactions.map((transaction) => {
      return {
        id: transaction.id,
        bankAccountName: transaction.bankAccountName,
        date: transaction.date,
        description: transaction.description,
        debit: transaction.debit === null ? "" : transaction.debit,
        credit: transaction.credit === null ? "" : transaction.credit,
        account: "Select an account",
        GST: "Select GST",
        split: false,
        children: [
          {
            id: parseFloat(transaction.id + "01"),
            bankAccountName: transaction.bankAccountName,
            date: "",
            description: "",
            debit: "",
            credit: "",
            account: "Select an account",
            GST: "Select GST",
            parentId: transaction.id,
          },
          {
            id: parseFloat(transaction.id + "02"),
            bankAccountName: transaction.bankAccountName,
            date: "",
            description: "",
            debit: "",
            credit: "",
            account: "Select an account",
            GST: "Select GST",
            parentId: transaction.id,
          },
        ],
      };
    });

  let columns: readonly Column<TransactionRow>[] = [
    SelectColumn,
    {
      key: "id",
      name: "ID",
    },
    {
      key: "date",
      name: "Date",
    },
    {
      key: "description",
      name: "Description",
      width: 400,
      resizable: true,
    },
    {
      key: "account",
      name: "Account",
      editor: (p) => {
        if (!p.row.split) {
          return (
            <select
              required
              value={p.row.account}
              onChange={(e) => {
                p.onRowChange({ ...p.row, account: e.target.value });
                const TransactionRow = rows.find(
                  (r) => r.id === p.row.parentId
                );

                if (TransactionRow) {
                  const updatedChildren = TransactionRow.children?.map(
                    (child) => {
                      if (child?.id === p.row.id) {
                        child.account = e.target.value;
                        return child;
                      } else {
                        return child;
                      }
                    }
                  );

                  TransactionRow.children = updatedChildren;
                }
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
        }
      },
      formatter: ({ row }) => {
        if (row.split) return "";
        return (
          <span>{row.account !== "" ? row.account : "Select an account"}</span>
        );
      },
    },
    {
      key: "debit",
      name: "Money In",
      editor: (p) => {
        if (p.row.parentId) {
          return (
            <input
              autoFocus
              value={p.row.debit}
              onChange={(e) => {
                p.onRowChange({ ...p.row, debit: e.target.value });
                const TransactionRow = rows.find(
                  (r) => r.id === p.row.parentId
                );

                if (TransactionRow) {
                  const updatedChildren = TransactionRow.children?.map(
                    (child) => {
                      if (child?.id === p.row.id) {
                        child.debit = Number.isNaN(parseFloat(e.target.value))
                          ? ""
                          : parseFloat(e.target.value);
                        return child;
                      } else {
                        return child;
                      }
                    }
                  );

                  TransactionRow.children = updatedChildren;
                }
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{p.row.debit}</span>;
        }
      },
      formatter: ({ row }) => (
        <span>
          {row.debit !== "" ? turnNumberIntoAudFormat(Number(row.debit)) : ""}
        </span>
      ),
    },
    {
      key: "credit",
      name: "Money Out",
      editor: (p) => {
        if (p.row.parentId) {
          return (
            <input
              autoFocus
              value={p.row.credit}
              onChange={(e) => {
                p.onRowChange({ ...p.row, credit: e.target.value });
                const TransactionRow = rows.find(
                  (r) => r.id === p.row.parentId
                );

                if (TransactionRow) {
                  const updatedChildren = TransactionRow.children?.map(
                    (child) => {
                      if (child?.id === p.row.id) {
                        child.credit = Number.isNaN(parseFloat(e.target.value))
                          ? ""
                          : parseFloat(e.target.value);
                        return child;
                      } else {
                        return child;
                      }
                    }
                  );

                  TransactionRow.children = updatedChildren;
                }
              }}
              className="w-full h-full border-none outline-none"
            />
          );
        } else {
          return <span>{p.row.credit}</span>;
        }
      },
      formatter: ({ row }) => (
        <span>
          {row.credit !== "" ? turnNumberIntoAudFormat(Number(row.credit)) : ""}
        </span>
      ),
    },
    {
      key: "GST",
      name: "GST",
      editor: (p) => {
        if (!p.row.split) {
          return (
            <select
              required
              value={p.row.GST}
              onChange={(e) => {
                p.onRowChange({ ...p.row, GST: e.target.value });
                const TransactionRow = rows.find(
                  (r) => r.id === p.row.parentId
                );

                if (TransactionRow) {
                  const updatedChildren = TransactionRow.children?.map(
                    (child) => {
                      if (child?.id === p.row.id) {
                        child.GST = e.target.value;
                        return child;
                      } else {
                        return child;
                      }
                    }
                  );

                  TransactionRow.children = updatedChildren;
                }
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
      formatter: ({ row }) => {
        if (row.split) return "";
        return <span>{row.account !== "" ? row.GST : "Select GST"}</span>;
      },
    },
    {
      key: "split",
      name: "Aciton",
      formatter: ({ row }) => {
        if (row.parentId) {
          if (row.id?.toString().endsWith("01")) {
            return (
              <button onClick={() => addNewRow(row.parentId as number)}>
                {"Add New Row"}
              </button>
            );
          }
        } else if (!row.split) {
          return (
            <button onClick={() => splitTransaction(row.id)}>
              {"Split Transaction"}
            </button>
          );
        } else if (row.split) {
          return (
            <button onClick={() => markAsReconciled(row.id)}>
              {"Mark as Reconciled"}
            </button>
          );
        }
      },
    },
  ];
  if (!props.businessDetails.GST_registration) {
    columns = columns.filter((column) => column.key !== "GST");
  }

  const [rows, setRows] = useState<TransactionRow[]>(transactionRows);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number>>(
    () => new Set()
  );

  return (
    <div className="h-full flex relative ">
      <button
        onClick={() => markSelectedAsReconciled(selectedRows)}
        className="absolute right-20 bottom-4 px-2 py-1 grid place-center  border border-transparent bg-primary-color
            hover:bg-dark-blue  rounded font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-blue focus-visible:ring-offset-2"
      >
        Mark Selected as Reconciled
      </button>

      <section className="pt-14 pb-14  h-full w-full px-10 flex-grow flex flex-col">
        <p className="absolute top-3">{alert}</p>
        <DataGrid
          columns={columns}
          rows={rows}
          onRowsChange={setRows}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          rowKeyGetter={(row: TransactionRow) => row.id}
          className="border-2 border-gray-200 border-collapse flex-grow rdg-light fill-grid"
          rowClass={(row) => {
            if (row.parentId) {
              return "bg-gray-400";
            }
          }}
          onCellClick={(args, event) => {
            if (
              args.column.key === "account" ||
              args.column.key === "GST" ||
              args.column.key === "debit" ||
              args.column.key === "credit" ||
              args.column.key === "split"
            ) {
              event.preventGridDefault();
              args.selectCell(true);
            }
          }}
        />
      </section>
    </div>
  );
}
