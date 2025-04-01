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
import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your admin credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Need an admin account?{" "}
            <Link href="/admin-sign-up" className="text-primary underline">
              Register as admin
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
