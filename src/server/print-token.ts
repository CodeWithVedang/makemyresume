import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Short-lived signed token that lets the headless PDF renderer load one
 * resume's print view without a user session. Bound to the resume id and
 * expires after `ttlSeconds`.
 */
function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`print:${payload}`).digest("base64url");
}

export function createPrintToken(resumeId: string, ttlSeconds = 60): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${resumeId}.${exp}`;
  return `${exp}.${sign(payload)}`;
}

export function verifyPrintToken(resumeId: string, token: string): boolean {
  const [expRaw, signature] = token.split(".");
  const exp = Number(expRaw);
  if (!signature || !Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = Buffer.from(sign(`${resumeId}.${exp}`));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
