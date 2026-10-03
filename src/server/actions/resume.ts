"use server";

import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { templateAllowed } from "@/lib/billing/plans";
import { emptyResumeContent } from "@/lib/resume/defaults";
import { resumeContentSchema, templateIds, type Visibility } from "@/lib/resume/schema";
import { fail, ok, type ActionResult } from "@/lib/result";
import { track } from "@/server/analytics";
import { prisma } from "@/server/db";
import { getEntitlements } from "@/server/entitlements";
import {
  deleteOwnedResume,
  duplicateOwnedResume,
  insertResume,
  renameOwnedResume,
  replaceResumeContent,
  setOwnedVisibility,
  StaleRevisionError,
} from "@/server/resume-repository";
import { getCurrentUser } from "@/server/session";

/**
 * Resume mutations. Each action authenticates, validates its input with Zod
 * and scopes the write to the caller's own resumes.
 */

const idSchema = z.string().min(1).max(40);
const titleSchema = z.string().trim().min(1, "Resume name is required.").max(100);
const slugId = customAlphabet("abcdefghijkmnpqrstuvwxyz23456789", 10);

async function userIdOrNull(): Promise<string | null> {
  return (await getCurrentUser())?.id ?? null;
}

const UNAUTHORIZED = "Your session has expired. Please sign in again.";

async function checkResumeLimit(userId: string): Promise<string | null> {
  const ent = await getEntitlements(userId);
  if (!Number.isFinite(ent.maxResumes)) return null;
  const count = await prisma.resume.count({ where: { userId, isDemo: false } });
  return count >= ent.maxResumes
    ? ent.plan === "FREE"
      ? "The Free plan includes 1 resume. Upgrade to create more, or keep editing your existing resume."
      : `Your plan includes ${ent.maxResumes} resumes. Delete one or upgrade to create more.`
    : null;
}

const createInput = z.object({
  title: titleSchema.optional(),
  templateId: z.enum(templateIds).optional(),
  content: resumeContentSchema.optional(),
  source: z.enum(["scratch", "import", "onboarding"]).default("scratch"),
});

export async function createResumeAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsed = createInput.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid resume data.", "invalid");

  const limit = await checkResumeLimit(userId);
  if (limit) return fail(limit, "limit");

  const { title, templateId, content, source } = parsed.data;
  const data = content ?? emptyResumeContent(title, templateId);
  if (!templateAllowed(await getEntitlements(userId), data.templateId)) {
    return fail("This template is part of the paid plans. Choose Classic, Modern or Minimal, or upgrade.", "limit");
  }
  try {
    const id = await insertResume(userId, data);
    track(source === "import" ? "resume_imported" : "resume_created", userId, {
      templateId: data.templateId,
      source,
    });
    revalidatePath("/dashboard");
    return ok({ id });
  } catch (error) {
    console.error("[createResume]", error instanceof Error ? error.message : error);
    return fail("We couldn't create your resume. Please try again.", "server");
  }
}

export async function saveResumeAction(
  id: unknown,
  content: unknown,
  baseRevision: unknown,
): Promise<ActionResult<{ revision: number; updatedAt: string }>> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsedId = idSchema.safeParse(id);
  const parsedRevision = z.number().int().min(0).safeParse(baseRevision);
  const parsed = resumeContentSchema.safeParse(content);
  if (!parsedId.success || !parsedRevision.success) return fail("Invalid request.", "invalid");
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Some fields need attention.", "invalid");
  }

  const ent = await getEntitlements(userId);
  if (!templateAllowed(ent, parsed.data.templateId)) {
    // Resumes already using a premium template (e.g. after a pass expires) stay editable.
    const existing = await prisma.resume.findFirst({
      where: { id: parsedId.data, userId },
      select: { templateId: true },
    });
    if (existing?.templateId !== parsed.data.templateId) {
      return fail("This template is part of the paid plans. Upgrade to use it.", "limit");
    }
  }

  try {
    const result = await replaceResumeContent(userId, parsedId.data, parsed.data, parsedRevision.data);
    if (!result) return fail("Resume not found.", "not_found");
    return ok(result);
  } catch (error) {
    if (error instanceof StaleRevisionError) {
      return fail("This resume was updated in another tab or device. Reload to get the latest version.", "stale");
    }
    console.error("[saveResume]", error instanceof Error ? error.message : error);
    return fail("Save failed. Your changes are kept on this device; we'll retry.", "server");
  }
}

/** Template switches are logged separately for analytics; data is untouched. */
export async function recordTemplateSelectedAction(templateId: unknown): Promise<void> {
  const userId = await userIdOrNull();
  const parsed = z.enum(templateIds).safeParse(templateId);
  if (userId && parsed.success) track("template_selected", userId, { templateId: parsed.data });
}

const duplicateInput = z.object({
  id: idSchema,
  title: titleSchema.optional(),
  templateId: z.enum(templateIds).optional(),
});

export async function duplicateResumeAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsed = duplicateInput.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid request.", "invalid");

  const limit = await checkResumeLimit(userId);
  if (limit) return fail(limit, "limit");

  const { id, ...overrides } = parsed.data;
  if (overrides.templateId && !templateAllowed(await getEntitlements(userId), overrides.templateId)) {
    return fail("This template is part of the paid plans. Choose Classic, Modern or Minimal, or upgrade.", "limit");
  }
  const newId = await duplicateOwnedResume(userId, id, overrides);
  if (!newId) return fail("Resume not found.", "not_found");
  track("resume_duplicated", userId, { source: "duplicate" });
  revalidatePath("/dashboard");
  return ok({ id: newId });
}

export async function deleteResumeAction(id: unknown): Promise<ActionResult> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return fail("Invalid request.", "invalid");
  const deleted = await deleteOwnedResume(userId, parsed.data);
  if (!deleted) return fail("Resume not found.", "not_found");
  track("resume_deleted", userId);
  revalidatePath("/dashboard");
  return ok(undefined);
}

export async function renameResumeAction(id: unknown, title: unknown): Promise<ActionResult<{ title: string }>> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsedId = idSchema.safeParse(id);
  const parsedTitle = titleSchema.safeParse(title);
  if (!parsedId.success) return fail("Invalid request.", "invalid");
  if (!parsedTitle.success) return fail(parsedTitle.error.issues[0]?.message ?? "Invalid name.", "invalid");
  const renamed = await renameOwnedResume(userId, parsedId.data, parsedTitle.data);
  if (!renamed) return fail("Resume not found.", "not_found");
  revalidatePath("/dashboard");
  return ok({ title: parsedTitle.data });
}

const visibilitySchema = z.enum(["PRIVATE", "UNLISTED", "PUBLIC"]);

export async function setVisibilityAction(
  id: unknown,
  visibility: unknown,
): Promise<ActionResult<{ visibility: Visibility; publicSlug: string | null }>> {
  const userId = await userIdOrNull();
  if (!userId) return fail(UNAUTHORIZED, "unauthorized");
  const parsedId = idSchema.safeParse(id);
  const parsedVisibility = visibilitySchema.safeParse(visibility);
  if (!parsedId.success || !parsedVisibility.success) return fail("Invalid request.", "invalid");

  // Turning a private resume into a shared one counts as creating a link.
  if (parsedVisibility.data !== "PRIVATE") {
    const current = await prisma.resume.findFirst({
      where: { id: parsedId.data, userId },
      select: { visibility: true },
    });
    if (!current) return fail("Resume not found.", "not_found");
    if (current.visibility === "PRIVATE") {
      const ent = await getEntitlements(userId);
      // Conditional increment so concurrent requests can't exceed the limit.
      const claimed = await prisma.user.updateMany({
        where: Number.isFinite(ent.maxShareLinks)
          ? { id: userId, shareLinksCreated: { lt: ent.maxShareLinks } }
          : { id: userId },
        data: { shareLinksCreated: { increment: 1 } },
      });
      if (claimed.count === 0) {
        return fail(
          `You've used all ${ent.maxShareLinks} shareable links on your plan. Upgrade to share more resumes.`,
          "limit",
        );
      }
    }
  }

  const result = await setOwnedVisibility(userId, parsedId.data, parsedVisibility.data, slugId);
  if (!result) return fail("Resume not found.", "not_found");
  track(result.visibility === "PRIVATE" ? "public_resume_disabled" : "public_resume_created", userId, {
    visibility: result.visibility,
  });
  revalidatePath("/dashboard");
  if (result.publicSlug) revalidatePath(`/r/${result.publicSlug}`);
  return ok(result);
}

export async function completeOnboardingAction(): Promise<void> {
  const userId = await userIdOrNull();
  if (!userId) return;
  await prisma.user.update({ where: { id: userId }, data: { onboardedAt: new Date() } });
}
