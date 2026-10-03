/** Public, non-secret app configuration. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "MakeMyResume";
export const APP_TAGLINE = "Free ATS-friendly resume maker for India";
export const APP_DESCRIPTION =
  "Make a professional, ATS-friendly resume in minutes. Free resume maker for freshers and experienced professionals in India: live preview, 5 templates, PDF download and import from Word or PDF.";

/** Plan requests are handled by email until a payment gateway is configured. */
export const PLAN_REQUEST_EMAIL = process.env.NEXT_PUBLIC_PLAN_REQUEST_EMAIL || "shelatkarvedang2@gmail.com";

export const DEVELOPER = {
  name: "CodeWithVedang",
  github: "https://github.com/codewithvedang",
} as const;

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
