import { users } from "@/schema/users";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authorize } from "@/lib/authorize";
import AdminSidebar from "./admin-sidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authorize("admin");

  const userRow = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!userRow) {
    redirect("/admin-login");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar user={userRow} />
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}

export const dynamic = "force-dynamic";
