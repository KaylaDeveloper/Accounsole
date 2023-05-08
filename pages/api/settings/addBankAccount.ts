import { AccountDetails } from "@/components/modal/AddAccountModal";
import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export default async function addBankAccount(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const { bankName, bankAccountBSB, bankAccountNumber } = req.body;
    const accountDetails = {
      accountName: bankName + " " + bankAccountNumber.slice(-4),
      accountType: "Bank",
      GST: "GST free",
      description: bankName + " " + bankAccountBSB + " " + bankAccountNumber,
    };

    const repository = new Repository(accountId);
    const account = repository.checkIfAccoutExistsBeforeUpdate(
      accountDetails as AccountDetails
    );
    if (account) {
      return res.status(409).json(`${account.name} already exists`);
    }

    repository.updateChartOfAccounts(accountDetails as AccountDetails);

    const currentAccount = repository.getAccount(
      accountDetails as AccountDetails
    );

    return res.status(200).json(currentAccount);
  });
}
