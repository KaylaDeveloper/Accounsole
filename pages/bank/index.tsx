import AccessDenied from "@/components/AccessDenied";
import AddBankAccountModal from "@/components/modal/AddBankAccountModal";
import BankAccount from "@/components/bank/BankAccount";
import Layout from "@/components/Layout";
import { useState } from "react";
import { getDefaultServerSideProps } from "services/defaultServerSideProps";
import Repository, {
  AccountsWithOpeningBalances,
  BankBalances,
  BusinessDetails,
} from "services/repository/Repository.ts";
import calculateBankUpToDateBalances from "utils/calculateBankUpToDateBalances";
import { GetServerSidePropsContext } from "next";

export default function Bank(props: {
  businessDetails: BusinessDetails;
  accountsWithOpeningBalances: AccountsWithOpeningBalances[];
  bankBalances: BankBalances[];
}) {
  const [isAddBankAccountModalOpen, setAddBankAccountModalOpen] =
    useState<boolean>(false);

  const [bankAccounts, setBankAccounts] = useState<
    AccountsWithOpeningBalances[]
  >(
    calculateBankUpToDateBalances(
      props.accountsWithOpeningBalances,
      props.bankBalances
    )
  );

  if (!props.businessDetails)
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );

  return (
    <Layout businessDetails={props.businessDetails}>
      <div className="flex flex-col justify-center items-center gap-16">
        <button
          onClick={() => setAddBankAccountModalOpen(true)}
          className="bg-primary-color px-4 py-1 rounded hover:bg-dark-blue mt-8"
        >
          Add Bank Account
        </button>
        <AddBankAccountModal
          isAddBankAccountModalOpen={isAddBankAccountModalOpen}
          closeModal={() => setAddBankAccountModalOpen(false)}
          accounts={bankAccounts}
          setAccounts={setBankAccounts}
        />
        <div className="flex flex-col sm:grid grid-cols-2 gap-4 mb-16">
          {bankAccounts.length > 0 &&
            bankAccounts.map((account) => {
              const bankBalance =
                Number(account.debit) - Number(account.credit);
              return (
                <BankAccount
                  key={account.id}
                  bankAccountId={account.id}
                  bankAccountName={account.name}
                  bankBalance={bankBalance}
                />
              );
            })}
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps = getDefaultServerSideProps(
  (props: any, context: GetServerSidePropsContext, repository?: Repository) => {
    if (!repository) return props;

    return {
      ...props,
      accountsWithOpeningBalances: repository.getAccountsWithOpeningBalances(),
      bankBalances: repository.getBankBalances(),
    };
  }
);
