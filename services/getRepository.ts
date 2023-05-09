import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import Repository from "./repository/repository";

export default async function getRepository(
  req: NextApiRequest,
  res: NextApiResponse,
  fc: Function
) {
  const session = await getSession({ req });

  if (!session || !session.user || !session.user.email) {
    return res.status(403).json("You must be signed in to upload a CSV file.");
  }

  const accountId: string = session?.user?.email;

  const repository = new Repository(accountId);
  const accountDatabase = repository.accountDatabase;

  if (!accountDatabase) {
    return res.status(403).json("Failed to open account database.");
  }

  try {
    fc(repository);
  } catch (error: any) {
    return res.status(500).json(error.message);
  } finally {
    repository.closeDatabase();
  }
}
