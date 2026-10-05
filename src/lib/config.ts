/** Public, non-secret app configuration. */
import { templateIds } from "@/lib/resume/schema";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MakeMyResume";
export const APP_TAGLINE = "Free ATS-friendly resume maker for India";
export const APP_DESCRIPTION =
  `Make a professional, ATS-friendly resume in minutes. Free resume maker for freshers and experienced professionals in India: live preview, ${templateIds.length} templates, PDF download and import from Word or PDF.`;

/** Plan requests are handled by email until a payment gateway is configured. */
export const PLAN_REQUEST_EMAIL = process.env.NEXT_PUBLIC_PLAN_REQUEST_EMAIL || "shelatkarvedang2@gmail.com";

export const DEVELOPER = {
  name: "CodeWithVedang",
  github: "https://github.com/codewithvedang",
} as const;

/**
 * Absolute site origin. Accepts values without a scheme ("example.com") and
 * falls back to Vercel's deployment URL, then localhost.
 */
export function appUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    return "http://localhost:3000";
  }
}
