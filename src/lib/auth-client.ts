import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** the base url of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
});

export type EmailSignInFunction = typeof authClient.signIn.email;

export type SignUpFunction = typeof authClient.signUp.email;

export type SignOutFunction = typeof authClient.signOut;

export type Session = typeof authClient.$Infer.Session;
