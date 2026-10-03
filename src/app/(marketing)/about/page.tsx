import type { Metadata } from "next";

import { APP_NAME, DEVELOPER, PLAN_REQUEST_EMAIL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `Why ${APP_NAME} is manual-first, how we handle your data, and resume writing resources.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">About {APP_NAME}</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A resume should describe what you have actually done. {APP_NAME} gives you structure, templates and
        export tools, and leaves the writing to you.
      </p>

      <h2 className="mt-12 text-xl font-semibold">Resume writing resources</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>Lead each bullet with what you did, then the outcome you can verify.</li>
        <li>Keep a summary to two or three sentences about your professional background.</li>
        <li>Use a single-column template when applying through large job portals.</li>
        <li>Duplicate your resume for each role and adjust the emphasis, not the facts.</li>
      </ul>

      <h2 id="privacy" className="mt-12 scroll-mt-24 text-xl font-semibold">
        Privacy
      </h2>
      <p className="mt-4 text-muted-foreground">
        Your resumes are private by default. Imported files are processed in memory and are not stored. Product
        analytics record events such as &ldquo;resume created&rdquo;, never the text of your resume. You can
        delete any resume at any time.
      </p>

      <h2 id="contact" className="mt-12 scroll-mt-24 text-xl font-semibold">
        Contact
      </h2>
      <p className="mt-4 text-muted-foreground">
        Questions, feedback or plan requests? Email{" "}
        <a href={`mailto:${PLAN_REQUEST_EMAIL}`} className="font-medium text-brand hover:underline">
          {PLAN_REQUEST_EMAIL}
        </a>
        . Built by{" "}
        <a href={DEVELOPER.github} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">
          {DEVELOPER.name}
        </a>
        .
      </p>
    </article>
  );
}
