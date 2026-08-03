import bcrypt from "bcryptjs";
import { z } from "zod";

import { pool } from "../db/pool.js";
import {
  normalizeUsername,
} from "../lib/auth-crypto.js";

const adminEnvironmentSchema =
  z.object({
    ADMIN_NAME: z
      .string()
      .trim()
      .min(2)
      .max(120),

    ADMIN_USERNAME: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
      ),

    ADMIN_EMAIL: z
      .string()
      .trim()
      .email()
      .max(254),

    ADMIN_PASSWORD: z
      .string()
      .min(12)
      .max(128),

    ADMIN_PROFILE_IMAGE_URL: z
      .string()
      .trim()
      .optional()
      .default(""),
  });

async function seedAdmin() {
  const parsedAdmin =
    adminEnvironmentSchema.safeParse(
      process.env,
    );

  if (!parsedAdmin.success) {
    console.error(
      "Invalid admin environment variables:",
      parsedAdmin.error.flatten()
        .fieldErrors,
    );

    throw new Error(
      "Admin environment variables are invalid.",
    );
  }

  const admin =
    parsedAdmin.data;

  const username =
    normalizeUsername(
      admin.ADMIN_USERNAME,
    );

  const email =
    admin.ADMIN_EMAIL.toLowerCase();

  const passwordHash =
    await bcrypt.hash(
      admin.ADMIN_PASSWORD,
      12,
    );

  const profileImageUrl =
    admin.ADMIN_PROFILE_IMAGE_URL ||
    null;

  const result = await pool.query<{
    id: string;
    username: string;
    email: string;
  }>(
    `
      INSERT INTO users (
        username,
        name,
        email,
        password_hash,
        profile_image_url,
        role,
        is_active
      )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        'admin',
        TRUE
      )

      ON CONFLICT (username)
      DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash =
          EXCLUDED.password_hash,
        profile_image_url =
          EXCLUDED.profile_image_url,
        role = 'admin',
        is_active = TRUE,
        failed_login_attempts = 0,
        locked_until = NULL

      RETURNING
        id,
        username,
        email
    `,
    [
      username,
      admin.ADMIN_NAME,
      email,
      passwordHash,
      profileImageUrl,
    ],
  );

  const createdAdmin =
    result.rows[0];

  console.log(
    "Gym House administrator is ready:",
  );

  console.log({
    id: createdAdmin?.id,
    username:
      createdAdmin?.username,
    email: createdAdmin?.email,
  });
}

seedAdmin()
  .catch((error) => {
    console.error(
      "Admin creation failed:",
      error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });