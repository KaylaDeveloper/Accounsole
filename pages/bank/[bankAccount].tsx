import AccessDenied from "@/components/AccessDenied";
import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import React from "react";
import { getDefaultServerSideProps } from "../../services/defaultServerSideProps";
import Repository, {
  AccountsWithOpeningBalances,
  BankTransaction,
  BusinessDetails,
} from "../../services/repository/Repository.ts";
import { Row } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import NoBankTransactions from "@/components/bank/NoBankTransactions";
import { GetServerSidePropsContext } from "next";
import AllTransactions from "@/components/bank/AllTransactions";
import UnreconciledTransactions from "@/components/bank/UnreconciledTransactions";

export type TransactionRow = {
  id: number;
  bankAccountName: string;
  date: string;
  description: string;
  debit: number | string;
  credit: number | string;
  GST: string;
  account: string;
  children?: TransactionRow[];
  split?: boolean;
  parentId?: number;
};

export type Row = {
  id: number;
  description: string;
  date: string;
  debit: number | string;
  credit: number | string;
  reconciled: boolean;
};

export interface Filter
  extends Omit<Row, "id" | "debit" | "credit" | "reconciled"> {
  debit: string;
  credit: string;
  reconciled: string;
}

export default function BankAccountTransactions(props: {
  businessDetails: BusinessDetails;
  allBankTransactionsForSelectedAccount: BankTransaction[];
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
}) {
  const { bankAccount, type } = useRouter().query;

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  if (props.allBankTransactionsForSelectedAccount.length === 0) {
    return (
      <Layout businessDetails={props.businessDetails}>
        <NoBankTransactions />
      </Layout>
    );
  }
  if (type === "allTransactions" && typeof bankAccount === "string") {
    return (
      <Layout businessDetails={props.businessDetails}>
        <AllTransactions
          bankAccount={bankAccount}
          allBankTransactionsForSelectedAccount={
            props.allBankTransactionsForSelectedAccount
          }
        />
      </Layout>
    );
  } else if (
    type === "unreconciledTransactions" &&
    typeof bankAccount === "string"
  ) {
    const currentAccountUnreconciledTransactions =
      props.allBankTransactionsForSelectedAccount.filter(
        (transaction) => !transaction.reconciled
      );

    if (currentAccountUnreconciledTransactions.length === 0) {
      return (
        <Layout businessDetails={props.businessDetails}>
          <NoBankTransactions />
        </Layout>
      );
    }

    return (
      <Layout businessDetails={props.businessDetails}>
        <UnreconciledTransactions
          bankAccount={bankAccount}
          businessDetails={props.businessDetails}
          allBankTransactionsForSelectedAccount={
            props.allBankTransactionsForSelectedAccount
          }
          currentAccountUnreconciledTransactions={
            currentAccountUnreconciledTransactions
          }
          accountsWithOpeningBalances={props.accountsWithOpeningBalances}
        />
      </Layout>
    );
  }
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, repository?: Repository) => {
    if (!repository) return props;

    const accountsWithOpeningBalances =
      repository.getAccountsWithOpeningBalances();

    if (typeof context.query.bankAccount === "string") {
      const selectedBankAccount = context.query.bankAccount.split("-")[1];

      const allBankTransactionsForSelectedAccount =
        repository.findAllBankTransactionsForSelectedAccount(
          selectedBankAccount
        );

      return {
        ...props,
        accountsWithOpeningBalances,
        allBankTransactionsForSelectedAccount,
      };
    } else {
      return {
        ...props,
        accountsWithOpeningBalances,
      };
    }
  }
);
