import { JournalEntry } from "@/pages/api/bank/markAsReconciled";
import uuid from "uuid-random";
import bankTransactions from "./testBankTransactions";

const entryIds = [uuid(), uuid()];
const entryData: JournalEntry[] = [
  {
    id: entryIds[0],
    type: "Bank Reconciliation",
    description: bankTransactions[0].description,
    date: bankTransactions[0].date,
    account_id: 52,
    account_name: "Westpac 1234",
    debit: 2200,
    credit: null,
  },
  {
    id: entryIds[0],
    type: "Bank Reconciliation",
    description: bankTransactions[0].description,
    date: bankTransactions[0].date,
    account_id: 1,
    account_name: "Sales",
    debit: null,
    credit: 2000,
  },
  {
    id: entryIds[0],
    type: "Bank Reconciliation",
    description: bankTransactions[0].description,
    date: bankTransactions[0].date,
    account_id: 44,
    account_name: "GST",
    debit: null,
    credit: 200,
  },
  {
    id: entryIds[1],
    type: "Manual Entry",
    description: "Cash Payment",
    date: "2023-01-01",
    account_id: 7,
    account_name: "Cleaning",
    debit: 100,
    credit: null,
  },
  {
    id: entryIds[1],
    type: "Manual Entry",
    description: "Cash Payment",
    date: "2023-01-01",
    account_id: 44,
    account_name: "GST",
    debit: 10,
    credit: null,
  },
  {
    id: entryIds[1],
    type: "Manual Entry",
    description: "Cash Payment",
    date: "2023-01-01",
    account_id: 34,
    account_name: "Cash in Hand",
    debit: null,
    credit: 110,
  },
];

export { entryIds, entryData };
