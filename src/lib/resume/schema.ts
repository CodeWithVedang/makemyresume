import { z } from "zod";

import { isSafeUrl } from "./links";

/**
 * Canonical resume data contract.
 *
 * The same normalized shape feeds the editor, the live preview, print, PDF
 * export and public pages. Templates only decide presentation.
 */

export const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const id = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid identifier.");

const text = (max: number) =>
  z.string().max(max, `Keep this under ${max} characters.`);

const month = z
  .string()
  .refine((v) => v === "" || MONTH_PATTERN.test(v), "Enter a valid month.");

const optionalEmail = z
  .string()
  .max(254)
  .refine(
    (v) => v === "" || z.email().safeParse(v).success,
    "Please enter a valid email address.",
  );

const optionalUrl = z
  .string()
  .max(500)
  .refine((v) => v === "" || isSafeUrl(v), "Please enter a valid web address.");

/** End date must not precede start date unless the entry is ongoing. */
function checkDateRange(
  value: { startDate: string; endDate: string; current?: boolean },
  ctx: z.RefinementCtx,
) {
  if (value.current || !value.startDate || !value.endDate) return;
  if (!MONTH_PATTERN.test(value.startDate) || !MONTH_PATTERN.test(value.endDate)) return;
  if (value.endDate < value.startDate) {
    ctx.addIssue({
      code: "custom",
      path: ["endDate"],
      message: "End date cannot be before start date.",
    });
  }
}

export const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "INTERNSHIP",
  "CONTRACT",
  "FREELANCE",
  "APPRENTICESHIP",
] as const;

export const employmentTypeLabels: Record<(typeof employmentTypes)[number], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  APPRENTICESHIP: "Apprenticeship",
};

export const linkSchema = z.object({
  id,
  label: text(40),
  url: optionalUrl,
});

export const personalInfoSchema = z.object({
  fullName: text(120),
  professionalTitle: text(120),
  email: optionalEmail,
  phone: text(40),
  location: text(120),
  website: optionalUrl,
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  otherLinks: z.array(linkSchema).max(5),
  photo: z
    .string()
    .max(400_000, "Photo is too large.")
    .regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/, "Unsupported photo format.")
    .nullable(),
});

export const experienceSchema = z
  .object({
    id,
    jobTitle: text(120),
    company: text(120),
    location: text(120),
    employmentType: z.enum(employmentTypes),
    startDate: month,
    endDate: month,
    current: z.boolean(),
    description: text(5000),
  })
  .superRefine(checkDateRange);

export const educationSchema = z
  .object({
    id,
    institution: text(160),
    degree: text(160),
    fieldOfStudy: text(160),
    location: text(120),
    startDate: month,
    endDate: month,
    grade: text(60),
    description: text(3000),
  })
  .superRefine(checkDateRange);

export const skillSchema = z.object({
  id,
  name: text(60).min(1, "Skill name is required."),
  category: text(60),
});

export const projectSchema = z
  .object({
    id,
    name: text(120),
    role: text(120),
    description: text(4000),
    technologies: z.array(text(40)).max(30),
    startDate: month,
    endDate: month,
    url: optionalUrl,
    githubUrl: optionalUrl,
  })
  .superRefine(checkDateRange);

export const certificationSchema = z
  .object({
    id,
    name: text(160),
    issuer: text(160),
    issueDate: month,
    expiryDate: month,
    credentialId: text(120),
    credentialUrl: optionalUrl,
  })
  .superRefine((value, ctx) => {
    if (value.issueDate && value.expiryDate && value.expiryDate < value.issueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry date cannot be before issue date.",
      });
    }
  });

export const achievementSchema = z.object({
  id,
  title: text(160),
  description: text(2000),
  date: month,
});

export const languageSchema = z.object({
  id,
  name: text(60),
  proficiency: text(60),
});

export const volunteerSchema = z
  .object({
    id,
    organization: text(160),
    role: text(120),
    startDate: month,
    endDate: month,
    description: text(3000),
  })
  .superRefine(checkDateRange);

export const customEntrySchema = z.object({
  id,
  title: text(160),
  subtitle: text(160),
  date: text(40),
  description: text(3000),
});

export const customSectionSchema = z.object({
  id,
  title: text(60).min(1, "Section name is required."),
  entries: z.array(customEntrySchema).max(40),
});

// --- Design settings -------------------------------------------------------

export const fontFamilies = ["inter", "plex", "source-serif", "lora", "geist"] as const;
export const sectionSpacings = ["compact", "normal", "relaxed"] as const;
export const marginSizes = ["narrow", "normal", "wide"] as const;
export const dateFormats = ["MMM YYYY", "MMMM YYYY", "MM/YYYY", "YYYY"] as const;
export const pageSizes = ["A4", "LETTER"] as const;

export const settingsSchema = z.object({
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Choose a valid color."),
  fontFamily: z.enum(fontFamilies),
  fontSize: z.number().min(9).max(12),
  lineHeight: z.number().min(1.2).max(1.7),
  sectionSpacing: z.enum(sectionSpacings),
  margins: z.enum(marginSizes),
  dateFormat: z.enum(dateFormats),
  pageSize: z.enum(pageSizes),
});

// --- Sections ---------------------------------------------------------------

export const builtInSectionKeys = [
  "summary",
  "experience",
  "education",
  "skills",
  "projects",
  "certifications",
  "achievements",
  "languages",
  "volunteer",
] as const;

export type BuiltInSectionKey = (typeof builtInSectionKeys)[number];
export type CustomSectionKey = `custom:${string}`;
export type SectionKey = BuiltInSectionKey | CustomSectionKey;

const sectionKey = z.union([
  z.enum(builtInSectionKeys),
  z.custom<CustomSectionKey>(
    (v) => typeof v === "string" && /^custom:[A-Za-z0-9_-]{1,40}$/.test(v),
  ),
]);

export const templateIds = ["classic", "modern", "minimal", "executive", "creative", "compact", "elegant", "technical", "sidebar"] as const;
export type TemplateId = (typeof templateIds)[number];

/** Everything the user edits. Persisted by `saveResume`. */
export const resumeContentSchema = z.object({
  title: text(100).min(1, "Resume name is required."),
  templateId: z.enum(templateIds),
  personalInfo: personalInfoSchema,
  summary: text(3000),
  experience: z.array(experienceSchema).max(30),
  education: z.array(educationSchema).max(20),
  skills: z.array(skillSchema).max(100),
  projects: z.array(projectSchema).max(30),
  certifications: z.array(certificationSchema).max(30),
  achievements: z.array(achievementSchema).max(30),
  languages: z.array(languageSchema).max(20),
  volunteerExperience: z.array(volunteerSchema).max(20),
  customSections: z.array(customSectionSchema).max(10),
  sectionOrder: z.array(sectionKey).max(30),
  hiddenSections: z.array(sectionKey).max(30),
  settings: settingsSchema,
});

export type Link = z.infer<typeof linkSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type EmploymentType = Experience["employmentType"];
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type Achievement = z.infer<typeof achievementSchema>;
export type Language = z.infer<typeof languageSchema>;
export type VolunteerExperience = z.infer<typeof volunteerSchema>;
export type CustomEntry = z.infer<typeof customEntrySchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;
export type ResumeSettings = z.infer<typeof settingsSchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

export type Visibility = "PRIVATE" | "UNLISTED" | "PUBLIC";

/** A persisted resume: content plus server-owned metadata. */
export type Resume = ResumeContent & {
  id: string;
  isDemo: boolean;
  visibility: Visibility;
  publicSlug: string | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
};
