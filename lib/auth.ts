import { db } from "@/lib/db";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { Provider } from "next-auth/providers";
import { eq } from "drizzle-orm";
import { users } from "@/schema/users";
import { accounts, sessions, verificationTokens } from "@/schema/auth-tables";
import { Adapter } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Postmark from "next-auth/providers/postmark";
import Nodemailer from "next-auth/providers/nodemailer";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const adapter = {
  ...(DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter),
  createUser: async (data: any) => {
    const newUser = {
      id: createId(),
      email: data.email,
      name: data.name,
      image: data.image,
      emailVerified: data.emailVerified,
      role: "user",
    };

    await db.insert(users).values(newUser);
    return newUser;
  },
};

const providers: Provider[] = [
  GitHub,
  Google,
  Postmark({ from: "noreply@example.com" }),
  // Nodemailer({
  //   server: process.env.EMAIL_SERVER_HOST,
  //   from: process.env.EMAIL_FROM,
  // }),
  Credentials({
    credentials: {
      email: {},
      password: { type: "password" },
    },
    authorize: async (credentials) => {
      const email = credentials.email as string;
      const password = credentials.password as string;
      const userRow = await db.query.users.findFirst({
        where: eq(users.email, email),
      });
      if (!userRow) {
        throw new Error("User not found.");
      }
      if (!userRow.password) {
        throw new Error("Password not found.");
      }
      const valid = bcrypt.compareSync(password, userRow.password);
      if (!valid) {
        throw new Error("Invalid password.");
      }
      return userRow;
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: adapter,
  session: {
    strategy: "jwt",
  },
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as string;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
