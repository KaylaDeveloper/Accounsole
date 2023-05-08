import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import prisma from "../lib/prismadb";
import csv from "csv-parser";

const baseDatabaseFilePath = path.join(
  process.cwd(),
  "fixtures",
  "account",
  "account-base.db"
);

async function deleteExistingBaseDatabase() {
  try {
    if (fs.existsSync(baseDatabaseFilePath)) {
      fs.unlinkSync(baseDatabaseFilePath);
    }
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteExistingBaseDatabase().then(() => {
  const db = new Database(baseDatabaseFilePath);

  db.exec(
    fs
      .readFileSync(
        path.join(process.cwd(), "fixtures", "account", "databaseSchema.sql")
      )
      .toString()
  );

  const listOfAccounts: {
    name: string;
    type: string;
    tax_code: string;
    description: string;
  }[] = [];

  fs.createReadStream(
    path.join(process.cwd(), "fixtures", "account", "ChartOfAccounts.csv")
  )
    .pipe(csv())
    .on("data", (data) => listOfAccounts.push(data))
    .on("end", () => {
      const insert = db.prepare(
        `INSERT INTO chart_of_accounts (name, type, tax_code, description) VALUES (@name, @type, @tax_code, @description)`
      );

      listOfAccounts.forEach((account) => insert.run(account));
    });

  db.prepare(
    "INSERT INTO business_details(business_name, GST_registration, new_business) VALUES (?,?,?)"
  ).run("", "true", "false");
});
