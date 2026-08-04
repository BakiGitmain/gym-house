import { pool } from "../db/pool.js";

import {
  sendMembershipExpiredEmail,
  sendMembershipExpiryWarningEmail,
} from "./membership-email.service.js";

type ReminderCandidateRow = {
  user_id: string;
  membership_id: string;

  name: string;
  email: string;

  starts_at: string;
  expires_at: string;

  plan_months: number;
  days_remaining: number;
};

export type MembershipReminderResult = {
  candidates: number;
  sent: number;
  skipped: number;
  failed: number;
};

export async function runMembershipEmailReminders():
  Promise<MembershipReminderResult> {
  /*
   * Expiration warning:
   * exactly 3 days before expiration.
   *
   * Expired email:
   * catches expiration from the last
   * three days. This gives failed jobs
   * another chance without emailing
   * very old expired memberships.
   */
  const candidateResult =
    await pool.query<
      ReminderCandidateRow
    >(
      `
        SELECT
          users.id AS user_id,

          membership.id
            AS membership_id,

          users.name,
          users.email,

          membership.starts_at,
          membership.expires_at,

          GREATEST(
            1,

            (
              EXTRACT(
                YEAR FROM AGE(
                  membership.expires_at,
                  membership.starts_at
                )
              ) * 12

              +

              EXTRACT(
                MONTH FROM AGE(
                  membership.expires_at,
                  membership.starts_at
                )
              )
            )::INTEGER
          ) AS plan_months,

          (
            membership.expires_at -
            CURRENT_DATE
          )::INTEGER
            AS days_remaining

        FROM users

        JOIN LATERAL (
          SELECT
            customer_memberships.id,
            customer_memberships.starts_at,
            customer_memberships.expires_at,
            customer_memberships.status

          FROM customer_memberships

          WHERE
            customer_memberships.user_id =
              users.id

          ORDER BY
            customer_memberships
              .expires_at DESC,

            customer_memberships
              .created_at DESC

          LIMIT 1
        ) AS membership
          ON TRUE

        WHERE
          users.role = 'customer'

          AND users.is_active = TRUE

          AND membership.status =
            'active'

          AND (
            membership.expires_at =
              CURRENT_DATE + 3

            OR

            membership.expires_at
              BETWEEN
                CURRENT_DATE - 3
                AND
                CURRENT_DATE - 1
          )

        ORDER BY
          membership.expires_at ASC,
          users.created_at ASC
      `,
    );

  const result:
    MembershipReminderResult = {
      candidates:
        candidateResult
          .rows
          .length,

      sent: 0,
      skipped: 0,
      failed: 0,
    };

  /*
   * Send sequentially instead of
   * sending every email at once.
   * This is friendlier to Gmail's
   * SMTP service and easier to log.
   */
  for (
    const candidate
    of candidateResult.rows
  ) {
    const input = {
      userId:
        candidate.user_id,

      membershipId:
        candidate.membership_id,

      name:
        candidate.name,

      email:
        candidate.email,

      startsAt:
        candidate.starts_at,

      expiresAt:
        candidate.expires_at,

      planMonths:
        candidate.plan_months,
    };

    const delivery =
      candidate.days_remaining ===
      3
        ? await sendMembershipExpiryWarningEmail(
            input,
          )
        : await sendMembershipExpiredEmail(
            input,
          );

    if (
      delivery.status ===
      "sent"
    ) {
      result.sent += 1;
    } else if (
      delivery.status ===
      "failed"
    ) {
      result.failed += 1;
    } else {
      result.skipped += 1;
    }
  }

  return result;
}