"use client";

import {
  authClient,
  EmailSignInFunction,
  SignOutFunction,
  SignUpFunction,
} from "@/lib/auth-client";
import { createContext, useContext, useState } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: EmailSignInFunction;
  signUp: SignUpFunction;
  signOut: SignOutFunction;
} | null;

const AuthContext = createContext<AuthContextType>(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const signIn: EmailSignInFunction = async (payload) => {
    const response = await authClient.signIn.email(payload);
    return response;
  };

  const signUp: SignUpFunction = async (payload) => {
    const response = await authClient.signUp.email(payload);
    return response;
  };

  const signOut: SignOutFunction = async () => {
    return await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
