import {
  createHmac,
  randomBytes,
} from "node:crypto";

import { env } from "../config/env.js";

export function normalizeUsername(
  username: string,
) {
  return username.trim().toLowerCase();
}

export function createSessionToken() {
  return randomBytes(48).toString("base64url");
}

export function hashSensitiveValue(
  value: string,
) {
  return createHmac(
    "sha256",
    env.AUTH_PEPPER,
  )
    .update(value)
    .digest("hex");
}