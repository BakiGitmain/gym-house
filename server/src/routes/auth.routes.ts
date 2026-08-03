import {
  Router,
  type Response,
} from "express";
import bcrypt from "bcryptjs";
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
import { requireAuth } from "../middleware/auth.js";
import {
  clearSuccessfulLoginLimit,
  loginRateLimit,
} from "../middleware/login-rate-limit.js";

const router = Router();

const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(/^[a-zA-Z0-9._-]+$/),

  password: z
    .string()
    .min(8)
    .max(128),
});

type LoginUserRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  password_hash: string;
  profile_image_url: string | null;
  role: "admin" | "customer";
  is_active: boolean;
  failed_login_attempts: number;
  locked_until: Date | null;
};

type AccountRow = {
  id: string;
  username: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  role: "admin" | "customer";
  created_at: Date;

  membership_id: string | null;
  membership_starts_at: string | null;
  membership_expires_at: string | null;
  membership_status: string;
  remaining_days: number | null;
};

/*
 * This valid dummy hash makes a missing username
 * take a similar amount of time as a real username.
 * It helps prevent username discovery through timing.
 */
const DUMMY_PASSWORD_HASH =
  "$2b$12$D4G5f18o7aMMfwasBL7GpuQj4LjCPI4kd7ldN8Itv1qPy7n8iVtYG";

function invalidCredentialsResponse(
  response: Response,
) {
  return response.status(401).json({
    success: false,
    code: "INVALID_CREDENTIALS",

    message: {
      en: "The username or password is incorrect.",
      am: "የተጠቃሚ ስምዎ ወይም የይለፍ ቃልዎ ትክክል አይደለም።",
    },
  });
}

router.post(
  "/login",
  loginRateLimit,
  async (request, response, next) => {
    try {
      const parsedLogin =
        loginSchema.safeParse(
          request.body,
        );

      if (!parsedLogin.success) {
        return response.status(400).json({
          success: false,
          code: "INVALID_LOGIN_INPUT",

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
              failed_login_attempts,
              locked_until

            FROM users

            WHERE username = $1

            LIMIT 1
          `,
          [username],
        );

      let user = result.rows[0];

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

        return response.status(429).json({
          success: false,
          code: "ACCOUNT_TEMPORARILY_LOCKED",

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
          [user.id],
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
                      failed_login_attempts + 1
                      >= 5
                    THEN
                      NOW() +
                      INTERVAL '15 minutes'
                    ELSE
                      locked_until
                  END

              WHERE id = $1
            `,
            [user.id],
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
        request.get("user-agent") ||
        "unknown";

      const ipHash =
        hashSensitiveValue(clientIp);

      const userAgentHash =
        hashSensitiveValue(userAgent);

      const sessionExpiration =
        new Date(
          Date.now() +
            getSessionMaxAge(),
        );

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        await client.query(
          `
            UPDATE users
            SET
              failed_login_attempts = 0,
              locked_until = NULL,
              last_login_at = NOW()

            WHERE id = $1
          `,
          [user.id],
        );

        await client.query(
          `
            DELETE FROM auth_sessions

            WHERE
              user_id = $1
              AND expires_at <= NOW()
          `,
          [user.id],
        );

        /*
         * Keep at most four older sessions.
         * The new session becomes the fifth.
         */
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
          [user.id],
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

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      } finally {
        client.release();
      }

      setSessionCookie(
        response,
        rawSessionToken,
      );

      await clearSuccessfulLoginLimit(
        request,
        username,
      );

      const redirectTo =
        user.role === "admin"
          ? "/admin/dashboard"
          : "/account";

      return response.status(200).json({
        success: true,

        message: {
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

        redirectTo,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.get(
  "/me",
  requireAuth,
  async (request, response, next) => {
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

              membership.id
                AS membership_id,

              membership.starts_at
                AS membership_starts_at,

              membership.expires_at
                AS membership_expires_at,

              CASE
                WHEN membership.id IS NULL
                  THEN 'inactive'

                WHEN membership.status =
                  'cancelled'
                  THEN 'cancelled'

                WHEN membership.status =
                  'paused'
                  THEN 'paused'

                WHEN CURRENT_DATE
                  < membership.starts_at
                  THEN 'scheduled'

                WHEN CURRENT_DATE
                  > membership.expires_at
                  THEN 'expired'

                ELSE 'active'
              END AS membership_status,

              CASE
                WHEN membership.id IS NULL
                  THEN NULL

                ELSE GREATEST(
                  membership.expires_at
                  - CURRENT_DATE,
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

              WHERE user_id = users.id

              ORDER BY
                expires_at DESC,
                created_at DESC

              LIMIT 1
            ) AS membership
              ON TRUE

            WHERE users.id = $1

            LIMIT 1
          `,
          [userId],
        );

      const account = result.rows[0];

      if (!account) {
        clearSessionCookie(response);

        return response.status(401).json({
          success: false,
          code: "ACCOUNT_NOT_FOUND",

          message: {
            en: "The signed-in account could not be found.",
            am: "የገቡበት መለያ ሊገኝ አልቻለም።",
          },
        });
      }

      const redirectTo =
        account.role === "admin"
          ? "/admin/dashboard"
          : "/account";

      return response.status(200).json({
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

        redirectTo,
      });
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/logout",
  async (request, response, next) => {
    try {
      const rawToken =
        request.cookies?.[
          env.SESSION_COOKIE_NAME
        ];

      if (
        typeof rawToken === "string"
      ) {
        const tokenHash =
          hashSensitiveValue(rawToken);

        await pool.query(
          `
            DELETE FROM auth_sessions
            WHERE token_hash = $1
          `,
          [tokenHash],
        );
      }

      clearSessionCookie(response);

      return response.status(200).json({
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