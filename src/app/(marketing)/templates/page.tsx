import type { Metadata } from "next";

import { TemplateGallery } from "@/components/landing/TemplateGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { appUrl } from "@/lib/config";
import { templates } from "@/templates/registry";

export const metadata: Metadata = {
  title: "Free Resume Templates — ATS-Friendly Formats for Freshers & Professionals",
  description: `${templates.length} professional resume templates, including ATS-friendly single-column formats for freshers and experienced professionals. Fill in online and download as PDF.`,
  keywords: ["resume templates", "free resume templates", "ATS friendly resume template", "resume format for freshers", "resume format download"],
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Resume templates",
          itemListElement: templates.map((tpl, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${tpl.name} resume template`,
            url: `${appUrl()}/templates/${tpl.id}`,
          })),
        }}
      />
    </div>
  );
}
