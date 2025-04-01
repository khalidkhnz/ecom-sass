import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import "dotenv/config";

// For local development - use regular postgres driver
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize Drizzle with the pg pool connection
export const db = drizzle({ client: pool, schema });

// Alternatively for serverless/edge environments, you can use Neon's HTTP driver
// Uncomment below and comment out the above code if using Neon's serverless driver
/*
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });
*/
