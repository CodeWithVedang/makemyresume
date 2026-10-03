import type { TemplateId } from "@/lib/resume/schema";

export type TemplateCategory =
  | "ATS"
  | "Modern"
  | "Professional"
  | "Minimal"
  | "Executive"
  | "Creative"
  | "Fresher"
  | "Developer";

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  style: string;
  description: string;
  categories: TemplateCategory[];
  /** Single column, no graphics or tables around critical text. */
  atsFriendly: boolean;
  supportsPhoto: boolean;
};

/** Presentation-only metadata. Safe to import on server and client. */
export const templates: readonly TemplateMeta[] = [
  {
    id: "classic",
    name: "Classic",
    style: "Single column · Serif-free · Black & white",
    description: "A traditional, highly readable layout that parses cleanly in applicant tracking systems.",
    categories: ["ATS", "Professional", "Fresher"],
    atsFriendly: true,
    supportsPhoto: false,
  },
  {
    id: "modern",
    name: "Modern",
    style: "Single column · Date gutter · Subtle accent",
    description: "Strong typography with a quiet accent color and a timeline-style date column.",
    categories: ["ATS", "Modern", "Developer"],
    atsFriendly: true,
    supportsPhoto: false,
  },
  {
    id: "minimal",
    name: "Minimal",
    style: "Side headings · Generous whitespace",
    description: "Whitespace-led layout with section labels in a narrow left column.",
    categories: ["ATS", "Minimal", "Developer"],
    atsFriendly: true,
    supportsPhoto: false,
  },
  {
    id: "executive",
    name: "Executive",
    style: "Centered header · Core competencies grid",
    description: "A commanding header and clear hierarchy for senior and leadership roles.",
    categories: ["Executive", "Professional"],
    atsFriendly: false,
    supportsPhoto: true,
  },
  {
    id: "creative",
    name: "Creative",
    style: "Two columns · Sidebar for skills",
    description: "A modern two-column layout that stays readable and print-friendly.",
    categories: ["Creative", "Modern", "Fresher"],
    atsFriendly: false,
    supportsPhoto: true,
  },
];

export function getTemplateMeta(id: string): TemplateMeta {
  return templates.find((t) => t.id === id) ?? templates[0];
}
