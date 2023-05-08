import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";
import { v4 as uuidv4 } from "uuid";

export default async function createOpeningBalancesJournalEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const id = uuidv4();
    const description = "Opening balances";
    const type = "Opening balances";

    const { date } = req.body;

    const repository = new Repository(accountId);
    const bankTransactionDateEalierThanOpeningBalanceDate =
      repository.checkIsDateLaterThanBankTransactions(date);

    if (bankTransactionDateEalierThanOpeningBalanceDate) {
      return res
        .status(400)
        .json(
          "Opening balances date cannot be later than the date of the bank transactions."
        );
    }

    repository.createOpeningBalancesJournalEntry(
      id,
      type,
      description,
      req.body
    );

    return res.status(200).json("Success");
  });
}
