import { NextApiRequest, NextApiResponse } from "next";
import Repository from "services/repository/repository";
import getDatabase from "services/getDatabase";
import { v4 as uuidv4 } from "uuid";
import { JournalEntry } from "./markAsReconciled";

export default async function createBankReconciliationJournalEntry(
  req: NextApiRequest,
  res: NextApiResponse
) {
  getDatabase(req, res, (accountId: string) => {
    const type = "Bank Reconciliation";

    const { allEntries } = req.body;

    allEntries.forEach(
      (entry: { entry: JournalEntry[]; bankTransactionId: number }) => {
        const entryId = uuidv4();
        entry.entry.forEach((entry: JournalEntry) => {
          entry.id = entryId;
          entry.type = type;
        });

        const repository = new Repository(accountId);
        repository.createBankReconciliationJournalEntry(entry.entry);

        repository.markAsReconciled(entry.bankTransactionId, entryId);
      }
    );

    return res.status(200).json("Success");
  });
}
