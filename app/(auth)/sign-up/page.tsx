import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { UserSignUpForm } from "./user-signup-form";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserSignUpForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline">
              Log in
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/admin-sign-up" className="text-primary underline">
              Admin Registration
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
