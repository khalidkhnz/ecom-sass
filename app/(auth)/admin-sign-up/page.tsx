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
import { AdminSignUpForm } from "./admin-signup-form";

export default function AdminSignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Admin Registration
          </CardTitle>
          <CardDescription className="text-center">
            Create a new admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSignUpForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Already have an admin account?{" "}
            <Link href="/admin-login" className="text-primary underline">
              Log in as admin
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/login" className="text-primary underline">
              User Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
