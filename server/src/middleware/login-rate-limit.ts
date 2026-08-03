import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { pool } from "../db/pool.js";
import {
  hashSensitiveValue,
  normalizeUsername,
} from "../lib/auth-crypto.js";

type RateLimitRow = {
  request_count: number;
  window_started_at: Date;
};

type RateLimitRule = {
  key: string;
  limit: number;
  windowMinutes: number;
};

function getRequestIp(request: Request) {
  return (
    request.ip ||
    request.socket.remoteAddress ||
    "unknown"
  );
}

async function consumeRateLimit({
  key,
  limit,
  windowMinutes,
}: RateLimitRule) {
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
      [key, windowMinutes],
    );

  const record = result.rows[0];

  if (!record) {
    throw new Error(
      "Unable to create rate-limit record.",
    );
  }

  const resetAt =
    new Date(
      record.window_started_at,
    ).getTime() +
    windowMinutes * 60 * 1000;

  return {
    exceeded:
      Number(record.request_count) > limit,

    retryAfterSeconds: Math.max(
      1,
      Math.ceil(
        (resetAt - Date.now()) / 1000,
      ),
    ),
  };
}

function sendRateLimitResponse(
  response: Response,
  retryAfterSeconds: number,
) {
  response.setHeader(
    "Retry-After",
    retryAfterSeconds.toString(),
  );

  return response.status(429).json({
    success: false,
    code: "AUTH_RATE_LIMITED",

    message: {
      en: "Too many login attempts. Please wait and try again.",
      am: "ብዙ የመግቢያ ሙከራዎች ተደርገዋል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
    },

    retryAfterSeconds,
  });
}

export async function loginRateLimit(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const ip = getRequestIp(request);

    const rawUsername =
      typeof request.body?.username ===
      "string"
        ? request.body.username
        : "invalid";

    const username =
      normalizeUsername(rawUsername);

    const ipKey = hashSensitiveValue(
      `login-ip:${ip}`,
    );

    const accountKey =
      hashSensitiveValue(
        `login-account:${ip}:${username}`,
      );

    const ipResult =
      await consumeRateLimit({
        key: ipKey,
        limit: 30,
        windowMinutes: 15,
      });

    if (ipResult.exceeded) {
      return sendRateLimitResponse(
        response,
        ipResult.retryAfterSeconds,
      );
    }

    const accountResult =
      await consumeRateLimit({
        key: accountKey,
        limit: 8,
        windowMinutes: 15,
      });

    if (accountResult.exceeded) {
      return sendRateLimitResponse(
        response,
        accountResult.retryAfterSeconds,
      );
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export async function clearSuccessfulLoginLimit(
  request: Request,
  username: string,
) {
  const ip = getRequestIp(request);

  const accountKey =
    hashSensitiveValue(
      `login-account:${ip}:${normalizeUsername(
        username,
      )}`,
    );

  await pool.query(
    `
      DELETE FROM auth_rate_limits
      WHERE rate_key = $1
    `,
    [accountKey],
  );
}