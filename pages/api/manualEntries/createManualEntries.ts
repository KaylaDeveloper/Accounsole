import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/Repository";
import getRepository from "services/getRepository";
import { v4 as uuidv4 } from "uuid";
import { JournalEntry } from "../bank/markAsReconciled";

export default async function createManualEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const type = "Manual Entry";

    const { entryData, entryId } = req.body;

    const currentEntryId = entryId ?? uuidv4();

    entryData.forEach((entry: JournalEntry) => {
      entry.id = currentEntryId;
      entry.type = type;
    });

    repository.createBankReconciliationJournalEntry(entryData, entryId);

    return res.status(200).json("Success");
  });
}
