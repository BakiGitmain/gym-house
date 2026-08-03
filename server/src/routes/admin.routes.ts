import {
  Router,
  type Request,
  type Response,
} from "express";
import bcrypt from "bcryptjs";
import type {
  PoolClient,
} from "pg";
import { z } from "zod";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
  cloudinary,
  getAdminAvatarPublicId,
} from "../lib/cloudinary.js";
import {
  createSessionToken,
  hashSensitiveValue,
  normalizeUsername,
} from "../lib/auth-crypto.js";
import {
  getSessionMaxAge,
  setSessionCookie,
} from "../lib/session-cookie.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.js";
import {
  adminSensitiveRateLimit,
} from "../middleware/admin-sensitive-rate-limit.js";

const router = Router();

router.use(
  requireAuth,
  requireRole("admin"),
);

const strongPasswordSchema = z
  .string()
  .min(12)
  .max(128)
  .refine(
    (password) =>
      /[a-z]/.test(password),
    "Password needs a lowercase letter.",
  )
  .refine(
    (password) =>
      /[A-Z]/.test(password),
    "Password needs an uppercase letter.",
  )
  .refine(
    (password) =>
      /\d/.test(password),
    "Password needs a number.",
  )
  .refine(
    (password) =>
      /[^A-Za-z0-9]/.test(
        password,
      ),
    "Password needs a symbol.",
  );

const updateAdminAccountSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(120),

    username: z
      .string()
      .trim()
      .min(3)
      .max(32)
      .regex(
        /^[a-zA-Z0-9._-]+$/,
      ),

    email: z
      .string()
      .trim()
      .email()
      .max(254),

    currentPassword: z
      .string()
      .min(8)
      .max(128),

    newPassword: z
      .union([
        z.literal(""),
        strongPasswordSchema,
      ])
      .optional(),
  });

type AdminPasswordRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
};

type PublicAdminRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  role: "admin";
  created_at: Date;
};

type CloudinaryImageResource = {
  public_id?: string;
  secure_url?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

function getRequestIp(
  request: Request,
) {
  return (
    request.ip ||
    request.socket.remoteAddress ||
    "unknown"
  );
}

function isUniqueViolation(
  error: unknown,
) {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return false;
  }

  return (
    (error as {
      code?: unknown;
    }).code === "23505"
  );
}

async function createAuditLog(
  client: PoolClient,
  request: Request,
  action: string,
  metadata: Record<
    string,
    unknown
  > = {},
) {
  const userId =
    request.auth!.user.id;

  const requestIp =
    getRequestIp(request);

  const userAgent =
    request.get("user-agent") ||
    "unknown";

  await client.query(
    `
      INSERT INTO
        admin_account_audit_logs (
          actor_user_id,
          action,
          ip_hash,
          user_agent_hash,
          metadata
        )

      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5::JSONB
      )
    `,
    [
      userId,
      action,
      hashSensitiveValue(
        requestIp,
      ),
      hashSensitiveValue(
        userAgent,
      ),
      JSON.stringify(metadata),
    ],
  );
}

function invalidCurrentPassword(
  response: Response,
) {
  return response.status(401).json({
    success: false,
    code:
      "CURRENT_PASSWORD_INCORRECT",

    message: {
      en: "Your current password is incorrect.",
      am: "አሁን ያለው የይለፍ ቃል ትክክል አይደለም።",
    },
  });
}

router.patch(
  "/settings/account",
  adminSensitiveRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const parsed =
        updateAdminAccountSchema.safeParse(
          request.body,
        );

      if (!parsed.success) {
        return response.status(400).json({
          success: false,
          code:
            "INVALID_ADMIN_SETTINGS",

          message: {
            en: "Check the account information and password requirements.",
            am: "የመለያ መረጃውንና የይለፍ ቃል መስፈርቶችን ያረጋግጡ።",
          },

          errors:
            parsed.error.flatten()
              .fieldErrors,
        });
      }

      const userId =
        request.auth!.user.id;

      const normalizedUsername =
        normalizeUsername(
          parsed.data.username,
        );

      const normalizedEmail =
        parsed.data.email
          .trim()
          .toLowerCase();

      const newPassword =
        parsed.data.newPassword ||
        undefined;

      const userResult =
        await pool.query<AdminPasswordRow>(
          `
            SELECT
              id,
              username,
              name,
              email,
              password_hash

            FROM users

            WHERE
              id = $1
              AND role = 'admin'
              AND is_active = TRUE

            LIMIT 1
          `,
          [userId],
        );

      const existingUser =
        userResult.rows[0];

      if (!existingUser) {
        return response.status(404).json({
          success: false,
          code:
            "ADMIN_ACCOUNT_NOT_FOUND",

          message: {
            en: "The administrator account could not be found.",
            am: "የአስተዳዳሪው መለያ አልተገኘም።",
          },
        });
      }

      const currentPasswordMatches =
        await bcrypt.compare(
          parsed.data.currentPassword,
          existingUser.password_hash,
        );

      if (
        !currentPasswordMatches
      ) {
        return invalidCurrentPassword(
          response,
        );
      }

      let newPasswordHash:
        | string
        | null = null;

      if (newPassword) {
        const sameAsCurrent =
          await bcrypt.compare(
            newPassword,
            existingUser.password_hash,
          );

        if (sameAsCurrent) {
          return response.status(400).json({
            success: false,
            code:
              "PASSWORD_NOT_CHANGED",

            message: {
              en: "Your new password must be different from your current password.",
              am: "አዲሱ የይለፍ ቃል ከአሁኑ የተለየ መሆን አለበት።",
            },
          });
        }

        newPasswordHash =
          await bcrypt.hash(
            newPassword,
            12,
          );
      }

      const client =
        await pool.connect();

      let updatedUser:
        | PublicAdminRow
        | undefined;

      let replacementSessionToken:
        | string
        | null = null;

      try {
        await client.query("BEGIN");

        const updateResult =
          await client.query<PublicAdminRow>(
            `
              UPDATE users

              SET
                name = $2,
                username = $3,
                email = $4,

                password_hash =
                  CASE
                    WHEN
                      $5::TEXT IS NULL
                    THEN password_hash

                    ELSE $5::TEXT
                  END,

                password_changed_at =
                  CASE
                    WHEN
                      $5::TEXT IS NULL
                    THEN password_changed_at

                    ELSE NOW()
                  END,

                failed_login_attempts = 0,
                locked_until = NULL

              WHERE
                id = $1
                AND role = 'admin'

              RETURNING
                id,
                username,
                name,
                email,
                profile_image_url,
                role,
                created_at
            `,
            [
              userId,
              parsed.data.name.trim(),
              normalizedUsername,
              normalizedEmail,
              newPasswordHash,
            ],
          );

        updatedUser =
          updateResult.rows[0];

        if (!updatedUser) {
          throw new Error(
            "Administrator update failed.",
          );
        }

        if (newPasswordHash) {
          replacementSessionToken =
            createSessionToken();

          const replacementTokenHash =
            hashSensitiveValue(
              replacementSessionToken,
            );

          const sessionExpiration =
            new Date(
              Date.now() +
                getSessionMaxAge(),
            );

          const requestIp =
            getRequestIp(request);

          const userAgent =
            request.get(
              "user-agent",
            ) || "unknown";

          await client.query(
            `
              DELETE FROM auth_sessions

              WHERE user_id = $1
            `,
            [userId],
          );

          await client.query(
            `
              INSERT INTO
                auth_sessions (
                  user_id,
                  token_hash,
                  ip_hash,
                  user_agent_hash,
                  expires_at
                )

              VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
              )
            `,
            [
              userId,
              replacementTokenHash,
              hashSensitiveValue(
                requestIp,
              ),
              hashSensitiveValue(
                userAgent,
              ),
              sessionExpiration,
            ],
          );
        }

        await createAuditLog(
          client,
          request,
          newPasswordHash
            ? "admin_account_and_password_updated"
            : "admin_account_updated",
          {
            usernameChanged:
              existingUser.username !==
              normalizedUsername,

            emailChanged:
              existingUser.email.toLowerCase() !==
              normalizedEmail,

            nameChanged:
              existingUser.name !==
              parsed.data.name.trim(),

            passwordChanged:
              Boolean(
                newPasswordHash,
              ),
          },
        );

        await client.query(
          "COMMIT",
        );
      } catch (error) {
        await client.query(
          "ROLLBACK",
        );

        if (
          isUniqueViolation(error)
        ) {
          return response.status(409).json({
            success: false,
            code:
              "USERNAME_OR_EMAIL_TAKEN",

            message: {
              en: "That username or email is already being used.",
              am: "ይህ የተጠቃሚ ስም ወይም ኢሜይል ቀድሞ ተይዟል።",
            },
          });
        }

        throw error;
      } finally {
        client.release();
      }

      if (
        replacementSessionToken
      ) {
        setSessionCookie(
          response,
          replacementSessionToken,
        );
      }

      return response.status(200).json({
        success: true,

        message: {
          en: newPasswordHash
            ? "Your account and password were updated successfully."
            : "Your account information was updated successfully.",

          am: newPasswordHash
            ? "የመለያዎ መረጃና የይለፍ ቃል ተቀይሯል።"
            : "የመለያዎ መረጃ ተቀይሯል።",
        },

        user: {
          id: updatedUser!.id,
          username:
            updatedUser!.username,
          name: updatedUser!.name,
          email: updatedUser!.email,

          profileImageUrl:
            updatedUser!
              .profile_image_url,

          role: updatedUser!.role,

          registrationDate:
            updatedUser!.created_at,
        },

        passwordChanged:
          Boolean(newPasswordHash),
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/settings/avatar-signature",
  adminSensitiveRateLimit,
  (
    request,
    response,
  ) => {
    const userId =
      request.auth!.user.id;

    const timestamp =
      Math.floor(
        Date.now() / 1000,
      );

    const publicId =
      getAdminAvatarPublicId(
        userId,
      );

    const parameters = {
      timestamp,

      public_id: publicId,

      upload_preset:
        env.CLOUDINARY_ADMIN_AVATAR_PRESET,

      overwrite: "true",
      invalidate: "true",

      transformation:
        "c_fill,g_auto,h_512,w_512,q_auto:good,f_webp",
    };

    const signature =
      cloudinary.utils.api_sign_request(
        parameters,

        env.CLOUDINARY_API_SECRET,
      );

    return response.status(200).json({
      success: true,

      cloudName:
        env.CLOUDINARY_CLOUD_NAME,

      apiKey:
        env.CLOUDINARY_API_KEY,

      uploadUrl:
        `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,

      signature,
      parameters,
    });
  },
);

router.patch(
  "/settings/avatar",
  adminSensitiveRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const userId =
        request.auth!.user.id;

      const publicId =
        getAdminAvatarPublicId(
          userId,
        );

      const cloudinaryResource =
        (await cloudinary.api.resource(
          publicId,
          {
            resource_type: "image",
            type: "upload",
          },
        )) as CloudinaryImageResource;

      if (
        cloudinaryResource.public_id !==
          publicId ||
        !cloudinaryResource.secure_url
      ) {
        return response.status(400).json({
          success: false,
          code:
            "AVATAR_UPLOAD_NOT_FOUND",

          message: {
            en: "The uploaded profile image could not be verified.",
            am: "የተጫነው የመገለጫ ምስል ሊረጋገጥ አልቻለም።",
          },
        });
      }

      const allowedFormats =
        new Set([
          "jpg",
          "jpeg",
          "png",
          "webp",
        ]);

      if (
        cloudinaryResource.format &&
        !allowedFormats.has(
          cloudinaryResource.format,
        )
      ) {
        return response.status(400).json({
          success: false,
          code:
            "INVALID_AVATAR_FORMAT",

          message: {
            en: "The profile image format is not supported.",
            am: "የመገለጫ ምስሉ ፎርማት አይደገፍም።",
          },
        });
      }

      const client =
        await pool.connect();

      let updatedUser:
        | PublicAdminRow
        | undefined;

      try {
        await client.query("BEGIN");

        const updateResult =
          await client.query<PublicAdminRow>(
            `
              UPDATE users

              SET
                profile_image_url = $2,

                profile_image_public_id =
                  $3

              WHERE
                id = $1
                AND role = 'admin'

              RETURNING
                id,
                username,
                name,
                email,
                profile_image_url,
                role,
                created_at
            `,
            [
              userId,

              cloudinaryResource.secure_url,

              publicId,
            ],
          );

        updatedUser =
          updateResult.rows[0];

        if (!updatedUser) {
          throw new Error(
            "Avatar database update failed.",
          );
        }

        await createAuditLog(
          client,
          request,
          "admin_avatar_updated",
          {
            publicId,
            format:
              cloudinaryResource.format,

            width:
              cloudinaryResource.width,

            height:
              cloudinaryResource.height,

            bytes:
              cloudinaryResource.bytes,
          },
        );

        await client.query(
          "COMMIT",
        );
      } catch (error) {
        await client.query(
          "ROLLBACK",
        );

        throw error;
      } finally {
        client.release();
      }

      return response.status(200).json({
        success: true,

        message: {
          en: "Your profile picture was updated successfully.",
          am: "የመገለጫ ምስልዎ ተቀይሯል።",
        },

        user: {
          id: updatedUser!.id,
          username:
            updatedUser!.username,
          name: updatedUser!.name,
          email: updatedUser!.email,

          profileImageUrl:
            updatedUser!
              .profile_image_url,

          role: updatedUser!.role,

          registrationDate:
            updatedUser!.created_at,
        },
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;