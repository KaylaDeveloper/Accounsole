import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export default async function generateIncomeStatement(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const { fromDate, toDate } = req.body;

    const repository = new Repository(accountId);
    const accountsWithBalances = repository.getIncomeStatementAccountsBalances(
      fromDate.split("T")[0],
      toDate.split("T")[0]
    );

    return res.status(200).json({ accountsWithBalances });
  });
}
