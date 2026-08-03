import { readFile } from "node:fs/promises";

import { pool } from "../db/pool.js";

async function migrate() {
  const migrationFile = new URL(
    "../db/migrations/001-auth.sql",
    import.meta.url,
  );

  const migrationSql =
    await readFile(
      migrationFile,
      "utf8",
    );

  await pool.query(migrationSql);

  console.log(
    "Gym House authentication tables created successfully.",
  );
}

migrate()
  .catch((error) => {
    console.error(
      "Database migration failed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });