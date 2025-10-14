import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create a connection pool
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Create the drizzle database instance with schema
export const db = drizzle(pool, { schema });

export type Database = typeof db;
