import "server-only";

import { Prisma, type PrismaClient } from "@prisma/client";

import { defaultSettings, emptyResumeContent } from "@/lib/resume/defaults";
import { createId } from "@/lib/resume/ids";
import {
  builtInSectionKeys,
  resumeContentSchema,
  settingsSchema,
  templateIds,
  type Resume,
  type ResumeContent,
  type SectionKey,
  type TemplateId,
} from "@/lib/resume/schema";
import { normalizeSectionOrder } from "@/lib/resume/sections";
import { prisma } from "@/server/db";
import { rootData, writeChildren } from "@/server/resume-writer";

/**
 * Data access for resumes. Every read and write is scoped by `userId`, so a
 * user can never load or change another user's resume by guessing an id.
 */

type Tx = Prisma.TransactionClient | PrismaClient;

const ordered = { orderBy: { position: "asc" as const } };

export const resumeInclude = {
  personalInfo: true,
  experience: ordered,
  education: ordered,
  skills: ordered,
  projects: ordered,
  certifications: ordered,
  achievements: ordered,
  languages: ordered,
  volunteerExperience: ordered,
  customSections: { include: { entries: ordered }, ...ordered },
} satisfies Prisma.ResumeInclude;

type ResumeRow = Prisma.ResumeGetPayload<{ include: typeof resumeInclude }>;

const MAX_REVISIONS = 20;

function parseKeys(value: Prisma.JsonValue): SectionKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (v): v is SectionKey =>
      typeof v === "string" &&
      ((builtInSectionKeys as readonly string[]).includes(v) || /^custom:[A-Za-z0-9_-]{1,40}$/.test(v)),
  );
}

function parseLinks(value: Prisma.JsonValue): ResumeContent["personalInfo"]["otherLinks"] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      const { id, label, url } = item as Record<string, unknown>;
      if (typeof url === "string") {
        return [{ id: typeof id === "string" ? id : createId(), label: typeof label === "string" ? label : "", url }];
      }
    }
    return [];
  });
}

/** DB row -> domain object. Tolerates legacy/invalid JSON by falling back to defaults. */
export function toResume(row: ResumeRow): Resume {
  const settings = settingsSchema.safeParse(row.settings);
  const templateId = (templateIds as readonly string[]).includes(row.templateId)
    ? (row.templateId as TemplateId)
    : "classic";
  const p = row.personalInfo;
  const customSections = row.customSections.map((s) => ({
    id: s.clientKey,
    title: s.title,
    entries: s.entries.map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.subtitle,
      date: e.date,
      description: e.description,
    })),
  }));

  return {
    id: row.id,
    isDemo: row.isDemo,
    visibility: row.visibility,
    publicSlug: row.publicSlug,
    revision: row.revision,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    title: row.title,
    templateId,
    personalInfo: {
      fullName: p?.fullName ?? "",
      professionalTitle: p?.professionalTitle ?? "",
      email: p?.email ?? "",
      phone: p?.phone ?? "",
      location: p?.location ?? "",
      website: p?.website ?? "",
      linkedin: p?.linkedin ?? "",
      github: p?.github ?? "",
      portfolio: p?.portfolio ?? "",
      otherLinks: p ? parseLinks(p.otherLinks) : [],
      photo: p?.photo ?? null,
    },
    summary: row.summary,
    experience: row.experience.map(({ id, jobTitle, company, location, employmentType, startDate, endDate, current, description }) => ({
      id, jobTitle, company, location, employmentType, startDate, endDate, current, description,
    })),
    education: row.education.map(({ id, institution, degree, fieldOfStudy, location, startDate, endDate, grade, description }) => ({
      id, institution, degree, fieldOfStudy, location, startDate, endDate, grade, description,
    })),
    skills: row.skills.map(({ id, name, category }) => ({ id, name, category })),
    projects: row.projects.map(({ id, name, role, description, technologies, startDate, endDate, url, githubUrl }) => ({
      id, name, role, description, technologies, startDate, endDate, url, githubUrl,
    })),
    certifications: row.certifications.map(({ id, name, issuer, issueDate, expiryDate, credentialId, credentialUrl }) => ({
      id, name, issuer, issueDate, expiryDate, credentialId, credentialUrl,
    })),
    achievements: row.achievements.map(({ id, title, description, date }) => ({ id, title, description, date })),
    languages: row.languages.map(({ id, name, proficiency }) => ({ id, name, proficiency })),
    volunteerExperience: row.volunteerExperience.map(({ id, organization, role, startDate, endDate, description }) => ({
      id, organization, role, startDate, endDate, description,
    })),
    customSections,
    sectionOrder: normalizeSectionOrder(parseKeys(row.sectionOrder), customSections),
    hiddenSections: parseKeys(row.hiddenSections),
    settings: settings.success ? settings.data : { ...defaultSettings },
  };
}

/** Domain object -> plain content (drops server-owned metadata). */
export function toContent(resume: Resume): ResumeContent {
  return resumeContentSchema.parse({
    title: resume.title,
    templateId: resume.templateId,
    personalInfo: resume.personalInfo,
    summary: resume.summary,
    experience: resume.experience,
    education: resume.education,
    skills: resume.skills,
    projects: resume.projects,
    certifications: resume.certifications,
    achievements: resume.achievements,
    languages: resume.languages,
    volunteerExperience: resume.volunteerExperience,
    customSections: resume.customSections,
    sectionOrder: resume.sectionOrder,
    hiddenSections: resume.hiddenSections,
    settings: resume.settings,
  });
}

// --- Queries ----------------------------------------------------------------

export async function findOwnedResume(userId: string, id: string): Promise<Resume | null> {
  const row = await prisma.resume.findFirst({ where: { id, userId }, include: resumeInclude });
  return row ? toResume(row) : null;
}

export async function listOwnedResumes(userId: string): Promise<Resume[]> {
  const rows = await prisma.resume.findMany({
    where: { userId },
    include: resumeInclude,
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return rows.map(toResume);
}

export async function findPublicResume(slug: string): Promise<Resume | null> {
  const row = await prisma.resume.findFirst({
    where: { publicSlug: slug, visibility: { in: ["PUBLIC", "UNLISTED"] } },
    include: resumeInclude,
  });
  return row ? toResume(row) : null;
}

// --- Mutations --------------------------------------------------------------

export async function insertResume(
  userId: string,
  content: ResumeContent,
  options: { isDemo?: boolean } = {},
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const created = await tx.resume.create({
      data: {
        userId,
        isDemo: options.isDemo ?? false,
        ...rootData(content),
      },
      select: { id: true },
    });
    await writeChildren(tx, created.id, content);
    return created.id;
  });
}

export class StaleRevisionError extends Error {
  constructor(public readonly currentRevision: number) {
    super("Resume was changed elsewhere.");
  }
}

/**
 * Replaces resume content atomically. `baseRevision` guards against an older
 * tab overwriting newer edits. Snapshots the previous version when the
 * template changes so a switch can always be undone.
 */
export async function replaceResumeContent(
  userId: string,
  id: string,
  content: ResumeContent,
  baseRevision: number,
): Promise<{ revision: number; updatedAt: string } | null> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.resume.findFirst({ where: { id, userId }, include: resumeInclude });
    if (!existing) return null;
    if (existing.revision !== baseRevision) throw new StaleRevisionError(existing.revision);

    if (existing.templateId !== content.templateId) {
      await snapshot(tx, existing, "template-change");
    }

    const updated = await tx.resume.update({
      where: { id },
      data: { ...rootData(content), revision: { increment: 1 } },
      select: { revision: true, updatedAt: true },
    });
    await writeChildren(tx, id, content);
    return { revision: updated.revision, updatedAt: updated.updatedAt.toISOString() };
  });
}

async function snapshot(tx: Tx, row: ResumeRow, reason: string) {
  const content = toContent(toResume(row));
  await tx.resumeRevision.create({
    data: { resumeId: row.id, reason, snapshot: content as unknown as Prisma.InputJsonValue },
  });
  const stale = await tx.resumeRevision.findMany({
    where: { resumeId: row.id },
    orderBy: { createdAt: "desc" },
    skip: MAX_REVISIONS,
    select: { id: true },
  });
  if (stale.length) {
    await tx.resumeRevision.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
  }
}

/** Deep copy: new resume row and new child rows. The source is untouched. */
export async function duplicateOwnedResume(
  userId: string,
  id: string,
  overrides: Partial<Pick<ResumeContent, "title" | "templateId">> = {},
): Promise<string | null> {
  const source = await findOwnedResume(userId, id);
  if (!source) return null;
  const content = toContent(source);
  return insertResume(userId, {
    ...structuredClone(content),
    title: overrides.title ?? `${content.title} — Copy`.slice(0, 100),
    templateId: overrides.templateId ?? content.templateId,
  });
}

export async function deleteOwnedResume(userId: string, id: string): Promise<boolean> {
  const result = await prisma.resume.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

export async function renameOwnedResume(userId: string, id: string, title: string): Promise<boolean> {
  const result = await prisma.resume.updateMany({ where: { id, userId }, data: { title } });
  return result.count > 0;
}

export async function setOwnedVisibility(
  userId: string,
  id: string,
  visibility: Resume["visibility"],
  newSlug: () => string,
): Promise<{ visibility: Resume["visibility"]; publicSlug: string | null } | null> {
  const existing = await prisma.resume.findFirst({
    where: { id, userId },
    select: { publicSlug: true },
  });
  if (!existing) return null;
  const publicSlug = visibility === "PRIVATE" ? existing.publicSlug : existing.publicSlug ?? newSlug();
  const updated = await prisma.resume.update({
    where: { id },
    data: { visibility, publicSlug },
    select: { visibility: true, publicSlug: true },
  });
  return updated;
}

export function blankContent(title?: string, templateId?: TemplateId): ResumeContent {
  return emptyResumeContent(title, templateId);
}
