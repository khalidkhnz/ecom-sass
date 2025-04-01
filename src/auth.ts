import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/index"; // your drizzle instance
import { env } from "./env";
import * as schema from "@/db/schema/auth-schema";
import bcrypt from "bcrypt";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    // schema: {
    //   users: schema.user,
    //   accounts: schema.account,
    //   sessions: schema.session,
    //   verifications: schema.verification,
    // },
  }),
  trustedOrigins: ["http://localhost:3000"],
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    async sendVerificationEmail({ token, url, user }, request) {},
    async onEmailVerification(
      { createdAt, email, emailVerified, id, name, updatedAt, image },
      request
    ) {},
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 20,
    requireEmailVerification: true,
    async sendResetPassword({ token, url, user }, request) {},
    resetPasswordTokenExpiresIn: 60 * 60,
    password: {
      hash(password) {
        return bcrypt.hash(password, 10);
      },
      verify({ password, hash }) {
        return bcrypt.compare(password, hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },
});

export type Auth = typeof auth;
