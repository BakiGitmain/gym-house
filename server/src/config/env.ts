import "dotenv/config";

import { z } from "zod";

const optionalEmailSchema =
  z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return undefined;
      }

      return value;
    },
    z
      .string()
      .trim()
      .email()
      .optional(),
  );

const environmentSchema =
  z.object({
    NODE_ENV: z
      .enum([
        "development",
        "test",
        "production",
      ])
      .default("development"),

    PORT: z.coerce
      .number()
      .int()
      .min(1)
      .max(65535)
      .default(5000),

    DATABASE_URL: z
      .string()
      .min(
        1,
        "DATABASE_URL is required.",
      ),

    CLIENT_URLS: z
      .string()
      .default(
        "http://localhost:3000",
      ),

    FRONTEND_URL: z
      .string()
      .trim()
      .url(
        "FRONTEND_URL must be a valid URL.",
      )
      .default(
        "http://localhost:3000",
      ),

    AUTH_PEPPER: z
      .string()
      .min(
        64,
        "AUTH_PEPPER must contain at least 64 characters.",
      ),

    SESSION_COOKIE_NAME: z
      .string()
      .regex(/^[a-zA-Z0-9_-]+$/)
      .default(
        "gym_house_session",
      ),

    SESSION_TTL_DAYS: z.coerce
      .number()
      .int()
      .min(1)
      .max(30)
      .default(7),

    CLOUDINARY_CLOUD_NAME: z
      .string()
      .trim()
      .min(
        1,
        "CLOUDINARY_CLOUD_NAME is required.",
      ),

    CLOUDINARY_API_KEY: z
      .string()
      .trim()
      .min(
        1,
        "CLOUDINARY_API_KEY is required.",
      ),

    CLOUDINARY_API_SECRET: z
      .string()
      .trim()
      .min(
        8,
        "CLOUDINARY_API_SECRET is required.",
      ),

    /*
     * Used only for the administrator's
     * own profile-picture upload.
     */
    CLOUDINARY_ADMIN_AVATAR_PRESET:
      z
        .string()
        .trim()
        .min(
          1,
          "CLOUDINARY_ADMIN_AVATAR_PRESET is required.",
        ),

    /*
     * Used when an administrator uploads
     * a customer's profile picture.
     */
    CLOUDINARY_CUSTOMER_AVATAR_PRESET:
      z
        .string()
        .trim()
        .min(
          1,
          "CLOUDINARY_CUSTOMER_AVATAR_PRESET is required.",
        ),

    EMAIL_USER: z
      .string()
      .trim()
      .email(
        "EMAIL_USER must be a valid email.",
      ),

    EMAIL_APP_PASSWORD: z
      .string()
      .transform((value) =>
        value.replace(/\s+/g, ""),
      )
      .pipe(
        z
          .string()
          .min(
            16,
            "EMAIL_APP_PASSWORD must contain at least 16 characters.",
          ),
      ),

    EMAIL_FROM_NAME: z
      .string()
      .trim()
      .min(
        1,
        "EMAIL_FROM_NAME is required.",
      )
      .default("GYM House"),

    EMAIL_REPLY_TO:
      optionalEmailSchema,

    CRON_SECRET: z
      .string()
      .min(
        32,
        "CRON_SECRET must contain at least 32 characters.",
      ),
  });

const parsedEnvironment =
  environmentSchema.safeParse(
    process.env,
  );

if (!parsedEnvironment.success) {
  console.error(
    "Invalid backend environment variables:",
    parsedEnvironment.error
      .flatten()
      .fieldErrors,
  );

  throw new Error(
    "The Gym House backend environment is invalid.",
  );
}

const environment =
  parsedEnvironment.data;

const clientUrls =
  environment.CLIENT_URLS
    .split(",")
    .map((url) =>
      url
        .trim()
        .replace(/\/+$/, ""),
    )
    .filter(Boolean);

if (clientUrls.length === 0) {
  throw new Error(
    "At least one CLIENT_URLS value is required.",
  );
}

for (const clientUrl of clientUrls) {
  try {
    const parsedUrl =
      new URL(clientUrl);

    if (
      parsedUrl.protocol !==
        "http:" &&
      parsedUrl.protocol !==
        "https:"
    ) {
      throw new Error(
        "Only HTTP and HTTPS URLs are supported.",
      );
    }
  } catch {
    throw new Error(
      `Invalid CLIENT_URLS value: ${clientUrl}`,
    );
  }
}

const frontendUrl =
  environment.FRONTEND_URL
    .replace(/\/+$/, "");

try {
  const parsedFrontendUrl =
    new URL(frontendUrl);

  if (
    parsedFrontendUrl.protocol !==
      "http:" &&
    parsedFrontendUrl.protocol !==
      "https:"
  ) {
    throw new Error();
  }
} catch {
  throw new Error(
    "FRONTEND_URL must use HTTP or HTTPS.",
  );
}

export const env = {
  ...environment,

  clientUrls,
  frontendUrl,

  isProduction:
    environment.NODE_ENV ===
    "production",
};