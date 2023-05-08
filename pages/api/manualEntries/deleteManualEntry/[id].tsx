import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";

export default async function deleteManualEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const id = req.query.id as string;

    const repository = new Repository(accountId);
    repository.deleteManualEntry(id);

    return res.status(200).json("Success");
  });
}
