import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description: "Live preview, autosave, PDF and DOCX import, lossless template switching and print-quality PDF export.",
  alternates: { canonical: "/features" },
};

const GROUPS = [
  {
    title: "Writing",
    items: [
      ["Structured sections", "Personal details, summary, experience, education, skills, projects, certifications, achievements, languages, volunteering and your own custom sections."],
      ["Reorder anything", "Drag sections and entries, or use the move up and move down buttons — both work with a keyboard."],
      ["Helpful validation", "Clear messages for invalid emails, links and date ranges, right where you type."],
    ],
  },
  {
    title: "Design",
    items: [
      ["Five distinct templates", "Classic, Modern and Minimal are single-column and ATS friendly. Executive and Creative add more personality."],
      ["Safe customization", "Accent color, fonts, font size, line height, section spacing, margins, date format and page size."],
      ["Lossless switching", "Templates only change presentation. Your content and order are preserved."],
    ],
  },
  {
    title: "Reliability",
    items: [
      ["Autosave", "Saves about a second after you stop typing and shows Saving, Saved or Save failed."],
      ["Offline-friendly", "Unsaved edits are kept on your device and synced when you're back online."],
      ["Version safety", "We snapshot your resume before template changes so nothing is lost."],
    ],
  },
  {
    title: "Output",
    items: [
      ["PDF export", "A4 or Letter with real page breaks, selectable text and working links."],
      ["Print", "Dedicated print styles for Ctrl + P and mobile share sheets."],
      ["Public link", "Public or unlisted resume pages you can disable at any time."],
    ],
  },
] as const;

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Features</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Tools for structuring and presenting your experience. Nothing here writes your resume for you.
      </p>
      <div className="mt-12 space-y-14">
        {GROUPS.map((group) => (
          <section key={group.title} className="grid gap-6 md:grid-cols-[12rem_1fr]">
            <h2 className="text-sm font-semibold tracking-wide text-brand uppercase">{group.title}</h2>
            <dl className="grid gap-6 sm:grid-cols-3">
              {group.items.map(([title, body]) => (
                <div key={title}>
                  <dt className="font-semibold">{title}</dt>
                  <dd className="mt-1.5 text-sm text-muted-foreground">{body}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <Button asChild className="mt-14 h-12 px-6 text-base">
        <Link href="/signup">Create My Resume</Link>
      </Button>
    </div>
  );
}
