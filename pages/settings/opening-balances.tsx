import "react-data-grid/lib/styles.css";
import DataGrid, { Column, textEditor } from "react-data-grid";
import Repository, {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/repository";
import { useMemo, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import turnNumberIntoAudFormat from "utils/turnNumberIntoAudFormat";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import { GetServerSidePropsContext } from "next";
import Layout from "@/components/Layout";
import {
  getOnlyAccountsWithBalances,
  totalCredit,
  totalDebit,
} from "utils/accountsCalculation";
import AddBankAccountModal from "@/components/modal/AddBankAccountModal";
import AddAccountModal from "@/components/modal/AddAccountModal";
import AccountsPreviewModal from "@/components/modal/AccountsPreviewModal";
import useAlert from "hooks/useAlert";

export type SummaryRow = {
  id: string;
  totalDebit: number;
  totalCredit: number;
};

const columns: readonly Column<
  {
    id: number;
    name: string;
    type: string;
    debit: null | number | string;
    credit: null | number | string;
  },
  SummaryRow
>[] = [
  {
    key: "id",
    name: "Account Number",
    summaryFormatter() {
      return <strong>Total</strong>;
    },
  },
  {
    key: "name",
    name: "Account Name",
  },
  {
    key: "type",
    name: "Account Type",
  },
  {
    key: "debit",
    name: "Debit",
    editor: textEditor,
    formatter: ({ row }) => (
      <span>
        {row.debit !== null ? turnNumberIntoAudFormat(Number(row.debit)) : null}
      </span>
    ),
    summaryFormatter({ row: { totalDebit } }: { row: SummaryRow }) {
      return <strong>{turnNumberIntoAudFormat(totalDebit)}</strong>;
    },
  },
  {
    key: "credit",
    name: "Credit",
    editor: textEditor,
    formatter: ({ row }) => (
      <span>
        {row.credit !== null
          ? turnNumberIntoAudFormat(Number(row.credit))
          : null}
      </span>
    ),
    summaryFormatter({ row: { totalCredit } }: { row: SummaryRow }) {
      return <strong>{turnNumberIntoAudFormat(totalCredit)}</strong>;
    },
  },
];

export default function OpeningBalances(props: {
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  date: string | null;
  businessDetails: BusinessDetails;
}) {
  const [accountsWithOpeningBalances, setAccountsWithOpeningBalances] =
    useState<AccountsWithOpeningBalances[]>(props.accountsWithOpeningBalances);

  const [date, setDate] = useState(
    props.date !== null ? new Date(props.date) : new Date()
  );

  const [isAddAccountModalOpen, setAddAccountModalOpen] =
    useState<boolean>(false);
  const [isAddBankAccountModalOpen, setAddBankAccountModalOpen] =
    useState<boolean>(false);
  const [isAccountsPreviewModalOpen, setAccountsPreviewModalOpen] =
    useState<boolean>(false);

  const [alert, setAlert] = useAlert();

  const summaryRows = useMemo(() => {
    const summaryRow: SummaryRow = {
      id: "total",
      totalDebit: totalDebit(accountsWithOpeningBalances),
      totalCredit: totalCredit(accountsWithOpeningBalances),
    };

    return [summaryRow];
  }, [accountsWithOpeningBalances]);

  const createOpeningBalancesJournalEntry = async () => {
    if (
      totalDebit(accountsWithOpeningBalances) !==
      totalCredit(accountsWithOpeningBalances)
    ) {
      setAlert(
        "Please make sure total debit amount equals total credit amount."
      );
      return;
    }
    const accountsWithBalances = getOnlyAccountsWithBalances(
      accountsWithOpeningBalances
    );

    if (
      accountsWithBalances.filter(
        (account) =>
          account.debit !== null &&
          account.credit !== null &&
          account.debit !== 0 &&
          account.credit !== 0
      ).length > 0
    ) {
      setAlert("Please only enter one amount for one account.");
      return;
    }
    await axios
      .post("/api/settings/createOpeningBalancesJournalEntry", {
        accounts: accountsWithBalances,
        date,
      })
      .then(() => setAlert("Opening balances have been posted!"))
      .catch((err) => setAlert(err.response.data));
  };
  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="px-4 py-4 flex flex-col h-full sm:py-10 sm:px-20 ">
        <p className="absolute top-16 ">{alert}</p>
        <div className="flex flex-col">
          <h2 className="italic basis-1/5">Trial balance date:</h2>
          <DatePicker
            selected={date}
            onChange={(date: Date) => setDate(date)}
            dateFormat="dd/MM/yyyy"
            className="border-2 px-1 rounded mb-4"
          />
        </div>
        <DataGrid
          columns={columns}
          rows={accountsWithOpeningBalances}
          rowKeyGetter={(row: {
            id: number;
            name: string;
            type: string;
            debit: null | number | string;
            credit: null | number | string;
          }) => row.id}
          onRowsChange={(rows) => {
            const formatedRows = rows.map(
              (row: {
                id: number;
                name: string;
                type: string;
                debit: null | number | string;
                credit: null | number | string;
              }) => {
                if (row.debit !== null) {
                  const debit = Number(row.debit);
                  if (isNaN(debit)) {
                    setAlert("Please only enter numbers for debit and credit.");
                    row.debit = 0;
                  } else {
                    row.debit = Number(debit.toFixed(2));
                  }
                }
                if (row.credit !== null) {
                  const credit = Number(row.credit);
                  if (isNaN(credit)) {
                    setAlert("Please only enter numbers for debit and credit.");
                    row.credit = 0;
                  } else {
                    row.credit = Number(credit.toFixed(2));
                  }
                }
                return row;
              }
            );
            setAccountsWithOpeningBalances(
              formatedRows as AccountsWithOpeningBalances[]
            );
          }}
          bottomSummaryRows={summaryRows}
          className="border-2 border-gray-200 border-collapse flex-grow rdg-light"
          onCellClick={(args, event) => {
            if (args.column.key === "debit" || args.column.key === "credit") {
              event.preventGridDefault();
              args.selectCell(true);
            }
          }}
        />
        <div className="flex gap-4 justify-between px-4 py-2 pr-8 border-2 border-collapse border-gray-200 mb-10">
          <div className="flex flex-col gap-4 sm:block">
            <button
              onClick={() => setAddBankAccountModalOpen(true)}
              className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue mr-6"
            >
              Add Bank Account
            </button>
            <button
              onClick={() => setAddAccountModalOpen(true)}
              className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue"
            >
              Add Account
            </button>
          </div>
          <div className="flex flex-col justify-between sm:block">
            <button
              onClick={() => {
                if (date === null) {
                  setAlert("Please select a date.");
                } else {
                  setAccountsPreviewModalOpen(true);
                }
              }}
              className="mr-6 bg-primary-color px-4 py-1 rounded hover:bg-dark-blue"
            >
              Preview
            </button>
            <button
              onClick={createOpeningBalancesJournalEntry}
              className="bg-primary-color px-4 py-1 rounded hover:bg-bg-dark-blue"
            >
              Post
            </button>
          </div>
        </div>
        <AddBankAccountModal
          isAddBankAccountModalOpen={isAddBankAccountModalOpen}
          closeModal={() => setAddBankAccountModalOpen(false)}
          accounts={accountsWithOpeningBalances}
          setAccounts={setAccountsWithOpeningBalances}
        />
        <AddAccountModal
          isAddAccountModalOpen={isAddAccountModalOpen}
          closeModal={() => setAddAccountModalOpen(false)}
          accounts={accountsWithOpeningBalances}
          setAccounts={setAccountsWithOpeningBalances}
        />
        <AccountsPreviewModal
          isAccountsPreviewModalOpen={isAccountsPreviewModalOpen}
          closeModal={() => setAccountsPreviewModalOpen(false)}
          accounts={accountsWithOpeningBalances}
          date={date}
          businessDetails={props.businessDetails}
        />
      </div>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, accountId?: string) => {
    if (!accountId) return props;

    const repository = new Repository(accountId);
    props.accountsWithOpeningBalances =
      repository.getAccountsWithOpeningBalances();
    props.date = repository.findOpeningBalanceDate();

    return props;
  }
);
