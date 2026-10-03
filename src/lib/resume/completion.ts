import type { ResumeContent } from "./schema";

export type CompletionItem = { key: string; label: string; done: boolean; weight: number };

/**
 * Completion is derived only from what the user has actually filled in.
 * Optional sections carry less weight so a strong resume can reach 100%
 * without padding every section.
 */
export function completionItems(content: ResumeContent): CompletionItem[] {
  const p = content.personalInfo;
  return [
    {
      key: "personal",
      label: "Personal Information",
      done: Boolean(p.fullName.trim() && p.email.trim() && (p.phone.trim() || p.location.trim())),
      weight: 20,
    },
    { key: "summary", label: "Summary", done: content.summary.trim().length >= 40, weight: 10 },
    {
      key: "experience",
      label: "Experience",
      done: content.experience.some((e) => e.jobTitle.trim() && e.company.trim()),
      weight: 25,
    },
    {
      key: "education",
      label: "Education",
      done: content.education.some((e) => e.institution.trim()),
      weight: 15,
    },
    { key: "skills", label: "Skills", done: content.skills.length >= 3, weight: 15 },
    {
      key: "projects",
      label: "Projects",
      done: content.projects.some((e) => e.name.trim()),
      weight: 10,
    },
    {
      key: "certifications",
      label: "Certifications",
      done: content.certifications.some((e) => e.name.trim()),
      weight: 5,
    },
  ];
}

export function completionPercent(content: ResumeContent): number {
  const items = completionItems(content);
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  const done = items.reduce((sum, i) => sum + (i.done ? i.weight : 0), 0);
  return Math.round((done / total) * 100);
}
