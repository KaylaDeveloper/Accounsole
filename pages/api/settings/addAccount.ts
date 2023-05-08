import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export async function addAccount(req: NextApiRequest, res: NextApiResponse) {
  getDatabase(req, res, (accountId: string) => {
    const repository = new Repository(accountId);
    const account = repository.checkIfAccoutExistsBeforeUpdate(req.body);
    if (account) {
      return res.status(409).json(`${account.name} already exists`);
    }

    repository.updateChartOfAccounts(req.body);
    const currentAccount = repository.getAccount(req.body);

    return res.status(200).json(currentAccount);
  });
}
