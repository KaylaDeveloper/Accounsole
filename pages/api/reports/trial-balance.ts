import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export default async function generateTrialBalance(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const { date } = req.body;

    const repository = new Repository(accountId);
    const accountsWithBalances = repository.getAccountsBalances(
      date.split("T")[0]
    );
    return res.status(200).json({ accountsWithBalances });
  });
}
