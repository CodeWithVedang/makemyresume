"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { signOut } from "@/auth";
import { fail, ok, type ActionResult } from "@/lib/result";
import { prisma } from "@/server/db";
import { rateLimit } from "@/server/rate-limit";
import { getCurrentUser } from "@/server/session";

const UNAUTHORIZED = "Your session has expired. Please sign in again.";

const profileSchema = z.object({ name: z.string().trim().min(1, "Full name is required.").max(120) });

export async function updateProfileAction(input: unknown): Promise<ActionResult<{ name: string }>> {
  const user = await getCurrentUser();
  if (!user) return fail(UNAUTHORIZED, "unauthorized");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid name.", "invalid");
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath("/", "layout");
  return ok({ name: parsed.data.name });
}

const passwordSchema = z
  .object({
    currentPassword: z.string().max(128),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(128)
      .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Include at least one letter and one number."),
  });

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail(UNAUTHORIZED, "unauthorized");
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid password.", "invalid");
  if (!rateLimit(`change-password:${user.id}`, 5, 15 * 60_000).ok) {
    return fail("Too many attempts. Please wait a few minutes.", "rate_limited");
  }
  const record = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
  if (record?.passwordHash && !(await bcrypt.compare(parsed.data.currentPassword, record.passwordHash))) {
    return fail("Your current password is incorrect.", "invalid");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 12) },
  });
  return ok(undefined);
}

export async function deleteAccountAction(confirmEmail: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail(UNAUTHORIZED, "unauthorized");
  if (typeof confirmEmail !== "string" || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return fail("Type your email address exactly to confirm.", "invalid");
  }
  // Cascades remove resumes, revisions, accounts and tokens.
  await prisma.user.delete({ where: { id: user.id } });
  await signOut({ redirectTo: "/" });
  return ok(undefined);
}
