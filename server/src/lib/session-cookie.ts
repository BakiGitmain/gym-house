import type {
  CookieOptions,
  Response,
} from "express";

import { env } from "../config/env.js";

export function getSessionMaxAge() {
  return (
    env.SESSION_TTL_DAYS *
    24 *
    60 *
    60 *
    1000
  );
}

function getBaseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,

    // We will use a same-origin frontend proxy
    // in production.
    sameSite: "lax",

    path: "/",
  };
}

export function setSessionCookie(
  response: Response,
  token: string,
) {
  response.cookie(
    env.SESSION_COOKIE_NAME,
    token,
    {
      ...getBaseCookieOptions(),
      maxAge: getSessionMaxAge(),
    },
  );
}

export function clearSessionCookie(
  response: Response,
) {
  response.clearCookie(
    env.SESSION_COOKIE_NAME,
    getBaseCookieOptions(),
  );
}