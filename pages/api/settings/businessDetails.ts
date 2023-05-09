import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository";
import getRepository from "services/getRepository";

export default async function BusinessSettings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    repository.updateBusinessDetails(req.body);
    const { new_business } = req.body;
    if (new_business) {
      repository.deleteOpeningBalanceEntriesIfExists();
    }
    return res.status(200).json("Success");
  });
}
