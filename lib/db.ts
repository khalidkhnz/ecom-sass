import { drizzle } from "drizzle-orm/node-postgres";
import { Pool, Client } from "pg";
import { config } from "@/lib/config";
import * as schema from "@/lib/schema";

// Use snake_case for the database, as PostgreSQL conventionally uses snake_case
const pool = new Pool({
  connectionString: config.DB_URL,
});

// Make sure we explicitly set casing to snake_case for consistency
export const db = drizzle(pool, {
  schema,
  casing: "snake_case",
});

// Debug logging only in development, but with proper type handling
if (process.env.NODE_ENV !== "production") {
  // Use console directly for debugging SQL queries
  console.log("SQL debugging enabled");
}

export async function openConnection() {
  const client = new Client({ connectionString: config.DB_URL });
  await client.connect();
  const db = drizzle(client, { schema, casing: "snake_case" });
  const closeConnection = async () => await client.end();
  return {
    db,
    closeConnection,
  };
}
