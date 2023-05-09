import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository";
import getRepository from "services/getRepository";

export async function addAccount(req: NextApiRequest, res: NextApiResponse) {
  getRepository(req, res, (repository: Repository) => {
    const account = repository.checkIfAccoutExistsBeforeUpdate(req.body);
    if (account) {
      return res.status(409).json(`${account.name} already exists`);
    }

    repository.updateChartOfAccounts(req.body);
    const currentAccount = repository.getAccount(req.body);

    return res.status(200).json(currentAccount);
  });
}
