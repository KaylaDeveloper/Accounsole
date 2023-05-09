import csv from "csv-parser";
import { Readable } from "stream";
import { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import path from "path";
import { getSession } from "next-auth/react";
import Repository from "services/repository/Repository.ts";
import turnDateStringIntoDateObject, {
  turnDateStringIntoISOStandard,
} from "utils/turnDateStringIntoDateObject";

const upload = multer({ storage: multer.memoryStorage() });

function runMiddleware(
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse,
  // eslint-disable-next-line unused-imports/no-unused-vars
  fn: (...args: any[]) => void
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function handler(
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse
) {
  try {
    await runMiddleware(req, res, upload.single("csvFile"));
    const session = await getSession({ req });
    if (!session || !session.user || !session.user.email) {
      return res
        .status(403)
        .json("You must be signed in to upload a CSV file.");
    }
    const acountDatabasePath = path.join(
      process.cwd(),
      process.env.SQLITE__ACCOUNT_DB__FOLDER_PATH as string,
      `account-${session?.user?.email}.db`
    );
    const repository = new Repository(acountDatabasePath);
    const accountDatabase = repository.accountDatabase;
    if (!accountDatabase) {
      return res.status(403).json("Failed to open account database.");
    }

    const fileData: Buffer = req.file.buffer;
    const bankAccountName = req.body.bankAccountName;

    const dataArray: { date: string; description: string; amount: number }[] =
      [];

    const openingBalanceDate = repository.findOpeningBalanceDate();

    let hasInvalidData = false;
    let transactionDateBeforeOpeningBalanceDate = false;
    Readable.from(fileData)
      .pipe(csv())
      .on("data", (data: any) => {
        const amount = parseFloat(data.amount);

        if (!data.date || !data.description || !data.amount) {
          hasInvalidData = true;
          return;
        } else if (
          !/^(\d{2})\/(\d{2})\/(\d{4})$/.test(data.date) ||
          isNaN(amount)
        ) {
          hasInvalidData = true;
          return;
        } else if (openingBalanceDate) {
          if (
            turnDateStringIntoDateObject(data.date) <
            new Date(openingBalanceDate)
          ) {
            transactionDateBeforeOpeningBalanceDate = true;
            return;
          }
        }
        dataArray.push({ ...data, date: data.date, amount: amount });
      })
      .on("end", async () => {
        if (hasInvalidData) {
          return res.status(400).json("Invalid data format.");
        }

        if (transactionDateBeforeOpeningBalanceDate) {
          return res
            .status(400)
            .json("Transaction date before opening balance date.");
        }

        const bankTransactions = dataArray.map((data) => {
          const { date, description, amount } = data;
          return {
            bankAccountName: bankAccountName,
            date: turnDateStringIntoISOStandard(date),
            description,
            debit: amount >= 0 ? parseFloat(amount.toFixed(2)) : null,
            credit: amount < 0 ? Math.abs(parseFloat(amount.toFixed(2))) : null,
          };
        });

        repository.createBankTransactions(bankTransactions);
        repository.closeDatabase();

        const totalAmount = bankTransactions.reduce((acc, curr) => {
          return acc + (curr.debit ?? 0) - (curr.credit ?? 0);
        }, 0);

        return res.status(200).json({ totalAmount });
      });
  } catch (error) {
    return res.status(500).json("Error");
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
