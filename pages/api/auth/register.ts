import { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prismadb";
import hashPassword from "utils/hashPassword";
import Repository from "services/repository/repository";

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;

  const emailAlreadyExists = await prisma.account.findUnique({
    where: {
      email,
    },
  });
  if (emailAlreadyExists) {
    return res.status(400).json({ msg: "Email already exists" });
  }

  const createAccount = async () => {
    const hashedPassword = await hashPassword(password);
    await prisma.account.create({
      data: {
        email: email,
        hashedPassword,
      },
    });

    Repository.createDatabase(email);
  };

  createAccount()
    .then(async () => {
      await prisma.$disconnect();
      res.status(200).json({ msg: "Successfuly created new Account" });
    })
    .catch(async (e: string) => {
      await prisma.$disconnect();
      res.status(400).json({ error: "Error on '/api/register': " + e });
    });
}
