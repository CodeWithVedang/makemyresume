import type { ResumeSettings } from "./schema";

/** Physical page metrics shared by preview, print CSS and PDF export. */
export const PAGE_SIZES = {
  A4: { width: "210mm", height: "297mm", widthPx: 794, heightPx: 1123 },
  LETTER: { width: "8.5in", height: "11in", widthPx: 816, heightPx: 1056 },
} as const;

export const MARGINS: Record<ResumeSettings["margins"], string> = {
  narrow: "12mm",
  normal: "18mm",
  wide: "24mm",
};

export const SECTION_GAPS: Record<ResumeSettings["sectionSpacing"], string> = {
  compact: "0.85em",
  normal: "1.25em",
  relaxed: "1.7em",
};

export const FONT_STACKS: Record<ResumeSettings["fontFamily"], { label: string; stack: string }> = {
  inter: { label: "Inter", stack: "var(--font-inter), 'Helvetica Neue', Arial, sans-serif" },
  plex: { label: "IBM Plex Sans", stack: "var(--font-plex), 'Helvetica Neue', Arial, sans-serif" },
  geist: { label: "Geist", stack: "var(--font-geist-sans), 'Helvetica Neue', Arial, sans-serif" },
  "source-serif": {
    label: "Source Serif",
    stack: "var(--font-source-serif), Georgia, 'Times New Roman', serif",
  },
  lora: { label: "Lora", stack: "var(--font-lora), Georgia, 'Times New Roman', serif" },
};

export const ACCENT_PRESETS = [
  { label: "Harbor", value: "#2F6B8A" },
  { label: "Navy", value: "#183B56" },
  { label: "Graphite", value: "#2B2F33" },
  { label: "Pine", value: "#2E6B57" },
  { label: "Plum", value: "#5B3A6B" },
  { label: "Rust", value: "#A4492B" },
  { label: "Teal", value: "#1F6E73" },
] as const;
