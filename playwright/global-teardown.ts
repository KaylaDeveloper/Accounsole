import { FullConfig } from "@playwright/test";
import path from "path";
import fs from "fs";
import { testAccounts } from "./testAccounts";
import Repository from "../services/repository/Repository";

async function globalTeardown(_config: FullConfig) {
  const files = fs.readdirSync(
    path.join(process.cwd(), "data", "account", "e2e-test")
  );
  if (files.length > 0) {
    files.forEach((file) => {
      fs.unlinkSync(
        path.join(process.cwd(), "data", "account", "e2e-test", file)
      );
    });
  }
  testAccounts.forEach(async (account) => {
    Repository.createDatabase(account.email);
  });
}

export default globalTeardown;
