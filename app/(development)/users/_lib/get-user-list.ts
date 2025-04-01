import { asc, desc, SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { User, users } from "@/schema/users";

export type UserList = Awaited<
  ReturnType<typeof getUserList>
>;

export async function getUserList({
  filters,
  limit,
  offset,
  sortKey,
  sortOrder,
}: {
  filters?: SQL;
  limit?: number;
  offset?: number;
  sortKey?: string;
  sortOrder?: string;
}) {
  let orderBy;
  if (sortKey && sortKey in users) {
    switch (sortOrder) {
      case "asc":
        orderBy = asc(users[sortKey as keyof User]);
        break;
      case "desc":
        orderBy = desc(users[sortKey as keyof User]);
        break;
    }
  }

  return await db.query.users.findMany({
    where: filters,
    orderBy: orderBy,
    limit: limit,
    offset: offset,
    with: undefined
  });
}
