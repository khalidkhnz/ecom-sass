"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/schema/users";

const updateUserSchema = z.object({
  id: z.coerce.string().cuid2(),
  name: z.coerce.string(),
  email: z.coerce.string(),
  emailVerified: z.coerce.date(),
  image: z.coerce.string(),
  role: z.coerce.string(),
  password: z.coerce.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
  .partial()
  .required({ id: true });

export type UpdateUserState = {
  errors?: {
    id?: string[];
    name?: string[];
    email?: string[];
    emailVerified?: string[];
    image?: string[];
    role?: string[];
    password?: string[];
    createdAt?: string[];
    updatedAt?: string[];
  };
  message?: string;
  status?: "success" | "error";
}

export async function updateUserAction(
  prevState: UpdateUserState,
  formData: FormData
): Promise<UpdateUserState> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("only accessible in development");
  }

  const validatedFields = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    email: formData.get("email"),
    emailVerified: formData.get("emailVerified"),
    image: formData.get("image"),
    role: formData.get("role"),
    password: formData.get("password"),
    createdAt: formData.get("createdAt"),
    updatedAt: formData.get("updatedAt"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid data",
      status: "error",
    };
  }

  try {
    await db
      .update(users)
      .set(validatedFields.data)
      .where(eq(users.id, validatedFields.data.id));
  } catch (error) {
    console.error(error);
    return {
      message: "Database error",
      status: "error",
    }
  }

  revalidatePath("/users");
  revalidatePath("/users/" + validatedFields.data.id);
  revalidatePath("/users/" + validatedFields.data.id + "/edit");

  return {
    message: "User updated successfully",
    status: "success",
  }
}
