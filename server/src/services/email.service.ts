import nodemailer from "nodemailer";

import { env } from "../config/env.js";

const emailTransporter =
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    /*
     * Reuse SMTP connections when the
     * server instance remains warm.
     */
    pool: true,
    maxConnections: 2,
    maxMessages: 50,

    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_APP_PASSWORD,
    },
  });

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function verifyEmailConnection() {
  await emailTransporter.verify();
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions) {
  return emailTransporter.sendMail({
    from: {
      name: env.EMAIL_FROM_NAME,
      address: env.EMAIL_USER,
    },

    to,

    ...(env.EMAIL_REPLY_TO
      ? {
          replyTo:
            env.EMAIL_REPLY_TO,
        }
      : {}),

    subject,
    text,
    html,
  });
}