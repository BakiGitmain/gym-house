import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { pool } from "../db/pool.js";
import { hashSensitiveValue } from "../lib/auth-crypto.js";

type RateLimitRow = {
  request_count: number;
  window_started_at: Date;
};

const WINDOW_MINUTES = 15;
const WRITE_LIMIT = 40;

export async function adminCustomerRateLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const adminId =
      request.auth?.user.id;

    if (!adminId) {
      return response.status(401).json({
        success: false,
        code: "AUTH_REQUIRED",

        message: {
          en: "You must sign in as an administrator.",
          am: "እንደ አስተዳዳሪ መግባት አለብዎት።",
        },
      });
    }

    const requestIp =
      request.ip ||
      request.socket.remoteAddress ||
      "unknown";

    const rateKey =
      hashSensitiveValue(
        `admin-customer-write:${adminId}:${requestIp}`,
      );

    const result =
      await pool.query<RateLimitRow>(
        `
          INSERT INTO auth_rate_limits (
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
                  auth_rate_limits.request_count + 1
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
        "Unable to create customer-management rate limit.",
      );
    }

    if (
      Number(record.request_count) <=
      WRITE_LIMIT
    ) {
      return next();
    }

    const resetAt =
      new Date(
        record.window_started_at,
      ).getTime() +
      WINDOW_MINUTES * 60 * 1000;

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
        "ADMIN_CUSTOMER_RATE_LIMITED",

      message: {
        en: "Too many customer-management requests. Wait and try again.",
        am: "ብዙ የደንበኛ አስተዳደር ጥያቄዎች ተልከዋል። ትንሽ ቆይተው ይሞክሩ።",
      },

      retryAfterSeconds,
    });
  } catch (error) {
    return next(error);
  }
}