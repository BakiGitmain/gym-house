import {
  readdir,
  readFile,
} from "node:fs/promises";

import { pool } from "../db/pool.js";

async function migrate() {
  const migrationsDirectory =
    new URL(
      "../db/migrations/",
      import.meta.url,
    );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS
      schema_migrations (
        name TEXT PRIMARY KEY,

        applied_at TIMESTAMPTZ
          NOT NULL
          DEFAULT NOW()
      )
  `);

  const directoryEntries =
    await readdir(
      migrationsDirectory,
      {
        withFileTypes: true,
      },
    );

  const migrationFiles =
    directoryEntries
      .filter(
        (entry) =>
          entry.isFile() &&
          entry.name.endsWith(
            ".sql",
          ),
      )
      .map(
        (entry) => entry.name,
      )
      .sort(
        (first, second) =>
          first.localeCompare(
            second,
          ),
      );

  const appliedResult =
    await pool.query<{
      name: string;
    }>(
      `
        SELECT name
        FROM schema_migrations
      `,
    );

  const appliedMigrations =
    new Set(
      appliedResult.rows.map(
        (row) => row.name,
      ),
    );

  for (
    const migrationFile
    of migrationFiles
  ) {
    if (
      appliedMigrations.has(
        migrationFile,
      )
    ) {
      console.log(
        `Skipping ${migrationFile}`,
      );

      continue;
    }

    const migrationSql =
      await readFile(
        new URL(
          migrationFile,
          migrationsDirectory,
        ),
        "utf8",
      );

    console.log(
      `Applying ${migrationFile}`,
    );

    await pool.query(
      migrationSql,
    );

    await pool.query(
      `
        INSERT INTO
          schema_migrations (
            name
          )

        VALUES ($1)

        ON CONFLICT (name)
        DO NOTHING
      `,
      [migrationFile],
    );

    console.log(
      `Applied ${migrationFile}`,
    );
  }

  console.log(
    "All database migrations completed.",
  );
}

migrate()
  .catch((error: unknown) => {
    console.error(
      "Database migration failed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });