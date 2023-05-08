import { TransactionRow } from "@/pages/bank/[bankAccount]";
import { Row } from "@/pages/bank/[bankAccount]/[id]";
import { BusinessDetails } from "../services/repository/repository";

export function validateRows(
  debitTotal: number,
  creditTotal: number,
  rows: Row[] | TransactionRow[],
  businessDetails: BusinessDetails
) {
  if (Number(debitTotal.toFixed(2)) !== Number(creditTotal.toFixed(2))) {
    throw new Error("Please ensure the total debit and credit are equal.");
  }

  if (rows.find((row) => row.debit !== "" && row.credit !== "")) {
    throw new Error("Please enter debit or credit for each account.");
  }

  if (
    rows.find(
      (row) =>
        (row.debit !== "" || row.credit !== "") &&
        row.account === "Select an account"
    )
  ) {
    throw new Error("Please select an account for each transaction line.");
  }

  if (
    businessDetails.GST_registration &&
    rows.find(
      (row) =>
        (row.debit !== "" || row.credit !== "") && row.GST === "Select GST"
    )
  ) {
    throw new Error("Please select GST for each transaction line.");
  }
}

export function createEntryData(
  firstRow: Row | TransactionRow,
  rows: Row[] | TransactionRow[],
  businessDetails: BusinessDetails,
  accountId: string,
  accountName: string
) {
  const entryData = [];
  if (accountId && accountName) {
    entryData.push({
      description: firstRow.description,
      date: firstRow.date,
      account_id: Number(accountId),
      account_name: accountName,
      debit: typeof firstRow.debit !== "string" ? firstRow.debit : null,
      credit: typeof firstRow.credit !== "string" ? firstRow.credit : null,
    });
  }

  rows.forEach((row) => {
    if (businessDetails.GST_registration) {
      if (
        (row.debit !== "" || row.credit !== "") &&
        row.GST !== "Select GST" &&
        row.account !== "Select an account"
      ) {
        entryData.push({
          description: firstRow.description,
          date: firstRow.date,
          account_id: Number(row.account?.split(" ")[0]),
          account_name: row.account?.split(" ").slice(1).join(" "),
          debit:
            typeof row.debit !== "string"
              ? row.GST === "GST Included"
                ? parseFloat(((row.debit / 11) * 10).toFixed(2))
                : parseFloat(row.debit.toFixed(2))
              : null,
          credit:
            typeof row.credit !== "string"
              ? row.GST === "GST Included"
                ? parseFloat(((row.credit / 11) * 10).toFixed(2))
                : parseFloat(row.credit.toFixed(2))
              : null,
        });
      }
    }

    if (!businessDetails.GST_registration) {
      if (
        (row.debit !== "" || row.credit !== "") &&
        row.account !== "Select an account"
      ) {
        entryData.push({
          description: firstRow.description,
          date: firstRow.date,
          account_id: Number(row.account?.split(" ")[0]),
          account_name: row.account?.split(" ").slice(1).join(" "),
          debit:
            typeof row.debit !== "string"
              ? parseFloat(row.debit.toFixed(2))
              : null,
          credit:
            typeof row.credit !== "string"
              ? parseFloat(row.credit.toFixed(2))
              : null,
        });
      }
    }
  });

  const GSTEntry: {
    description: "";
    date: "";
    account_id: number;
    account_name: "GST";
    debit: number;
    credit: number;
  }[] = [];
  rows.forEach((row) => {
    if (row.GST === "GST Included") {
      GSTEntry.push({
        description: "",
        date: "",
        account_id: 44,
        account_name: "GST",
        debit:
          typeof row.debit !== "string"
            ? parseFloat((row.debit / 11).toFixed(2))
            : 0,
        credit:
          typeof row.credit !== "string"
            ? parseFloat((row.credit / 11).toFixed(2))
            : 0,
      });
    }
  });

  if (GSTEntry.length > 0) {
    const debit = GSTEntry.reduce(
      (debitTotal, entry) => debitTotal + entry.debit,
      0
    );
    const credit = GSTEntry.reduce(
      (creditTotal, entry) => creditTotal + entry.credit,
      0
    );
    entryData.push({
      description: firstRow.description,
      date: firstRow.date,
      account_id: 44,
      account_name: "GST",
      debit: debit !== 0 ? debit : null,
      credit: credit !== 0 ? credit : null,
    });
  }

  return entryData;
}
