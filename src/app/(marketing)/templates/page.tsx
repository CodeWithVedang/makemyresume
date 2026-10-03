import type { Metadata } from "next";

import { TemplateGallery } from "@/components/landing/TemplateGallery";

export const metadata: Metadata = {
  title: "Resume Templates",
  description: "Professional resume templates, including ATS-friendly single-column layouts.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Resume templates</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every template uses the same information, so you can switch at any time without retyping. Templates
        marked ATS friendly use a single column with no graphics around important text. No template can
        guarantee a score in any tracking system.
      </p>
      <div className="mt-10">
        <TemplateGallery />
      </div>
    </div>
  );
}
