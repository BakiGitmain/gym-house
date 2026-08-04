import bcrypt from "bcryptjs";
import {
  Router,
  type Response,
} from "express";
import type {
  PoolClient,
} from "pg";
import { z } from "zod";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
  createSessionToken,
  hashSensitiveValue,
  normalizeUsername,
} from "../lib/auth-crypto.js";
import {
  clearSessionCookie,
  getSessionMaxAge,
  setSessionCookie,
} from "../lib/session-cookie.js";
import {
  requireAuth,
} from "../middleware/auth.js";
import {
  clearSuccessfulLoginLimit,
  loginRateLimit,
} from "../middleware/login-rate-limit.js";

const router = Router();

const loginSchema =
  z.object({
    username:
      z
        .string()
        .trim()
        .min(3)
        .max(32)
        .regex(
          /^[a-zA-Z0-9._-]+$/,
        ),

    password:
      z
        .string()
        .min(8)
        .max(128),
  });

const securePasswordSchema =
  z
    .string()
    .min(
      8,
      "The new password must contain at least 8 characters.",
    )
    .max(
      128,
      "The new password is too long.",
    )
    .refine(
      (password) =>
        /[a-z]/.test(password),
      "Include at least one lowercase letter.",
    )
    .refine(
      (password) =>
        /[A-Z]/.test(password),
      "Include at least one uppercase letter.",
    )
    .refine(
      (password) =>
        /\d/.test(password),
      "Include at least one number.",
    );

const changeTemporaryPasswordSchema =
  z
    .object({
      currentPassword:
        z
          .string()
          .min(8)
          .max(128),

      newPassword:
        securePasswordSchema,

      confirmPassword:
        z
          .string()
          .min(8)
          .max(128),
    })
    .superRefine(
      (
        data,
        context,
      ) => {
        if (
          data.newPassword !==
          data.confirmPassword
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "confirmPassword",
            ],

            message:
              "The password confirmation does not match.",
          });
        }

        if (
          data.currentPassword ===
          data.newPassword
        ) {
          context.addIssue({
            code:
              z.ZodIssueCode.custom,

            path: [
              "newPassword",
            ],

            message:
              "Choose a password different from the temporary password.",
          });
        }
      },
    );

type UserRole =
  | "admin"
  | "customer";

type LoginUserRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;

  profile_image_url:
    | string
    | null;

  role: UserRole;
  is_active: boolean;
  must_change_password: boolean;

  failed_login_attempts:
    number;

  locked_until:
    | Date
    | null;
};

type AccountRow = {
  id: string;
  username: string;
  name: string;
  email: string;

  profile_image_url:
    | string
    | null;

  role: UserRole;
  created_at: Date;
  must_change_password: boolean;

  membership_id:
    | string
    | null;

  membership_starts_at:
    | Date
    | string
    | null;

  membership_expires_at:
    | Date
    | string
    | null;

  membership_status:
    | "active"
    | "inactive"
    | "scheduled"
    | "paused"
    | "cancelled"
    | "expired";

  remaining_days:
    | number
    | null;
};

type PasswordChangeUserRow = {
  id: string;
  role: UserRole;
  password_hash: string;
  must_change_password: boolean;
  is_active: boolean;
};

const DUMMY_PASSWORD_HASH =
  "$2b$12$D4G5f18o7aMMfwasBL7GpuQj4LjCPI4kd7ldN8Itv1qPy7n8iVtYG";

function invalidCredentialsResponse(
  response: Response,
) {
  return response
    .status(401)
    .json({
      success: false,

      code:
        "INVALID_CREDENTIALS",

      message: {
        en: "The username or password is incorrect.",

        am: "የተጠቃሚ ስምዎ ወይም የይለፍ ቃልዎ ትክክል አይደለም።",
      },
    });
}

async function rollbackQuietly(
  client: PoolClient,
) {
  try {
    await client.query(
      "ROLLBACK",
    );
  } catch {
    // Preserve the original error.
  }
}

router.post(
  "/login",
  loginRateLimit,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const parsedLogin =
        loginSchema.safeParse(
          request.body,
        );

      if (!parsedLogin.success) {
        return response
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_LOGIN_INPUT",

            message: {
              en: "Enter a valid username and password.",

              am: "ትክክለኛ የተጠቃሚ ስምና የይለፍ ቃል ያስገቡ።",
            },
          });
      }

      const username =
        normalizeUsername(
          parsedLogin.data.username,
        );

      const password =
        parsedLogin.data.password;

      const result =
        await pool.query<LoginUserRow>(
          `
            SELECT
              id,
              username,
              name,
              email,
              password_hash,
              profile_image_url,
              role,
              is_active,
              must_change_password,
              failed_login_attempts,
              locked_until

            FROM users

            WHERE username = $1

            LIMIT 1
          `,
          [
            username,
          ],
        );

      let user =
        result.rows[0];

      if (!user) {
        await bcrypt.compare(
          password,
          DUMMY_PASSWORD_HASH,
        );

        return invalidCredentialsResponse(
          response,
        );
      }

      if (
        user.locked_until &&
        user.locked_until.getTime() >
          Date.now()
      ) {
        await bcrypt.compare(
          password,
          user.password_hash,
        );

        return response
          .status(429)
          .json({
            success: false,

            code:
              "ACCOUNT_TEMPORARILY_LOCKED",

            message: {
              en: "This account is temporarily locked because of repeated login attempts. Please try again later.",

              am: "በተደጋጋሚ የመግቢያ ሙከራ ምክንያት መለያው ለጊዜው ተዘግቷል። ቆይተው እንደገና ይሞክሩ።",
            },

            lockedUntil:
              user.locked_until,
          });
      }

      if (
        user.locked_until &&
        user.locked_until.getTime() <=
          Date.now()
      ) {
        await pool.query(
          `
            UPDATE users

            SET
              failed_login_attempts = 0,
              locked_until = NULL

            WHERE id = $1
          `,
          [
            user.id,
          ],
        );

        user = {
          ...user,
          failed_login_attempts: 0,
          locked_until: null,
        };
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password_hash,
        );

      if (
        !passwordMatches ||
        !user.is_active
      ) {
        if (user.is_active) {
          await pool.query(
            `
              UPDATE users

              SET
                failed_login_attempts =
                  failed_login_attempts + 1,

                locked_until =
                  CASE
                    WHEN
                      failed_login_attempts + 1 >= 5
                    THEN
                      NOW() + INTERVAL '15 minutes'

                    ELSE
                      locked_until
                  END

              WHERE id = $1
            `,
            [
              user.id,
            ],
          );
        }

        return invalidCredentialsResponse(
          response,
        );
      }

      const rawSessionToken =
        createSessionToken();

      const sessionTokenHash =
        hashSensitiveValue(
          rawSessionToken,
        );

      const clientIp =
        request.ip ||
        request.socket.remoteAddress ||
        "unknown";

      const userAgent =
        request.get(
          "user-agent",
        ) ||
        "unknown";

      const ipHash =
        hashSensitiveValue(
          clientIp,
        );

      const userAgentHash =
        hashSensitiveValue(
          userAgent,
        );

      const sessionExpiration =
        new Date(
          Date.now() +
            getSessionMaxAge(),
        );

      const client =
        await pool.connect();

      try {
        await client.query(
          "BEGIN",
        );

        await client.query(
          `
            UPDATE users

            SET
              failed_login_attempts = 0,
              locked_until = NULL,
              last_login_at = NOW()

            WHERE id = $1
          `,
          [
            user.id,
          ],
        );

        await client.query(
          `
            DELETE FROM auth_sessions

            WHERE
              user_id = $1
              AND expires_at <= NOW()
          `,
          [
            user.id,
          ],
        );

        await client.query(
          `
            DELETE FROM auth_sessions

            WHERE id IN (
              SELECT id

              FROM auth_sessions

              WHERE user_id = $1

              ORDER BY created_at DESC

              OFFSET 4
            )
          `,
          [
            user.id,
          ],
        );

        await client.query(
          `
            INSERT INTO auth_sessions (
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
            user.id,
            sessionTokenHash,
            ipHash,
            userAgentHash,
            sessionExpiration,
          ],
        );

        await client.query(
          "COMMIT",
        );
      } catch (error) {
        await rollbackQuietly(
          client,
        );

        throw error;
      } finally {
        client.release();
      }

      setSessionCookie(
        response,
        rawSessionToken,
      );

      try {
        await clearSuccessfulLoginLimit(
          request,
          username,
        );
      } catch (error: unknown) {
        console.error(
          "Unable to clear successful login rate limit:",
          error,
        );
      }

      const mustChangePassword =
        user.role === "customer" &&
        user.must_change_password;

      const redirectTo =
        user.role === "admin"
          ? "/admin/dashboard"
          : mustChangePassword
            ? "/change-password"
            : "/account";

      return response
        .status(200)
        .json({
          success: true,

          message:
            mustChangePassword
              ? {
                  en: "You have signed in. Create a private password to continue.",

                  am: "ገብተዋል። ለመቀጠል የግል የይለፍ ቃል ይፍጠሩ።",
                }
              : {
                  en: "You have signed in successfully.",

                  am: "በተሳካ ሁኔታ ገብተዋል።",
                },

          user: {
            id: user.id,
            username: user.username,
            name: user.name,

            profileImageUrl:
              user.profile_image_url,

            role: user.role,
          },

          mustChangePassword,
          redirectTo,
        });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/change-temporary-password",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    const parsedPassword =
      changeTemporaryPasswordSchema
        .safeParse(
          request.body,
        );

    if (!parsedPassword.success) {
      return response
        .status(400)
        .json({
          success: false,

          code:
            "INVALID_NEW_PASSWORD",

          message: {
            en: "Use at least 8 characters with an uppercase letter, lowercase letter, and number. Make sure both new passwords match.",

            am: "ቢያንስ 8 ቁምፊዎች፣ ትልቅ ፊደል፣ ትንሽ ፊደልና ቁጥር ያለው የይለፍ ቃል ይጠቀሙ። ሁለቱም የይለፍ ቃሎች መመሳሰል አለባቸው።",
          },

          errors:
            parsedPassword.error
              .flatten()
              .fieldErrors,
        });
    }

    const userId =
      request.auth!.user.id;

    const sessionId =
      request.auth!.sessionId;

    const {
      currentPassword,
      newPassword,
    } = parsedPassword.data;

    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN",
      );

      const userResult =
        await client
          .query<PasswordChangeUserRow>(
            `
              SELECT
                id,
                role,
                password_hash,
                must_change_password,
                is_active

              FROM users

              WHERE id = $1

              LIMIT 1

              FOR UPDATE
            `,
            [
              userId,
            ],
          );

      const user =
        userResult.rows[0];

      if (
        !user ||
        !user.is_active
      ) {
        await rollbackQuietly(
          client,
        );

        clearSessionCookie(
          response,
        );

        return response
          .status(401)
          .json({
            success: false,

            code:
              "ACCOUNT_NOT_FOUND",

            message: {
              en: "The signed-in account could not be found.",

              am: "የገቡበት መለያ ሊገኝ አልቻለም።",
            },
          });
      }

      if (
        user.role !== "customer"
      ) {
        await rollbackQuietly(
          client,
        );

        return response
          .status(403)
          .json({
            success: false,

            code:
              "CUSTOMER_ACCOUNT_REQUIRED",

            message: {
              en: "This password setup page is only for customer accounts.",

              am: "ይህ የይለፍ ቃል ማዘጋጃ ገጽ ለደንበኛ መለያዎች ብቻ ነው።",
            },
          });
      }

      if (
        !user.must_change_password
      ) {
        await rollbackQuietly(
          client,
        );

        return response
          .status(409)
          .json({
            success: false,

            code:
              "PASSWORD_CHANGE_NOT_REQUIRED",

            message: {
              en: "This account has already created its private password.",

              am: "ይህ መለያ የግል የይለፍ ቃሉን ቀድሞ ፈጥሯል።",
            },

            redirectTo:
              "/account",
          });
      }

      const temporaryPasswordMatches =
        await bcrypt.compare(
          currentPassword,
          user.password_hash,
        );

      if (
        !temporaryPasswordMatches
      ) {
        await rollbackQuietly(
          client,
        );

        return response
          .status(401)
          .json({
            success: false,

            code:
              "INVALID_TEMPORARY_PASSWORD",

            message: {
              en: "The temporary password is incorrect. Enter the password from your welcome email.",

              am: "ጊዜያዊ የይለፍ ቃሉ ትክክል አይደለም። በመግቢያ ኢሜይልዎ የተላከውን የይለፍ ቃል ያስገቡ።",
            },
          });
      }

      const newPasswordMatchesOld =
        await bcrypt.compare(
          newPassword,
          user.password_hash,
        );

      if (newPasswordMatchesOld) {
        await rollbackQuietly(
          client,
        );

        return response
          .status(400)
          .json({
            success: false,

            code:
              "PASSWORD_MUST_BE_DIFFERENT",

            message: {
              en: "Your private password must be different from the temporary password.",

              am: "የግል የይለፍ ቃልዎ ከጊዜያዊው የይለፍ ቃል የተለየ መሆን አለበት።",
            },
          });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12,
        );

      await client.query(
        `
          UPDATE users

          SET
            password_hash = $2,
            must_change_password = FALSE,
            failed_login_attempts = 0,
            locked_until = NULL

          WHERE id = $1
        `,
        [
          userId,
          newPasswordHash,
        ],
      );

      await client.query(
        `
          DELETE FROM auth_sessions

          WHERE
            user_id = $1
            AND id <> $2
        `,
        [
          userId,
          sessionId,
        ],
      );

      await client.query(
        "COMMIT",
      );

      return response
        .status(200)
        .json({
          success: true,

          message: {
            en: "Your private password has been created successfully.",

            am: "የግል የይለፍ ቃልዎ በተሳካ ሁኔታ ተፈጥሯል።",
          },

          mustChangePassword:
            false,

          redirectTo:
            "/account",
        });
    } catch (error) {
      await rollbackQuietly(
        client,
      );

      return next(error);
    } finally {
      client.release();
    }
  },
);

router.get(
  "/me",
  requireAuth,
  async (
    request,
    response,
    next,
  ) => {
    try {
      const userId =
        request.auth!.user.id;

      const result =
        await pool.query<AccountRow>(
          `
            SELECT
              users.id,
              users.username,
              users.name,
              users.email,
              users.profile_image_url,
              users.role,
              users.created_at,
              users.must_change_password,

              membership.id
                AS membership_id,

              membership.starts_at
                AS membership_starts_at,

              membership.expires_at
                AS membership_expires_at,

              CASE
                WHEN membership.id IS NULL
                  THEN 'inactive'

                WHEN membership.status = 'cancelled'
                  THEN 'cancelled'

                WHEN membership.status = 'paused'
                  THEN 'paused'

                WHEN CURRENT_DATE <
                  membership.starts_at
                  THEN 'scheduled'

                WHEN CURRENT_DATE >
                  membership.expires_at
                  THEN 'expired'

                ELSE 'active'
              END AS membership_status,

              CASE
                WHEN membership.id IS NULL
                  THEN NULL

                ELSE GREATEST(
                  membership.expires_at -
                  CURRENT_DATE,
                  0
                )
              END AS remaining_days

            FROM users

            LEFT JOIN LATERAL (
              SELECT
                id,
                starts_at,
                expires_at,
                status

              FROM customer_memberships

              WHERE
                user_id = users.id

              ORDER BY
                expires_at DESC,
                created_at DESC

              LIMIT 1
            ) AS membership
              ON TRUE

            WHERE users.id = $1

            LIMIT 1
          `,
          [
            userId,
          ],
        );

      const account =
        result.rows[0];

      if (!account) {
        clearSessionCookie(
          response,
        );

        return response
          .status(401)
          .json({
            success: false,

            code:
              "ACCOUNT_NOT_FOUND",

            message: {
              en: "The signed-in account could not be found.",

              am: "የገቡበት መለያ ሊገኝ አልቻለም።",
            },
          });
      }

      const mustChangePassword =
        account.role === "customer" &&
        account.must_change_password;

      const redirectTo =
        account.role === "admin"
          ? "/admin/dashboard"
          : mustChangePassword
            ? "/change-password"
            : "/account";

      /*
       * A customer who must change their password
       * is still authenticated. Therefore this is
       * a successful 200 response, not a 403.
       */
      return response
        .status(200)
        .json({
          success: true,

          user: {
            id: account.id,
            username: account.username,
            name: account.name,
            email: account.email,

            profileImageUrl:
              account.profile_image_url,

            role: account.role,

            registrationDate:
              account.created_at,
          },

          membership:
            account.role === "customer"
              ? {
                  id:
                    account.membership_id,

                  startsAt:
                    account.membership_starts_at,

                  expiresAt:
                    account.membership_expires_at,

                  status:
                    account.membership_status,

                  remainingDays:
                    account.remaining_days,
                }
              : null,

          mustChangePassword,
          redirectTo,
        });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/logout",
  async (
    request,
    response,
    next,
  ) => {
    try {
      const rawToken =
        request.cookies?.[
          env.SESSION_COOKIE_NAME
        ];

      if (
        typeof rawToken ===
        "string"
      ) {
        const tokenHash =
          hashSensitiveValue(
            rawToken,
          );

        await pool.query(
          `
            DELETE FROM auth_sessions

            WHERE token_hash = $1
          `,
          [
            tokenHash,
          ],
        );
      }

      clearSessionCookie(
        response,
      );

      return response
        .status(200)
        .json({
          success: true,

          message: {
            en: "You have signed out successfully.",

            am: "በተሳካ ሁኔታ ወጥተዋል።",
          },
        });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;