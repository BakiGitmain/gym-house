import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";

const safeMethods = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function enforceTrustedOrigin(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (safeMethods.has(request.method)) {
    return next();
  }

  const origin = request.get("origin");

  // Non-browser tools may not include Origin.
  if (!origin) {
    return next();
  }

  const normalizedOrigin =
    origin.replace(/\/+$/, "");

  if (
    env.clientUrls.includes(
      normalizedOrigin,
    )
  ) {
    return next();
  }

  return response.status(403).json({
    success: false,
    code: "UNTRUSTED_ORIGIN",

    message: {
      en: "This request did not come from an approved application.",
      am: "ይህ ጥያቄ ከተፈቀደ መተግበሪያ አልመጣም።",
    },
  });
}