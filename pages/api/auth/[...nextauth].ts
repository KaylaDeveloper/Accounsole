import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../lib/prismadb";
import bcrypt from "bcryptjs";

export default NextAuth({
  providers: [
    CredentialsProvider({
      type: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials): Promise<any> {
        const account = await prisma.account.findUnique({
          where: {
            email: credentials?.email,
          },
        });

        if (!account) {
          await prisma.$disconnect();
          throw new Error("Email is not registered");
        }

        const isPasswordCorrect = await bcrypt.compare(
          credentials!.password,
          account.hashedPassword
        );

        if (!isPasswordCorrect) {
          throw new Error("Password is incorrect");
        }

        await prisma.$disconnect();

        return account;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET,
  },
});
