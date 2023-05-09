import Repository from "../services/repository/Repository";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import hashPassword from "../utils/hashPassword";
import { testAccounts } from "playwright/testAccounts";
import * as dotenv from "dotenv";

const envPath = path.join(process.cwd(), ".env.test");
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
}

declare global {
  var prisma: PrismaClient | undefined;
}
const prisma =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: "file://" + process.cwd() + process.env.DATABASE_URL,
      },
    },
  });
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

async function deleteAccountsIfExists() {
  try {
    const count = await prisma.account.count();
    if (count > 0) {
      const deletedAccounts = await prisma.account.deleteMany({});
    }
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
  } catch (error) {
    console.log(error);
  }
}

deleteAccountsIfExists().then(() => {
  testAccounts.forEach(async (account) => {
    try {
      const hashedPassword = await hashPassword(account.password);
      await prisma.account.create({
        data: {
          email: account.email,
          hashedPassword,
        },
      });
      await Repository.createDatabase(account.email);
    } catch (error) {
      console.log(error);
    } finally {
      await prisma.$disconnect();
    }
  });
});
