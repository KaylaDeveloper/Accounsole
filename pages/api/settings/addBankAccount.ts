import { AccountDetails } from "@/components/modal/AddAccountModal";
import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository";
import getRepository from "services/getRepository";

export default async function addBankAccount(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const { bankName, bankAccountBSB, bankAccountNumber } = req.body;
    const accountDetails = {
      accountName: bankName + " " + bankAccountNumber.slice(-4),
      accountType: "Bank",
      GST: "GST free",
      description: bankName + " " + bankAccountBSB + " " + bankAccountNumber,
    };

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
