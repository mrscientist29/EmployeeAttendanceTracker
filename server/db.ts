import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
import * as schema from "../shared/schema";

const { Pool } = pkg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle ORM instance with the schema
export const db = drizzle(pool, { schema });

// Export the pool for other uses (like session store)
export { pool };