import {
  AccountsWithOpeningBalances,
  BusinessDetails,
} from "services/repository/Repository.ts";
import { getOnlyAccountsWithBalances } from "utils/accountsCalculation";
import Modal from "./Modal";
import TrialBalanceTable from "../reports/TrialBalanceTable";

export default function AccountsPreviewModal({
  isAccountsPreviewModalOpen,
  closeModal,
  accounts,
  date,
  businessDetails,
}: {
  isAccountsPreviewModalOpen: boolean;
  closeModal: () => void;
  accounts: AccountsWithOpeningBalances[];
  date: Date;
  businessDetails: BusinessDetails;
}) {
  if (date === null) {
    return null;
  }

  const trialBalanceDate = date.toLocaleDateString("en-AU");
  const accountsWithBalances = getOnlyAccountsWithBalances(accounts);

  return (
    <Modal
      isModalOpen={isAccountsPreviewModalOpen}
      closeModal={closeModal}
      title={businessDetails.business_name}
      subTitle={`Trial Balances as at ${trialBalanceDate}`}
    >
      {TrialBalanceTable(accountsWithBalances)}
    </Modal>
  );
}
