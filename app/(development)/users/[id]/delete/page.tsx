import Link from "next/link";
import { eq } from "drizzle-orm";
import { UserDeleteForm } from "../../_components/user-delete-form";
import { db } from "@/lib/db";
import { users } from "@/schema/users";

type Params = Promise<{ id: string }>;

export default async function Page(props: { params: Params }) {
  const params = await props.params;
  const { id } = params;
  const userRow = await db.query.users.findFirst({ where: eq(users.id, id) });

  return (
    <div className="flex flex-col gap-3 p-3">
      <div>Delete User</div>
      <div className="[&>a]:underline">
        <Link href={`/users`}>Back</Link>
      </div>
      <div>
        <UserDeleteForm userRow={ userRow } />
      </div>
    </div>
  );
}
