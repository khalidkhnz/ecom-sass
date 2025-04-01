"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/schema/users";

const deleteUserSchema = z.object({
  id: z.coerce.string().cuid2(),
}).pick({ id: true });

export type DeleteUserState = {
  errors?: {
    id?: string[];
  };
  message?: string;
  status?: "success" | "error";
}

export async function deleteUserAction(
  prevState: DeleteUserState,
  formData: FormData
): Promise<DeleteUserState> {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("only accessible in development");
  }
  
  const validatedFields = deleteUserSchema.safeParse({
    id: formData.get("id"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Invalid data",
      status: "error",
    };
  }

  try {
    await db.delete(users).where(eq(users.id, validatedFields.data.id));
  } catch (error) {
    console.log(error);
    return {
      message: "Database error",
      status: "error",
    }
  }

  revalidatePath("/users");

  return {
    message: "User deleted successfully",
    status: "success",
  }
}
