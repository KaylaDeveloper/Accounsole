import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "Bank_transactions_template.csv"
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=Bank_transactions_template.csv"
  );
  res.send(fileContents);
}
