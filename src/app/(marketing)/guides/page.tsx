import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Reveal } from "@/components/landing/Reveal";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "Resume Guides — Formats, ATS Tips & Examples",
  description: "Practical resume guides for Indian job seekers: fresher resume format, ATS-friendly resumes and summary examples.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="text-sm font-semibold text-brand">Resume guides</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Write a better resume, step by step</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">Short, practical advice for freshers and experienced professionals in India.</p>
      </Reveal>
      <ul className="mt-10 space-y-4">
        {GUIDES.map((g, i) => (
          <Reveal key={g.slug} delay={i * 0.08}>
            <li>
              <Link
                href={`/guides/${g.slug}`}
                className="group block rounded-xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary hover:shadow-card"
              >
                <h2 className="text-lg font-semibold">{g.title}</h2>
                <p className="mt-2 text-muted-foreground">{g.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                  Read · {g.readingMinutes} min
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
