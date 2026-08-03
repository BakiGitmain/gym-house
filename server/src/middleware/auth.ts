import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { hashSensitiveValue } from "../lib/auth-crypto.js";
import { clearSessionCookie } from "../lib/session-cookie.js";

export type AuthRole =
  | "admin"
  | "customer";

export type AuthContext = {
  sessionId: string;

  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    profileImageUrl: string | null;
    role: AuthRole;
  };
};

type SessionRow = {
  session_id: string;
  user_id: string;
  username: string;
  name: string;
  email: string;
  profile_image_url: string | null;
  role: AuthRole;
};

function sendUnauthorized(
  response: Response,
) {
  return response.status(401).json({
    success: false,
    code: "AUTH_REQUIRED",

    message: {
      en: "You must sign in to access this page.",
      am: "ይህን ገጽ ለመጠቀም መግባት አለብዎት።",
    },
  });
}

export const requireAuth: RequestHandler =
  async (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const rawToken =
        request.cookies?.[
          env.SESSION_COOKIE_NAME
        ];

      if (
        typeof rawToken !== "string" ||
        rawToken.length < 20
      ) {
        clearSessionCookie(response);

        return sendUnauthorized(response);
      }

      const tokenHash =
        hashSensitiveValue(rawToken);

      const result =
        await pool.query<SessionRow>(
          `
            SELECT
              sessions.id AS session_id,
              users.id AS user_id,
              users.username,
              users.name,
              users.email,
              users.profile_image_url,
              users.role

            FROM auth_sessions AS sessions

            INNER JOIN users
              ON users.id = sessions.user_id

            WHERE
              sessions.token_hash = $1
              AND sessions.expires_at > NOW()
              AND users.is_active = TRUE

            LIMIT 1
          `,
          [tokenHash],
        );

      const session = result.rows[0];

      if (!session) {
        clearSessionCookie(response);

        return sendUnauthorized(response);
      }

      request.auth = {
        sessionId: session.session_id,

        user: {
          id: session.user_id,
          username: session.username,
          name: session.name,
          email: session.email,

          profileImageUrl:
            session.profile_image_url,

          role: session.role,
        },
      };

      await pool.query(
        `
          UPDATE auth_sessions
          SET last_seen_at = NOW()

          WHERE
            id = $1
            AND last_seen_at
              < NOW() - INTERVAL '15 minutes'
        `,
        [session.session_id],
      );

      return next();
    } catch (error) {
      return next(error);
    }
  };

export function requireRole(
  ...allowedRoles: AuthRole[]
): RequestHandler {
  return (
    request,
    response,
    next,
  ) => {
    if (!request.auth) {
      return sendUnauthorized(response);
    }

    if (
      !allowedRoles.includes(
        request.auth.user.role,
      )
    ) {
      return response.status(403).json({
        success: false,
        code: "FORBIDDEN",

        message: {
          en: "You do not have permission to access this resource.",
          am: "ይህን ክፍል ለመጠቀም ፈቃድ የለዎትም።",
        },
      });
    }

    return next();
  };
}