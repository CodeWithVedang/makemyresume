"use server";

import { createHash, randomBytes } from "node:crypto";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { headers } from "next/headers";

import { signIn, signOut } from "@/auth";
import { APP_NAME, appUrl } from "@/lib/config";
import { fail, ok, safeRedirectPath, type ActionResult } from "@/lib/result";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/lib/validation/auth";
import { track } from "@/server/analytics";
import { prisma } from "@/server/db";
import { sendEmail } from "@/server/email";
import { clientIp, rateLimit } from "@/server/rate-limit";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function ip(): Promise<string> {
  return clientIp(await headers());
}

/** Credentials sign-in. Redirect errors from Auth.js are rethrown so navigation happens. */
export async function loginAction(input: unknown, callbackUrl?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("Enter a valid email and password.", "invalid");
  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: safeRedirectPath(callbackUrl),
    });
    return ok(undefined);
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin" && "code" in error && error.code === "rate_limited") {
        return fail("Too many sign-in attempts. Please wait a few minutes and try again.", "rate_limited");
      }
      return fail("Incorrect email or password.", "unauthorized");
    }
    throw error;
  }
}

export async function signupAction(input: unknown, next?: string): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your details.", "invalid");
  if (!rateLimit(`signup:${await ip()}`, 5, 60 * 60_000).ok) {
    return fail("Too many accounts created from this network. Try again later.", "rate_limited");
  }

  const { name, email, password } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return fail("An account with this email already exists. Try signing in.", "invalid");

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 12) },
    select: { id: true },
  });
  track("user_signed_up", user.id);

  try {
    await signIn("credentials", { email, password, redirectTo: safeRedirectPath(next, "/onboarding") });
  } catch (error) {
    if (error instanceof AuthError) return fail("Account created. Please sign in.", "server");
    throw error;
  }
  return ok(undefined);
}

export async function googleSignInAction(callbackUrl?: string): Promise<void> {
  await signIn("google", { redirectTo: safeRedirectPath(callbackUrl) });
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

/** Always reports success so the form cannot be used to discover accounts. */
export async function requestPasswordResetAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Please enter a valid email address.", "invalid");
  if (!rateLimit(`reset:${await ip()}`, 5, 15 * 60_000).ok) {
    return fail("Too many requests. Please wait a few minutes.", "rate_limited");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true, email: true, passwordHash: true },
  });
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_TTL_MS) },
    });
    const link = `${appUrl()}/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: `Reset your ${APP_NAME} password`,
      text: `We received a request to reset your password.\n\nReset it here (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    });
  }
  return ok(undefined);
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Check your new password.", "invalid");
  if (!rateLimit(`reset-confirm:${await ip()}`, 10, 15 * 60_000).ok) {
    return fail("Too many attempts. Please wait a few minutes.", "rate_limited");
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(parsed.data.token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return fail("This reset link is invalid or has expired. Request a new one.", "invalid");
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
  return ok(undefined);
}
