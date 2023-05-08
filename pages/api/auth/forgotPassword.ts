import { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prismadb";
import crypto from "crypto";
import nodemailer, { TransportOptions } from "nodemailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email } = req.body;

  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });

  if (!account) {
    await prisma.$disconnect();
    return res.status(400).json({ msg: "Email is not registered" });
  }
  const passwordToken = crypto
    .createHash("md5")
    .update(crypto.randomBytes(70).toString("hex"))
    .digest("hex");
  const passwordTokenExpirationDate = new Date(Date.now() + 1000 * 60 * 10);

  const origin = "http://localhost:3000";
  const resetURL = `${origin}/auth/resetPassword?token=${passwordToken}&email=${email}`;
  const message = `<p>Please reset password by clicking on the following link : 
  <a href="${resetURL}">Reset Password</a></p>`;
  async function sendResetPasswordEmail() {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as TransportOptions);

    await transporter.sendMail({
      from: '"Accounting" <Accounsole@info.com>',
      to: account?.email,
      subject: "Reset Password",
      text: "Hello world?",
      html: message,
    });
  }
  sendResetPasswordEmail();

  const updatedAccount = await prisma.account.update({
    where: {
      email: account.email,
    },
    data: {
      passwordToken,
      passwordTokenExpirationDate,
    },
  });
  await prisma.$disconnect();
  return res.json(updatedAccount);
}
