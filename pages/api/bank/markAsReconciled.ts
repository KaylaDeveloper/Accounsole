import { NextApiRequest, NextApiResponse } from "next";
import Repository, { EntryType } from "services/repository/Repository";
import getRepository from "services/getRepository";
import { v4 as uuidv4 } from "uuid";

export type JournalEntry = {
  id: string;
  type: EntryType;
  description: string;
  date: string;
  account_id: number;
  account_name: string;
  debit: number | null;
  credit: number | null;
};

export default async function createBankReconciliationJournalEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getRepository(req, res, (repository: Repository) => {
    const type = "Bank Reconciliation";

    const { entryData, entryId = null, id } = req.body;
    const currentEntryId = entryId ?? uuidv4();

    entryData.forEach((entry: JournalEntry) => {
      entry.id = currentEntryId;
      entry.type = type;
    });

    repository.createBankReconciliationJournalEntry(entryData, entryId);

    repository.markAsReconciled(id, currentEntryId);
    return res.status(200).json("Success");
  });
}
