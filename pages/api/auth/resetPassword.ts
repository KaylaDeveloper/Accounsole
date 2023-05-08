import { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prismadb";
import hashPassword from "utils/hashPassword";

export default async function resetPassword(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token, email, password } = req.body;
  if (!token || !email || !password) {
    await prisma.$disconnect();
    throw new Error("Please provide all values");
  }
  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });

  if (account) {
    if (
      account.passwordToken === token &&
      (account.passwordTokenExpirationDate as Date) > new Date()
    ) {
      await prisma.account.update({
        where: {
          email: account.email,
        },
        data: {
          hashedPassword: await hashPassword(password),
          passwordToken: null,
          passwordTokenExpirationDate: null,
        },
      });
    } else {
      return res
        .status(400)
        .json({ msg: "The reset password link has expired." });
    }
  }
  await prisma.$disconnect();
  return res.send("reset password");
}
