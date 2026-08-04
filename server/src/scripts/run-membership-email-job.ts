import { pool } from "../db/pool.js";

import {
  runMembershipEmailReminders,
} from "../services/membership-reminder.service.js";

async function run() {
  console.log(
    "Checking GYM House membership emails...",
  );

  const result =
    await runMembershipEmailReminders();

  console.log(
    "Membership email job complete:",
    result,
  );
}

run()
  .catch((error: unknown) => {
    console.error(
      "Membership email job failed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });