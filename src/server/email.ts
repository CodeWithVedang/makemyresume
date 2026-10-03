import "server-only";

import { APP_NAME } from "@/lib/config";

/**
 * Transactional email via the Resend HTTP API when RESEND_API_KEY is set.
 * In development without a key, the message is printed to the server console
 * so flows like password reset remain testable locally.
 */
export async function sendEmail(message: { to: string; subject: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (key && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: message.to, subject: message.subject, text: message.text }),
    });
    if (!res.ok) console.error("[email] send failed", res.status);
    return res.ok;
  }
  if (process.env.NODE_ENV !== "production") {
    console.info(`[email:dev] To: ${message.to}\nSubject: ${message.subject}\n\n${message.text}`);
    return true;
  }
  console.error(`[email] ${APP_NAME}: RESEND_API_KEY / EMAIL_FROM not configured`);
  return false;
}
