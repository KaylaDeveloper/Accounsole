import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";
import { v4 as uuidv4 } from "uuid";
import { JournalEntry } from "../bank/markAsReconciled";

export default async function createManualEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const type = "Manual Entry";

    const { entryData, entryId } = req.body;

    const currentEntryId = entryId ?? uuidv4();

    entryData.forEach((entry: JournalEntry) => {
      entry.id = currentEntryId;
      entry.type = type;
    });

    const repository = new Repository(accountId);
    repository.createBankReconciliationJournalEntry(entryData, entryId);

    return res.status(200).json("Success");
  });
}
