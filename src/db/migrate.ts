import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// This script runs migrations on your database
async function main() {
  console.log("Running migrations...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle({ client: pool });

  // This will run all the migrations in the "drizzle" folder
  await migrate(db, { migrationsFolder: "./drizzle" });

  console.log("Migrations completed successfully");

  // Close the pool connection
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});
