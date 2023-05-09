import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line unused-imports/no-unused-vars
  var prisma: PrismaClient | undefined;
}

const client =
  globalThis.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: "file://" + process.cwd() + process.env.SQLITE__GLOBAL_DB__PATH,
      },
    },
  });
if (process.env.NODE_ENV !== "production") globalThis.prisma = client;

export default client;
