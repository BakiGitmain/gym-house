import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
  sendEmail,
} from "./email.service.js";

type NotificationType =
  | "welcome"
  | "membership_renewed"
  | "expiry_warning_3_days"
  | "membership_expired";

export type MembershipDate =
  | string
  | Date;

export type EmailDeliveryResult = {
  status:
    | "sent"
    | "skipped"
    | "failed";

  messageId?: string;
  error?: string;
};

type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

type BaseMembershipEmailInput = {
  userId: string;
  membershipId: string;

  name: string;
  email: string;

  startsAt: MembershipDate;
  expiresAt: MembershipDate;

  planMonths: number;
};

type WelcomeEmailInput =
  BaseMembershipEmailInput & {
    username: string;
    initialPassword: string;
  };

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getFirstName(
  name: string,
) {
  return (
    name
      .trim()
      .split(/\s+/)[0] ||
    "Member"
  );
}

function padDatePart(
  value: number,
) {
  return String(value)
    .padStart(2, "0");
}

function getMembershipDateKey(
  value: MembershipDate,
) {
  if (value instanceof Date) {
    if (
      Number.isNaN(
        value.getTime(),
      )
    ) {
      throw new Error(
        "The membership date is invalid.",
      );
    }

    /*
     * PostgreSQL DATE columns can be
     * returned as JavaScript Date objects.
     *
     * Local calendar values preserve the
     * original DATE without moving it
     * backward because of timezone
     * conversion.
     */
    const year =
      value.getFullYear();

    const month =
      padDatePart(
        value.getMonth() + 1,
      );

    const day =
      padDatePart(
        value.getDate(),
      );

    return `${year}-${month}-${day}`;
  }

  const normalizedValue =
    value.trim();

  const directDateMatch =
    normalizedValue.match(
      /^(\d{4})-(\d{2})-(\d{2})/,
    );

  if (directDateMatch) {
    return [
      directDateMatch[1],
      directDateMatch[2],
      directDateMatch[3],
    ].join("-");
  }

  const parsedDate =
    new Date(
      normalizedValue,
    );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    throw new Error(
      `Invalid membership date: ${normalizedValue}`,
    );
  }

  const year =
    parsedDate.getFullYear();

  const month =
    padDatePart(
      parsedDate.getMonth() + 1,
    );

  const day =
    padDatePart(
      parsedDate.getDate(),
    );

  return `${year}-${month}-${day}`;
}

function parseMembershipDate(
  value: MembershipDate,
) {
  const dateKey =
    getMembershipDateKey(
      value,
    );

  /*
   * Noon UTC keeps the calendar date
   * stable while Intl formats it.
   */
  return new Date(
    `${dateKey}T12:00:00.000Z`,
  );
}

function formatDate(
  value: MembershipDate,
  locale:
    | "en-US"
    | "am-ET",
) {
  const date =
    parseMembershipDate(
      value,
    );

  return new Intl
    .DateTimeFormat(
      locale,
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      },
    )
    .format(date);
}

function formatPlan(
  months: number,
  language:
    | "en"
    | "am",
) {
  if (language === "am") {
    return `${months} ወር`;
  }

  return months === 1
    ? "1 Month Membership"
    : `${months} Month Membership`;
}

function createDetailsCard(
  rows: Array<{
    label: string;
    value: string;
  }>,
) {
  return `
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      style="
        margin: 24px 0;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        border: 1px solid #292d28;
        border-radius: 18px;
        background: #0d100d;
      "
    >
      ${rows
        .map(
          (
            row,
            index,
          ) => `
            <tr>
              <td
                style="
                  padding: 16px 18px;
                  ${
                    index <
                    rows.length - 1
                      ? "border-bottom: 1px solid #242824;"
                      : ""
                  }
                "
              >
                <div
                  style="
                    margin-bottom: 5px;
                    color: #8e968d;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: .08em;
                    text-transform: uppercase;
                  "
                >
                  ${escapeHtml(
                    row.label,
                  )}
                </div>

                <div
                  style="
                    color: #f5f7f2;
                    font-size: 15px;
                    font-weight: 700;
                    line-height: 1.5;
                    word-break: break-word;
                  "
                >
                  ${escapeHtml(
                    row.value,
                  )}
                </div>
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function createEmailLayout({
  preheader,
  badge,
  title,
  introductionHtml,
  contentHtml,
  callToActionLabel,
  callToActionUrl,
  closingHtml,
}: {
  preheader: string;
  badge: string;
  title: string;

  introductionHtml: string;
  contentHtml: string;

  callToActionLabel: string;
  callToActionUrl: string;

  closingHtml: string;
}) {
  const safePreheader =
    escapeHtml(preheader);

  const safeBadge =
    escapeHtml(badge);

  const safeTitle =
    escapeHtml(title);

  const safeCallToActionLabel =
    escapeHtml(
      callToActionLabel,
    );

  const safeCallToActionUrl =
    escapeHtml(
      callToActionUrl,
    );

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta
          charset="utf-8"
        />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />

        <meta
          name="color-scheme"
          content="dark"
        />

        <meta
          name="supported-color-schemes"
          content="dark"
        />

        <title>
          ${safeTitle}
        </title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #050605;
          color: #f5f7f2;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        "
      >
        <div
          style="
            display: none;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
          "
        >
          ${safePreheader}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          style="
            width: 100%;
            background: #050605;
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding:
                  38px
                  14px;
              "
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                style="
                  width: 100%;
                  max-width: 620px;
                  overflow: hidden;
                  border: 1px solid #252925;
                  border-radius: 28px;
                  background: #101310;
                  box-shadow:
                    0 26px 80px
                    rgba(
                      0,
                      0,
                      0,
                      .42
                    );
                "
              >
                <tr>
                  <td
                    style="
                      height: 6px;
                      background:
                        linear-gradient(
                          90deg,
                          #8db900,
                          #c9ff3f,
                          #8db900
                        );
                    "
                  ></td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:
                        34px
                        34px
                        16px;
                    "
                  >
                    <table
                      role="presentation"
                      width="100%"
                      cellspacing="0"
                      cellpadding="0"
                    >
                      <tr>
                        <td>
                          <div
                            style="
                              color: #c8ff35;
                              font-size: 13px;
                              font-weight: 900;
                              letter-spacing: .22em;
                              text-transform: uppercase;
                            "
                          >
                            GYM HOUSE
                          </div>
                        </td>

                        <td
                          align="right"
                        >
                          <span
                            style="
                              display: inline-block;
                              padding: 8px 12px;
                              border: 1px solid #34402d;
                              border-radius: 999px;
                              background: #171d14;
                              color: #c8ff35;
                              font-size: 10px;
                              font-weight: 800;
                              letter-spacing: .08em;
                              text-transform: uppercase;
                            "
                          >
                            ${safeBadge}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:
                        8px
                        34px
                        34px;
                    "
                  >
                    <h1
                      style="
                        margin:
                          14px
                          0
                          16px;
                        color: #f7f8f4;
                        font-size: 34px;
                        line-height: 1.1;
                        letter-spacing: -.045em;
                      "
                    >
                      ${safeTitle}
                    </h1>

                    <div
                      style="
                        color: #c0c6bf;
                        font-size: 15px;
                        line-height: 1.75;
                      "
                    >
                      ${introductionHtml}
                    </div>

                    ${contentHtml}

                    <table
                      role="presentation"
                      cellspacing="0"
                      cellpadding="0"
                      style="
                        margin:
                          28px
                          0;
                      "
                    >
                      <tr>
                        <td
                          style="
                            border-radius: 999px;
                            background: #c8ff35;
                          "
                        >
                          <a
                            href="${safeCallToActionUrl}"
                            target="_blank"
                            rel="noopener noreferrer"
                            style="
                              display: inline-block;
                              padding:
                                15px
                                23px;
                              color: #11150e;
                              font-size: 13px;
                              font-weight: 900;
                              line-height: 1;
                              text-decoration: none;
                            "
                          >
                            ${safeCallToActionLabel}
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div
                      style="
                        padding-top: 24px;
                        border-top: 1px solid #252925;
                        color: #8f978e;
                        font-size: 12px;
                        line-height: 1.7;
                      "
                    >
                      ${closingHtml}
                    </div>
                  </td>
                </tr>
              </table>

              <div
                style="
                  max-width: 570px;
                  padding: 18px 10px 0;
                  color: #6e756d;
                  font-size: 11px;
                  line-height: 1.6;
                  text-align: center;
                "
              >
                This is an automatic membership
                message from GYM House.
                <br />
                ይህ ከጂም ሃውስ የተላከ
                አውቶማቲክ የአባልነት መልዕክት ነው።
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function getLoginUrl() {
  return new URL(
    "/login",
    `${env.frontendUrl}/`,
  ).toString();
}

function errorToMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
      .slice(0, 1000);
  }

  return String(error)
    .slice(0, 1000);
}

async function claimNotification({
  userId,
  membershipId,
  notificationType,
  notificationKey,
  recipientEmail,
}: {
  userId: string;
  membershipId: string;

  notificationType:
    NotificationType;

  notificationKey: string;
  recipientEmail: string;
}) {
  const result =
    await pool.query<{
      id: string;
    }>(
      `
        INSERT INTO
          membership_email_notifications (
            user_id,
            membership_id,
            notification_type,
            notification_key,
            recipient_email,
            status,
            attempt_count
          )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          'sending',
          1
        )

        ON CONFLICT (
          notification_key
        )

        DO UPDATE SET
          recipient_email =
            EXCLUDED.recipient_email,

          status = 'sending',

          attempt_count =
            membership_email_notifications
              .attempt_count + 1,

          last_error = NULL,

          updated_at = NOW()

        WHERE
          (
            membership_email_notifications
              .status IN (
                'pending',
                'failed'
              )

            OR (
              membership_email_notifications
                .status = 'sending'

              AND
              membership_email_notifications
                .updated_at <
                NOW() - INTERVAL '15 minutes'
            )
          )

          AND
          membership_email_notifications
            .attempt_count < 3

        RETURNING id
      `,
      [
        userId,
        membershipId,
        notificationType,
        notificationKey,
        recipientEmail
          .trim()
          .toLowerCase(),
      ],
    );

  return result.rows[0]?.id ??
    null;
}

async function markNotificationSent(
  notificationId: string,
  messageId: string,
) {
  await pool.query(
    `
      UPDATE
        membership_email_notifications

      SET
        status = 'sent',

        provider_message_id =
          $2,

        last_error = NULL,

        sent_at = NOW(),

        updated_at = NOW()

      WHERE id = $1
    `,
    [
      notificationId,
      messageId,
    ],
  );
}

async function markNotificationFailed(
  notificationId: string,
  errorMessage: string,
) {
  await pool.query(
    `
      UPDATE
        membership_email_notifications

      SET
        status = 'failed',

        last_error = $2,

        updated_at = NOW()

      WHERE id = $1
    `,
    [
      notificationId,
      errorMessage,
    ],
  );
}

async function sendTrackedEmail({
  userId,
  membershipId,
  notificationType,
  notificationKey,
  recipientEmail,
  content,
}: {
  userId: string;
  membershipId: string;

  notificationType:
    NotificationType;

  notificationKey: string;
  recipientEmail: string;

  content: EmailContent;
}): Promise<EmailDeliveryResult> {
  let notificationId:
    string | null = null;

  try {
    notificationId =
      await claimNotification({
        userId,
        membershipId,
        notificationType,
        notificationKey,
        recipientEmail,
      });

    /*
     * This notification has already been
     * sent, is currently being processed,
     * or has reached its retry limit.
     */
    if (!notificationId) {
      return {
        status: "skipped",
      };
    }

    const result =
      await sendEmail({
        to:
          recipientEmail,

        subject:
          content.subject,

        text:
          content.text,

        html:
          content.html,
      });

    const messageId =
      String(
        result.messageId ??
          "",
      );

    /*
     * The provider has already accepted
     * the email. A later tracking failure
     * must not make us send it again.
     */
    try {
      await markNotificationSent(
        notificationId,
        messageId,
      );
    } catch (
      trackingError: unknown
    ) {
      console.error(
        "Email was sent, but its success could not be recorded:",
        {
          notificationId,
          notificationType,
          recipientEmail,
          trackingError,
        },
      );
    }

    return {
      status:
        "sent",

      messageId,
    };
  } catch (error: unknown) {
    const errorMessage =
      errorToMessage(
        error,
      );

    if (notificationId) {
      try {
        await markNotificationFailed(
          notificationId,
          errorMessage,
        );
      } catch (
        trackingError:
          unknown
      ) {
        console.error(
          "Unable to record the failed membership email:",
          {
            notificationId,
            trackingError,
          },
        );
      }
    }

    console.error(
      "Unable to send membership email:",
      {
        notificationType,
        recipientEmail,
        error:
          errorMessage,
      },
    );

    return {
      status:
        "failed",

      error:
        errorMessage,
    };
  }
}

function createWelcomeContent({
  name,
  username,
  initialPassword,
  startsAt,
  expiresAt,
  planMonths,
}: Omit<
  WelcomeEmailInput,
  | "userId"
  | "membershipId"
  | "email"
>): EmailContent {
  const firstName =
    getFirstName(name);

  const loginUrl =
    getLoginUrl();

  const planEnglish =
    formatPlan(
      planMonths,
      "en",
    );

  const planAmharic =
    formatPlan(
      planMonths,
      "am",
    );

  const startEnglish =
    formatDate(
      startsAt,
      "en-US",
    );

  const startAmharic =
    formatDate(
      startsAt,
      "am-ET",
    );

  const endEnglish =
    formatDate(
      expiresAt,
      "en-US",
    );

  const endAmharic =
    formatDate(
      expiresAt,
      "am-ET",
    );

  const details =
    createDetailsCard([
      {
        label:
          "Membership / አባልነት",

        value:
          `${planEnglish} · ${planAmharic}`,
      },
      {
        label:
          "Start date / መጀመሪያ ቀን",

        value:
          `${startEnglish} · ${startAmharic}`,
      },
      {
        label:
          "Expiration date / ማብቂያ ቀን",

        value:
          `${endEnglish} · ${endAmharic}`,
      },
      {
        label:
          "Username / የተጠቃሚ ስም",

        value:
          username,
      },
      {
        label:
          "Initial password / የመጀመሪያ የይለፍ ቃል",

        value:
          initialPassword,
      },
    ]);

  const introductionHtml = `
    <p
      style="
        margin: 0 0 16px;
      "
    >
      Hello
      <strong
        style="
          color: #ffffff;
        "
      >
        ${escapeHtml(firstName)}
      </strong>,
      welcome to GYM House. Your account
      and membership have been registered
      successfully.
    </p>

    <p
      lang="am"
      style="
        margin: 0;
        color: #aeb5ad;
      "
    >
      ሰላም
      <strong
        style="
          color: #ffffff;
        "
      >
        ${escapeHtml(firstName)}
      </strong>፣
      ወደ ጂም ሃውስ እንኳን ደህና መጡ።
      መለያዎና አባልነትዎ
      በተሳካ ሁኔታ ተመዝግቧል።
    </p>
  `;

  const contentHtml = `
    ${details}

    <div
      style="
        padding: 18px;
        border: 1px solid #34402d;
        border-radius: 18px;
        background: #151b12;
        color: #b7c0b5;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      <strong
        style="
          display: block;
          margin-bottom: 6px;
          color: #d9ff78;
        "
      >
        Track your membership anytime
      </strong>

      Sign in to view your active plan,
      remaining days, expiration date,
      profile, and membership status.

      <br /><br />

      ወደ መለያዎ በመግባት
      የአባልነት እቅድዎን፣
      የቀሩ ቀናትን፣
      የማብቂያ ቀንንና
      የአባልነት ሁኔታዎን
      ማየት ይችላሉ።
    </div>
  `;

  const closingHtml = `
    Keep this email private because it
    contains your initial login details.
    If you believe somebody else has seen
    your password, contact GYM House so
    the administrator can reset it.

    <br /><br />

    ይህ ኢሜይል የመግቢያ መረጃዎን
    ስለያዘ በጥንቃቄ ይጠብቁ።
    የይለፍ ቃልዎን ሌላ ሰው
    አይቶታል ብለው ካሰቡ
    ጂም ሃውስን ያነጋግሩ።
  `;

  return {
    subject:
      `Welcome to GYM House, ${firstName}`,

    text: [
      `Hello ${firstName},`,
      "",
      "Welcome to GYM House.",
      "Your account and membership have been registered successfully.",
      "",
      `Membership: ${planEnglish}`,
      `Start date: ${startEnglish}`,
      `Expiration date: ${endEnglish}`,
      "",
      `Username: ${username}`,
      `Initial password: ${initialPassword}`,
      "",
      `Login: ${loginUrl}`,
      "",
      "Sign in to track your plan, remaining days, expiration date, and membership status.",
      "",
      "Keep this email private because it contains your initial login details.",
      "",
      "ወደ ጂም ሃውስ እንኳን ደህና መጡ።",
      `አባልነት: ${planAmharic}`,
      `መጀመሪያ ቀን: ${startAmharic}`,
      `ማብቂያ ቀን: ${endAmharic}`,
      `የተጠቃሚ ስም: ${username}`,
      `የመጀመሪያ የይለፍ ቃል: ${initialPassword}`,
    ].join("\n"),

    html:
      createEmailLayout({
        preheader:
          "Your GYM House account and membership are ready.",

        badge:
          "Membership ready",

        title:
          `Welcome, ${firstName}`,

        introductionHtml,
        contentHtml,

        callToActionLabel:
          "Open my member account / መለያዬን ክፈት",

        callToActionUrl:
          loginUrl,

        closingHtml,
      }),
  };
}

function createRenewalContent({
  name,
  startsAt,
  expiresAt,
  planMonths,
}: Omit<
  BaseMembershipEmailInput,
  | "userId"
  | "membershipId"
  | "email"
>): EmailContent {
  const firstName =
    getFirstName(name);

  const loginUrl =
    getLoginUrl();

  const planEnglish =
    formatPlan(
      planMonths,
      "en",
    );

  const planAmharic =
    formatPlan(
      planMonths,
      "am",
    );

  const startEnglish =
    formatDate(
      startsAt,
      "en-US",
    );

  const startAmharic =
    formatDate(
      startsAt,
      "am-ET",
    );

  const endEnglish =
    formatDate(
      expiresAt,
      "en-US",
    );

  const endAmharic =
    formatDate(
      expiresAt,
      "am-ET",
    );

  const contentHtml = `
    ${createDetailsCard([
      {
        label:
          "Membership / አባልነት",

        value:
          `${planEnglish} · ${planAmharic}`,
      },
      {
        label:
          "Active from / የሚጀምርበት",

        value:
          `${startEnglish} · ${startAmharic}`,
      },
      {
        label:
          "Active until / የሚያበቃበት",

        value:
          `${endEnglish} · ${endAmharic}`,
      },
    ])}

    <div
      style="
        padding: 18px;
        border-radius: 18px;
        background: #151b12;
        color: #b7c0b5;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      Your account page has already been
      updated with the new dates. You can
      sign in anytime to follow your
      remaining membership days.

      <br /><br />

      የመለያዎ ገጽ በአዲሱ
      የአባልነት ቀናት ተሻሽሏል።
      ወደ መለያዎ በመግባት
      የቀሩ ቀናትን ማየት ይችላሉ።
    </div>
  `;

  return {
    subject:
      "Your GYM House membership is active",

    text: [
      `Hello ${firstName},`,
      "",
      "Your GYM House membership has been activated or renewed.",
      "",
      `Membership: ${planEnglish}`,
      `Start date: ${startEnglish}`,
      `Expiration date: ${endEnglish}`,
      "",
      `View your account: ${loginUrl}`,
      "",
      "የጂም ሃውስ አባልነትዎ ነቅቷል ወይም ታድሷል።",
      `አባልነት: ${planAmharic}`,
      `መጀመሪያ ቀን: ${startAmharic}`,
      `ማብቂያ ቀን: ${endAmharic}`,
    ].join("\n"),

    html:
      createEmailLayout({
        preheader:
          "Your GYM House membership dates have been updated.",

        badge:
          "Membership active",

        title:
          "You are ready to continue",

        introductionHtml: `
          <p
            style="
              margin: 0 0 16px;
            "
          >
            Hello
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>,
            your GYM House membership has
            been activated or renewed.
          </p>

          <p
            lang="am"
            style="
              margin: 0;
              color: #aeb5ad;
            "
          >
            ሰላም
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>፣
            የጂም ሃውስ አባልነትዎ
            ነቅቷል ወይም ታድሷል።
          </p>
        `,

        contentHtml,

        callToActionLabel:
          "View membership / አባልነትን ይመልከቱ",

        callToActionUrl:
          loginUrl,

        closingHtml: `
          Thank you for continuing your
          fitness journey with GYM House.

          <br /><br />

          የአካል ብቃት ጉዞዎን
          ከጂም ሃውስ ጋር
          ስለቀጠሉ እናመሰግናለን።
        `,
      }),
  };
}

function createExpiryWarningContent({
  name,
  expiresAt,
  startsAt,
  planMonths,
}: Omit<
  BaseMembershipEmailInput,
  | "userId"
  | "membershipId"
  | "email"
>): EmailContent {
  const firstName =
    getFirstName(name);

  const loginUrl =
    getLoginUrl();

  const endEnglish =
    formatDate(
      expiresAt,
      "en-US",
    );

  const endAmharic =
    formatDate(
      expiresAt,
      "am-ET",
    );

  const planEnglish =
    formatPlan(
      planMonths,
      "en",
    );

  const planAmharic =
    formatPlan(
      planMonths,
      "am",
    );

  const startEnglish =
    formatDate(
      startsAt,
      "en-US",
    );

  const startAmharic =
    formatDate(
      startsAt,
      "am-ET",
    );

  const contentHtml = `
    ${createDetailsCard([
      {
        label:
          "Time remaining / የቀረው ጊዜ",

        value:
          "3 days / 3 ቀናት",
      },
      {
        label:
          "Membership / አባልነት",

        value:
          `${planEnglish} · ${planAmharic}`,
      },
      {
        label:
          "Started / የጀመረበት",

        value:
          `${startEnglish} · ${startAmharic}`,
      },
      {
        label:
          "Ends on / የሚያበቃበት",

        value:
          `${endEnglish} · ${endAmharic}`,
      },
    ])}

    <div
      style="
        padding: 18px;
        border: 1px solid #534b25;
        border-radius: 18px;
        background: #211e0f;
        color: #d5ceb0;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      Nothing has been cancelled yet.
      Your membership remains active for
      the next three days. Contact GYM
      House before the expiration date if
      you want uninterrupted access.

      <br /><br />

      አባልነትዎ እስካሁን ንቁ ነው።
      ያለማቋረጥ መቀጠል ከፈለጉ
      ከማብቂያው ቀን በፊት
      ጂም ሃውስን ያነጋግሩ።
    </div>
  `;

  return {
    subject:
      "Your GYM House membership ends in 3 days",

    text: [
      `Hello ${firstName},`,
      "",
      "Your GYM House membership will end in 3 days.",
      `Expiration date: ${endEnglish}`,
      `Membership: ${planEnglish}`,
      "",
      "Your membership is still active.",
      "Contact GYM House before the expiration date if you want uninterrupted access.",
      "",
      `View your account: ${loginUrl}`,
      "",
      "የጂም ሃውስ አባልነትዎ በ3 ቀናት ውስጥ ያበቃል።",
      `ማብቂያ ቀን: ${endAmharic}`,
    ].join("\n"),

    html:
      createEmailLayout({
        preheader:
          "Three days remain on your GYM House membership.",

        badge:
          "3 days remaining",

        title:
          "Your plan is almost complete",

        introductionHtml: `
          <p
            style="
              margin: 0 0 16px;
            "
          >
            Hello
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>,
            this is a friendly reminder
            that your current GYM House
            membership will end in three
            days.
          </p>

          <p
            lang="am"
            style="
              margin: 0;
              color: #aeb5ad;
            "
          >
            ሰላም
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>፣
            የአሁኑ የጂም ሃውስ
            አባልነትዎ በ3 ቀናት
            ውስጥ እንደሚያበቃ
            ለማስታወስ ነው።
          </p>
        `,

        contentHtml,

        callToActionLabel:
          "Check remaining time / የቀረውን ጊዜ ይመልከቱ",

        callToActionUrl:
          loginUrl,

        closingHtml: `
          Need help with the dates shown
          in your account? Reply to this
          email or contact GYM House.

          <br /><br />

          በመለያዎ ላይ ስለሚታየው
          ቀን ጥያቄ ካለዎት
          ጂም ሃውስን ያነጋግሩ።
        `,
      }),
  };
}

function createExpiredContent({
  name,
  expiresAt,
  startsAt,
  planMonths,
}: Omit<
  BaseMembershipEmailInput,
  | "userId"
  | "membershipId"
  | "email"
>): EmailContent {
  const firstName =
    getFirstName(name);

  const loginUrl =
    getLoginUrl();

  const endEnglish =
    formatDate(
      expiresAt,
      "en-US",
    );

  const endAmharic =
    formatDate(
      expiresAt,
      "am-ET",
    );

  const planEnglish =
    formatPlan(
      planMonths,
      "en",
    );

  const planAmharic =
    formatPlan(
      planMonths,
      "am",
    );

  const startEnglish =
    formatDate(
      startsAt,
      "en-US",
    );

  const startAmharic =
    formatDate(
      startsAt,
      "am-ET",
    );

  const contentHtml = `
    ${createDetailsCard([
      {
        label:
          "Status / ሁኔታ",

        value:
          "Expired / ጊዜው አልቋል",
      },
      {
        label:
          "Membership / አባልነት",

        value:
          `${planEnglish} · ${planAmharic}`,
      },
      {
        label:
          "Started / የጀመረበት",

        value:
          `${startEnglish} · ${startAmharic}`,
      },
      {
        label:
          "Ended on / ያበቃበት",

        value:
          `${endEnglish} · ${endAmharic}`,
      },
    ])}

    <div
      style="
        padding: 18px;
        border: 1px solid #4a2b2b;
        border-radius: 18px;
        background: #211212;
        color: #d6b8b8;
        font-size: 13px;
        line-height: 1.7;
      "
    >
      Your login account still exists,
      so you can continue viewing your
      profile and previous membership
      information. Contact GYM House when
      you are ready to activate a new plan.

      <br /><br />

      መለያዎ አልተሰረዘም።
      የመገለጫዎንና የቀድሞ
      አባልነት መረጃዎን
      ማየት ይችላሉ።
      አዲስ እቅድ ለማስጀመር
      ጂም ሃውስን ያነጋግሩ።
    </div>
  `;

  return {
    subject:
      "Your GYM House membership has ended",

    text: [
      `Hello ${firstName},`,
      "",
      "Your GYM House membership period has ended.",
      `Expiration date: ${endEnglish}`,
      "",
      "Your login account still exists.",
      "You can sign in to review your profile and membership information.",
      "Contact GYM House when you are ready to activate a new plan.",
      "",
      `View your account: ${loginUrl}`,
      "",
      "የጂም ሃውስ አባልነትዎ ጊዜ አልቋል።",
      `ያበቃበት ቀን: ${endAmharic}`,
      "አዲስ እቅድ ለማስጀመር ጂም ሃውስን ያነጋግሩ።",
    ].join("\n"),

    html:
      createEmailLayout({
        preheader:
          "Your current GYM House membership period has ended.",

        badge:
          "Membership ended",

        title:
          "Your membership period is complete",

        introductionHtml: `
          <p
            style="
              margin: 0 0 16px;
            "
          >
            Hello
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>,
            your current GYM House
            membership period has ended.
          </p>

          <p
            lang="am"
            style="
              margin: 0;
              color: #aeb5ad;
            "
          >
            ሰላም
            <strong
              style="
                color: #ffffff;
              "
            >
              ${escapeHtml(firstName)}
            </strong>፣
            የአሁኑ የጂም ሃውስ
            አባልነትዎ ጊዜ አልቋል።
          </p>
        `,

        contentHtml,

        callToActionLabel:
          "View my account / መለያዬን ይመልከቱ",

        callToActionUrl:
          loginUrl,

        closingHtml: `
          We would be happy to welcome you
          back whenever you are ready to
          continue.

          <br /><br />

          ለመቀጠል ዝግጁ ሲሆኑ
          እንደገና ልናገኝዎት
          ደስ ይለናል።
        `,
      }),
  };
}

async function safelyDeliverMembershipEmail({
  notificationType,
  recipientEmail,
  deliver,
}: {
  notificationType:
    NotificationType;

  recipientEmail: string;

  deliver:
    () =>
      Promise<EmailDeliveryResult>;
}): Promise<EmailDeliveryResult> {
  try {
    /*
     * Template preparation happens inside
     * the callback, so malformed dates or
     * unexpected template errors are also
     * caught here.
     */
    return await deliver();
  } catch (error: unknown) {
    const errorMessage =
      errorToMessage(
        error,
      );

    console.error(
      "Unable to prepare or deliver membership email:",
      {
        notificationType,
        recipientEmail,
        error:
          errorMessage,
      },
    );

    return {
      status:
        "failed",

      error:
        errorMessage,
    };
  }
}

export async function sendWelcomeMembershipEmail(
  input: WelcomeEmailInput,
): Promise<EmailDeliveryResult> {
  return safelyDeliverMembershipEmail({
    notificationType:
      "welcome",

    recipientEmail:
      input.email,

    deliver: () =>
      sendTrackedEmail({
        userId:
          input.userId,

        membershipId:
          input.membershipId,

        notificationType:
          "welcome",

        notificationKey:
          `welcome:${input.membershipId}`,

        recipientEmail:
          input.email,

        content:
          createWelcomeContent(
            input,
          ),
      }),
  });
}

export async function sendMembershipRenewedEmail(
  input:
    BaseMembershipEmailInput,
): Promise<EmailDeliveryResult> {
  return safelyDeliverMembershipEmail({
    notificationType:
      "membership_renewed",

    recipientEmail:
      input.email,

    deliver: () =>
      sendTrackedEmail({
        userId:
          input.userId,

        membershipId:
          input.membershipId,

        notificationType:
          "membership_renewed",

        notificationKey:
          `renewal:${input.membershipId}:${getMembershipDateKey(
            input.expiresAt,
          )}`,

        recipientEmail:
          input.email,

        content:
          createRenewalContent(
            input,
          ),
      }),
  });
}

export async function sendMembershipExpiryWarningEmail(
  input:
    BaseMembershipEmailInput,
): Promise<EmailDeliveryResult> {
  return safelyDeliverMembershipEmail({
    notificationType:
      "expiry_warning_3_days",

    recipientEmail:
      input.email,

    deliver: () =>
      sendTrackedEmail({
        userId:
          input.userId,

        membershipId:
          input.membershipId,

        notificationType:
          "expiry_warning_3_days",

        notificationKey:
          `warning-3:${input.membershipId}:${getMembershipDateKey(
            input.expiresAt,
          )}`,

        recipientEmail:
          input.email,

        content:
          createExpiryWarningContent(
            input,
          ),
      }),
  });
}

export async function sendMembershipExpiredEmail(
  input:
    BaseMembershipEmailInput,
): Promise<EmailDeliveryResult> {
  return safelyDeliverMembershipEmail({
    notificationType:
      "membership_expired",

    recipientEmail:
      input.email,

    deliver: () =>
      sendTrackedEmail({
        userId:
          input.userId,

        membershipId:
          input.membershipId,

        notificationType:
          "membership_expired",

        notificationKey:
          `expired:${input.membershipId}:${getMembershipDateKey(
            input.expiresAt,
          )}`,

        recipientEmail:
          input.email,

        content:
          createExpiredContent(
            input,
          ),
      }),
  });
}