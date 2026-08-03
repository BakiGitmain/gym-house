import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { pool } from "../db/pool.js";
import {
  hashSensitiveValue,
} from "../lib/auth-crypto.js";

type RateLimitRow = {
  request_count: number;
  window_started_at: Date;
};

const WINDOW_MINUTES = 15;
const REQUEST_LIMIT = 12;

export async function adminSensitiveRateLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const userId =
      request.auth?.user.id;

    if (!userId) {
      return response.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",

        message: {
          en: "You must sign in to continue.",
          am: "ለመቀጠል መግባት አለብዎት።",
        },
      });
    }

    const requestIp =
      request.ip ||
      request.socket.remoteAddress ||
      "unknown";

    const rateKey =
      hashSensitiveValue(
        `admin-sensitive:${userId}:${requestIp}`,
      );

    const result =
      await pool.query<RateLimitRow>(
        `
          INSERT INTO
            auth_rate_limits (
              rate_key,
              request_count,
              window_started_at
            )

          VALUES ($1, 1, NOW())

          ON CONFLICT (rate_key)
          DO UPDATE SET
            request_count =
              CASE
                WHEN
                  auth_rate_limits.window_started_at
                  <= NOW() - (
                    $2::INTEGER *
                    INTERVAL '1 minute'
                  )
                THEN 1

                ELSE
                  auth_rate_limits.request_count
                  + 1
              END,

            window_started_at =
              CASE
                WHEN
                  auth_rate_limits.window_started_at
                  <= NOW() - (
                    $2::INTEGER *
                    INTERVAL '1 minute'
                  )
                THEN NOW()

                ELSE
                  auth_rate_limits.window_started_at
              END

          RETURNING
            request_count,
            window_started_at
        `,
        [
          rateKey,
          WINDOW_MINUTES,
        ],
      );

    const record = result.rows[0];

    if (!record) {
      throw new Error(
        "Unable to create admin rate limit.",
      );
    }

    if (
      Number(record.request_count) <=
      REQUEST_LIMIT
    ) {
      return next();
    }

    const resetAt =
      new Date(
        record.window_started_at,
      ).getTime() +
      WINDOW_MINUTES *
        60 *
        1000;

    const retryAfterSeconds =
      Math.max(
        1,
        Math.ceil(
          (resetAt - Date.now()) /
            1000,
        ),
      );

    response.setHeader(
      "Retry-After",
      retryAfterSeconds.toString(),
    );

    return response.status(429).json({
      success: false,
      code:
        "ADMIN_ACTION_RATE_LIMITED",

      message: {
        en: "Too many sensitive account requests. Please wait and try again.",
        am: "ብዙ የመለያ ለውጥ ጥያቄዎች ተልከዋል። ትንሽ ቆይተው ይሞክሩ።",
      },

      retryAfterSeconds,
    });
  } catch (error) {
    return next(error);
  }
}