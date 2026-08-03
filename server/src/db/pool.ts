import { Pool } from "pg";

import { env } from "../config/env.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,

  // Keep each serverless instance from opening
  // too many PostgreSQL connections.
  max: env.isProduction ? 5 : 10,

  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 20_000,
  keepAlive: true,
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL pool error:",
    error,
  );
});

export async function checkDatabaseConnection() {
  await pool.query("SELECT 1");
}