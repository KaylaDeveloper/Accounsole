import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository.ts";
import getRepository from "services/getRepository";

export default async function deleteManualEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const id = req.query.id as string;

    repository.deleteManualEntry(id);

    return res.status(200).json("Success");
  });
}
