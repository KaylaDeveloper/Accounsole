import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export default async function BusinessSettings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const repository = new Repository(accountId);

    repository.updateBusinessDetails(req.body);
    const { new_business } = req.body;
    if (new_business) {
      repository.deleteOpeningBalanceEntriesIfExists();
    }
    return res.status(200).json("Success");
  });
}
