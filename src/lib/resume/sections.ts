import {
  builtInSectionKeys,
  type BuiltInSectionKey,
  type CustomSection,
  type CustomSectionKey,
  type ResumeContent,
  type SectionKey,
} from "./schema";

export const sectionLabels: Record<BuiltInSectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  volunteer: "Volunteer Experience",
};

export function customKey(id: string): CustomSectionKey {
  return `custom:${id}`;
}

export function isCustomKey(key: SectionKey): key is CustomSectionKey {
  return key.startsWith("custom:");
}

export function sectionTitle(key: SectionKey, customSections: CustomSection[]): string {
  if (isCustomKey(key)) {
    const id = key.slice("custom:".length);
    return customSections.find((s) => s.id === id)?.title ?? "Custom section";
  }
  return sectionLabels[key];
}

/**
 * Returns a complete, de-duplicated order: keeps the user's order, drops keys
 * for deleted custom sections, and appends any section missing from the list.
 */
export function normalizeSectionOrder(
  order: readonly SectionKey[],
  customSections: CustomSection[],
): SectionKey[] {
  const valid = new Set<SectionKey>([
    ...builtInSectionKeys,
    ...customSections.map((s) => customKey(s.id)),
  ]);
  const result: SectionKey[] = [];
  for (const key of order) {
    if (valid.has(key) && !result.includes(key)) result.push(key);
  }
  for (const key of valid) {
    if (!result.includes(key)) result.push(key);
  }
  return result;
}

/** True when a section has user content worth rendering. */
export function sectionHasContent(content: ResumeContent, key: SectionKey): boolean {
  if (isCustomKey(key)) {
    const id = key.slice("custom:".length);
    const section = content.customSections.find((s) => s.id === id);
    return Boolean(section && section.entries.length > 0);
  }
  switch (key) {
    case "summary":
      return content.summary.trim().length > 0;
    case "experience":
      return content.experience.length > 0;
    case "education":
      return content.education.length > 0;
    case "skills":
      return content.skills.length > 0;
    case "projects":
      return content.projects.length > 0;
    case "certifications":
      return content.certifications.length > 0;
    case "achievements":
      return content.achievements.length > 0;
    case "languages":
      return content.languages.length > 0;
    case "volunteer":
      return content.volunteerExperience.length > 0;
  }
}

/** Sections a template should render, in user order. */
export function visibleSections(content: ResumeContent): SectionKey[] {
  const hidden = new Set(content.hiddenSections);
  return normalizeSectionOrder(content.sectionOrder, content.customSections).filter(
    (key) => !hidden.has(key) && sectionHasContent(content, key),
  );
}
