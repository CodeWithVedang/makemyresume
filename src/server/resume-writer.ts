import type { Prisma, PrismaClient } from "@prisma/client";

import type { ResumeContent } from "@/lib/resume/schema";
import { normalizeSectionOrder } from "@/lib/resume/sections";

/**
 * Low-level resume writes shared by the repository and the seed script.
 * Callers are responsible for authorization and validation.
 */

type Tx = Prisma.TransactionClient | PrismaClient;

/** Replaces all child rows. Entries get fresh database ids on every write. */
export async function writeChildren(tx: Tx, resumeId: string, content: ResumeContent) {
  const withPos = <T,>(items: T[]) => items.map((item, position) => ({ ...item, position, resumeId }));
  const strip = <T extends { id: string }>(item: T): Omit<T, "id"> => {
    const { id: _id, ...rest } = item;
    void _id;
    return rest;
  };

  const p = content.personalInfo;
  await tx.personalInfo.upsert({
    where: { resumeId },
    create: { resumeId, ...p, otherLinks: p.otherLinks },
    update: { ...p, otherLinks: p.otherLinks },
  });

  await Promise.all([
    tx.experience.deleteMany({ where: { resumeId } }),
    tx.education.deleteMany({ where: { resumeId } }),
    tx.skill.deleteMany({ where: { resumeId } }),
    tx.project.deleteMany({ where: { resumeId } }),
    tx.certification.deleteMany({ where: { resumeId } }),
    tx.achievement.deleteMany({ where: { resumeId } }),
    tx.language.deleteMany({ where: { resumeId } }),
    tx.volunteerExperience.deleteMany({ where: { resumeId } }),
    tx.customSection.deleteMany({ where: { resumeId } }),
  ]);

  await Promise.all([
    tx.experience.createMany({ data: withPos(content.experience).map(strip) }),
    tx.education.createMany({ data: withPos(content.education).map(strip) }),
    tx.skill.createMany({ data: withPos(content.skills).map(strip) }),
    tx.project.createMany({ data: withPos(content.projects).map(strip) }),
    tx.certification.createMany({ data: withPos(content.certifications).map(strip) }),
    tx.achievement.createMany({ data: withPos(content.achievements).map(strip) }),
    tx.language.createMany({ data: withPos(content.languages).map(strip) }),
    tx.volunteerExperience.createMany({ data: withPos(content.volunteerExperience).map(strip) }),
  ]);

  for (const [position, section] of content.customSections.entries()) {
    await tx.customSection.create({
      data: {
        resumeId,
        clientKey: section.id,
        position,
        title: section.title,
        entries: {
          create: section.entries.map((e, entryPosition) => ({
            position: entryPosition,
            title: e.title,
            subtitle: e.subtitle,
            date: e.date,
            description: e.description,
          })),
        },
      },
    });
  }
}

export function rootData(content: ResumeContent) {
  const order = normalizeSectionOrder(content.sectionOrder, content.customSections);
  return {
    title: content.title,
    templateId: content.templateId,
    summary: content.summary,
    settings: content.settings,
    sectionOrder: order,
    hiddenSections: content.hiddenSections.filter((k) => order.includes(k)),
  };
}

