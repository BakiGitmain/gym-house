import { env } from "../config/env.js";

import {
  sendEmail,
  verifyEmailConnection,
} from "../services/email.service.js";

async function testEmail() {
  const recipient =
    process.argv[2]?.trim() ||
    env.EMAIL_USER;

  console.log(
    "Checking Gmail connection...",
  );

  await verifyEmailConnection();

  console.log(
    "Gmail connection successful.",
  );

  const result = await sendEmail({
    to: recipient,

    subject:
      "GYM House email system connected",

    text: [
      "Welcome to GYM House!",
      "",
      "The GYM House email notification system is working successfully.",
      "",
      "This email was sent from the Express backend.",
    ].join("\n"),

    html: `
      <!doctype html>
      <html lang="en">
        <body
          style="
            margin: 0;
            padding: 40px 16px;
            background: #080908;
            font-family: Arial, sans-serif;
            color: #ffffff;
          "
        >
          <div
            style="
              max-width: 560px;
              margin: 0 auto;
              padding: 32px;
              border: 1px solid #262926;
              border-radius: 20px;
              background: #101210;
            "
          >
            <p
              style="
                margin: 0 0 12px;
                color: #c8ff32;
                font-size: 13px;
                font-weight: 700;
                letter-spacing: 2px;
              "
            >
              GYM HOUSE
            </p>

            <h1
              style="
                margin: 0 0 16px;
                font-size: 28px;
              "
            >
              Email system connected
            </h1>

            <p
              style="
                margin: 0;
                color: #c5c9c5;
                font-size: 16px;
                line-height: 1.7;
              "
            >
              The GYM House email notification
              system is working successfully.
              This message was sent from the
              Express backend.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  console.log(
    `Email sent successfully to ${recipient}.`,
  );

  console.log(
    `Message ID: ${result.messageId}`,
  );
}

testEmail().catch((error: unknown) => {
  console.error(
    "Email test failed:",
    error,
  );

  process.exit(1);
});