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
  /** Shown when the template places sections differently from the editor order. */
  layoutNote?: string;
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
    layoutNote: "Skills, languages and certifications appear in the sidebar.",
  },
  {
    id: "compact",
    name: "Compact",
    style: "Single column · Dense · Inline details",
    description: "Tight spacing that fits more experience on one page without hurting ATS parsing.",
    categories: ["ATS", "Professional", "Fresher"],
    atsFriendly: true,
    supportsPhoto: false,
  },
  {
    id: "elegant",
    name: "Elegant",
    style: "Centered · Small caps · Fine rules",
    description: "Refined, centered typography suited to consulting, finance, law and academia.",
    categories: ["ATS", "Professional", "Minimal"],
    atsFriendly: true,
    supportsPhoto: false,
  },
  {
    id: "technical",
    name: "Technical",
    style: "Single column · Skills first · Mono labels",
    description: "Built for engineers: your stack sits right under the summary, where recruiters look first.",
    categories: ["ATS", "Developer", "Modern"],
    atsFriendly: true,
    supportsPhoto: false,
    layoutNote: "Skills always appear right after your summary.",
  },
  {
    id: "sidebar",
    name: "Sidebar",
    style: "Two columns · Tinted profile column · Photo",
    description: "A tinted profile column with contact, skills and languages beside your experience.",
    categories: ["Creative", "Modern", "Executive"],
    atsFriendly: false,
    supportsPhoto: true,
    layoutNote: "Skills, languages, certifications and achievements appear in the sidebar.",
  },
];

export function getTemplateMeta(id: string): TemplateMeta {
  return templates.find((t) => t.id === id) ?? templates[0];
}
