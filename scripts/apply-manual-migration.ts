import { Client } from "pg";
import { config } from "@/lib/config";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Create a new client
  const client = new Client({
    connectionString: config.DB_URL,
  });

  try {
    // Connect to the database
    console.log("Connecting to database...");
    await client.connect();

    // Read the SQL file
    const sqlPath = path.join(
      process.cwd(),
      "drizzle/migrations/0003_manual_column_conversion.sql"
    );
    console.log(`Reading SQL file from ${sqlPath}`);
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Execute the SQL
    console.log("Executing SQL...");
    await client.query(sql);

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.end();
  }
}

main();
