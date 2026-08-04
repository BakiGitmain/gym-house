import {
  timingSafeEqual,
} from "node:crypto";

import {
  Router,
} from "express";

import { env } from "../config/env.js";

import {
  runMembershipEmailReminders,
} from "../services/membership-reminder.service.js";

const router = Router();

function hasValidCronSecret(
  authorizationHeader:
    string | undefined,
) {
  if (!authorizationHeader) {
    return false;
  }

  const expectedHeader =
    `Bearer ${env.CRON_SECRET}`;

  const receivedBuffer =
    Buffer.from(
      authorizationHeader,
      "utf8",
    );

  const expectedBuffer =
    Buffer.from(
      expectedHeader,
      "utf8",
    );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    receivedBuffer,
    expectedBuffer,
  );
}

router.get(
  "/membership-emails",
  async (
    request,
    response,
    next,
  ) => {
    try {
      response.setHeader(
        "Cache-Control",
        "no-store",
      );

      if (
        !hasValidCronSecret(
          request.get(
            "authorization",
          ),
        )
      ) {
        return response
          .status(401)
          .json({
            success: false,

            code:
              "INVALID_CRON_SECRET",

            message: {
              en: "This scheduled job is not authorized.",
              am: "ይህ የታቀደ ስራ ፍቃድ የለውም።",
            },
          });
      }

      const result =
        await runMembershipEmailReminders();

      return response
        .status(200)
        .json({
          success: true,

          message: {
            en: "Membership email reminders were checked successfully.",
            am: "የአባልነት ኢሜይል ማስታወሻዎች በተሳካ ሁኔታ ተፈትሸዋል።",
          },

          result,
        });
    } catch (error) {
      return next(error);
    }
  },
);

export default router;