import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getRepository from "services/getRepository";

export default async function generateTrialBalance(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const { date } = req.body;

    const accountsWithBalances = repository.getAccountsBalances(
      date.split("T")[0]
    );
    return res.status(200).json({ accountsWithBalances });
  });
}
