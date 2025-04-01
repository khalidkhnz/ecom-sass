"use server";

import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// Admin registration code - should be stored in env variables in production
const ADMIN_CODE = "ADMIN123";

// User signup action
export async function userSignUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  try {
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: createId(),
      name,
      email,
      password: hashedPassword,
      role: "user",
    };

    await db.insert(users).values(newUser);

    return { success: true };
  } catch (error) {
    console.error("Error in userSignUp:", error);
    return { error: "Failed to create user account" };
  }
}

// Admin signup action
export async function adminSignUp({
  name,
  email,
  password,
  adminCode,
}: {
  name: string;
  email: string;
  password: string;
  adminCode: string;
}) {
  try {
    // Validate admin code
    if (adminCode !== ADMIN_CODE) {
      return { error: "Invalid admin code" };
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return { error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin user
    const newAdmin = {
      id: createId(),
      name,
      email,
      password: hashedPassword,
      role: "admin",
    };

    await db.insert(users).values(newAdmin);

    return { success: true };
  } catch (error) {
    console.error("Error in adminSignUp:", error);
    return { error: "Failed to create admin account" };
  }
}

// Verify user credentials
export async function verifyUserCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || user.role !== "user" || !user.password) {
      return { error: "Invalid credentials" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying credentials:", error);
    return { error: "Authentication failed" };
  }
}

// Verify admin credentials
export async function verifyAdminCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    // Find admin user
    const admin = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!admin || admin.role !== "admin" || !admin.password) {
      return { error: "Invalid admin credentials" };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return { error: "Invalid credentials" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying admin credentials:", error);
    return { error: "Authentication failed" };
  }
}
