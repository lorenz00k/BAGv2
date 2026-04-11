import { Resend } from "resend";

import emailTexts from "@i18n/de/emails.json" with { type: "json" };

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function emailTemplate(heading: string, body: string, ctaUrl: string, ctaText: string, footer: string, ignore: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="font-size: 20px; margin-bottom: 16px;">${heading}</h2>
      <p style="font-size: 14px; color: #333; margin-bottom: 24px;">${body}</p>
      <a href="${ctaUrl}" style="display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none; border-radius: 6px; font-size: 14px;">${ctaText}</a>
      <p style="font-size: 12px; color: #888; margin-top: 24px;">${footer}</p>
      <p style="font-size: 12px; color: #888;">${ignore}</p>
    </div>
  `;
}

export async function sendVerificationEmail(email: string, token: string) {
  const t = emailTexts.verification;
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: t.subject,
    html: emailTemplate(t.heading, t.body, verifyUrl, t.cta, t.expiry, t.ignore),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const t = emailTexts.passwordReset;
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: t.subject,
    html: emailTemplate(t.heading, t.body, resetUrl, t.cta, t.expiry, t.ignore),
  });
}