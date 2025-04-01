import { db } from "@/lib/db";
import { DrizzleAdminConfig } from "drizzle-admin/types";
import { usersTableConfig } from "@/app/(admin)/_lib/users-table.config";

export const config: DrizzleAdminConfig = {
  basePath: "/admin",
  schema: {
    users: usersTableConfig,
  },
  db: db,
  dbDialect: "postgresql",
};
