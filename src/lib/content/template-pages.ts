import type { TemplateId } from "@/lib/resume/schema";

/** Search-facing copy for each template's landing page (/templates/[id]). */
export type TemplatePageContent = {
  /** Page <title>; the root layout appends the app name. */
  title: string;
  description: string;
  keywords: string[];
  bestFor: string[];
  highlights: string[];
};

export const TEMPLATE_PAGES: Record<TemplateId, TemplatePageContent> = {
  classic: {
    title: "Classic Resume Template — Free, ATS-Friendly Format",
    description:
      "A traditional single-column resume template that applicant tracking systems read cleanly. Fill it in online and download a PDF for free.",
    keywords: ["classic resume template", "simple resume format", "ATS resume template", "resume format for freshers"],
    bestFor: ["Freshers and first jobs", "Government and PSU applications", "Large job portals like Naukri and LinkedIn"],
    highlights: ["Single column with plain section headings", "Black and white, prints well anywhere", "Works for every industry"],
  },
  modern: {
    title: "Modern Resume Template — Clean, ATS-Friendly Design",
    description:
      "A modern resume template with a date column and a subtle accent color. Single column, so it stays ATS friendly. Free PDF download.",
    keywords: ["modern resume template", "professional resume format", "ATS friendly resume", "resume template for software engineer"],
    bestFor: ["Software and product roles", "Mid-level professionals", "Startups and tech companies"],
    highlights: ["Timeline-style date column", "Accent color you can change", "Strong, readable typography"],
  },
  minimal: {
    title: "Minimal Resume Template — Simple, Whitespace-Led Layout",
    description:
      "A minimal resume template with section labels in a narrow side column and generous whitespace. ATS friendly and free to download.",
    keywords: ["minimal resume template", "simple resume template", "clean resume format", "one page resume"],
    bestFor: ["Developers and analysts", "Researchers", "Anyone who prefers a quiet design"],
    highlights: ["Side labels make sections easy to scan", "Inline skills save space", "Lots of whitespace without wasting the page"],
  },
  executive: {
    title: "Executive Resume Template — For Senior and Leadership Roles",
    description:
      "An executive resume template with a centered header, optional photo and a core competencies grid. Built for senior managers and leaders.",
    keywords: ["executive resume template", "senior manager resume format", "leadership resume", "resume with photo"],
    bestFor: ["Managers and directors", "Sales and marketing leaders", "Roles where the resume goes to a person, not a portal"],
    highlights: ["Commanding centered header", "Core competencies grid", "Optional profile photo"],
  },
  creative: {
    title: "Creative Resume Template — Two-Column Design With Photo",
    description:
      "A two-column creative resume template with a sidebar for skills and contact details. Readable, print-friendly and free to download as PDF.",
    keywords: ["creative resume template", "two column resume", "designer resume template", "resume with photo"],
    bestFor: ["Designers and creatives", "Marketing and media roles", "Portfolio-led applications"],
    highlights: ["Sidebar for skills, languages and certifications", "Tinted header with optional photo", "Still prints cleanly on A4"],
  },
  compact: {
    title: "Compact Resume Template — Fit More on One Page",
    description:
      "A dense single-column resume template that fits more experience on one page without hurting ATS parsing. Free online resume maker with PDF download.",
    keywords: ["one page resume template", "compact resume format", "ATS resume template", "resume format for experienced"],
    bestFor: ["Freshers with internships and projects", "Experienced professionals keeping to one page", "Campus placements"],
    highlights: ["Tight spacing with inline details", "Clear ruled section headings", "Single column, ATS friendly"],
  },
  elegant: {
    title: "Elegant Resume Template — Refined Serif-Friendly Layout",
    description:
      "An elegant resume template with a centered small-caps header and fine rules. Single column and ATS friendly, suited to finance, law and consulting.",
    keywords: ["elegant resume template", "professional resume format", "finance resume template", "law resume template"],
    bestFor: ["Finance, banking and consulting", "Law and academia", "Formal applications"],
    highlights: ["Centered small-caps typography", "Looks best with a serif font", "Single column, ATS friendly"],
  },
  technical: {
    title: "Technical Resume Template — For Software Engineers and Developers",
    description:
      "A technical resume template that puts your skills right under the summary, where recruiters look first. ATS friendly and free to download as PDF.",
    keywords: ["software engineer resume template", "developer resume format", "technical resume", "IT resume format"],
    bestFor: ["Software engineers and developers", "Data, DevOps and QA roles", "IT freshers with projects"],
    highlights: ["Skills placed right after the summary", "Monospace labels with a developer feel", "Project technologies called out"],
  },
  sidebar: {
    title: "Sidebar Resume Template — Modern Two-Column Profile Layout",
    description:
      "A sidebar resume template with a tinted profile column for your photo, contact details, skills and languages beside your experience.",
    keywords: ["sidebar resume template", "two column resume template", "modern resume with photo", "profile resume format"],
    bestFor: ["Client-facing and creative roles", "Applications sent directly to a hiring manager", "Profiles with many skills and languages"],
    highlights: ["Tinted profile column with optional photo", "Skills, languages and achievements in the sidebar", "Experience gets the full main column"],
  },
};
