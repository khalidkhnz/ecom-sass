"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/schema/users";

const insertUserSchema = z.object({
  name: z.coerce.string(),
  email: z.coerce.string(),
  emailVerified: z.coerce.date(),
  image: z.coerce.string(),
  role: z.coerce.string(),
  password: z.coerce.string(),
});

export type CreateUserState = {
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    emailVerified?: string[];
    image?: string[];
    role?: string[];
    password?: string[];
  };
  message?: string;
  status?: "success" | "error";
}

export async function createUserAction(
  prevState: CreateUserState,
  formData: FormData
): Promise<CreateUserState> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("only accessible in development");
  }

  const validatedFields = insertUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    emailVerified: formData.get("emailVerified"),
    image: formData.get("image"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid data",
      status: "error",
    };
  }

  try {
    await db.insert(users).values(validatedFields.data);
  } catch (error) {
    console.error(error);
    return {
      message: "Database error",
      status: "error",
    }
  }

  revalidatePath("/users");
  
  return {
    message: "User created successfully",
    status: "success"
  }
}
