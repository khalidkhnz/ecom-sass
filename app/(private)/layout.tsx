import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/schema/users";
import { authorize } from "@/lib/authorize";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allow rendering the children without forced authentication
  // Each page in the private section should implement its own
  // authentication check and redirect logic as needed
  return <>{children}</>;
}

export const dynamic = "force-dynamic";
