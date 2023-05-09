import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository.ts";
import getRepository from "services/getRepository";

export default async function generateIncomeStatement(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const { fromDate, toDate } = req.body;

    const accountsWithBalances = repository.getIncomeStatementAccountsBalances(
      fromDate.split("T")[0],
      toDate.split("T")[0]
    );

    return res.status(200).json({ accountsWithBalances });
  });
}
