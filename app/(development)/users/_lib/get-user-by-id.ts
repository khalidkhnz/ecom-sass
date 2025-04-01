import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/schema/users";

export type UserRow = Awaited<
  ReturnType<typeof getUserById>
>;

export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: undefined,
  });
}
