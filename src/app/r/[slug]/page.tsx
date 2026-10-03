import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { LogoMark } from "@/components/brand/Logo";
import { PrintButton } from "@/components/resume/PrintButton";
import { PrintStyles } from "@/components/resume/PrintStyles";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { APP_NAME } from "@/lib/config";
import { findPublicResume, toContent } from "@/server/resume-repository";
import { ResumeRenderer } from "@/templates/ResumeRenderer";

const load = cache(async (slug: string) => {
  if (!/^[a-z0-9]{6,20}$/.test(slug)) return null;
  return findPublicResume(slug);
});

export async function generateMetadata(props: PageProps<"/r/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const resume = await load(slug);
  if (!resume) return { title: "Resume not found", robots: { index: false } };
  const p = resume.personalInfo;
  const name = p.fullName || "Resume";
  const title = p.professionalTitle ? `${name} — ${p.professionalTitle}` : name;
  const description = [p.professionalTitle, p.location].filter(Boolean).join(" · ") || `${name}'s resume`;
  return {
    title,
    description,
    alternates: { canonical: `/r/${slug}` },
    robots: resume.visibility === "PUBLIC" ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: "profile", title, description, url: `/r/${slug}` },
    twitter: { card: "summary", title, description },
  };
}

export default async function PublicResumePage(props: PageProps<"/r/[slug]">) {
  const { slug } = await props.params;
  const resume = await load(slug);
  if (!resume) notFound();
  const content = toContent(resume);

  return (
    <div className="min-h-dvh bg-canvas print:bg-white">
      <PrintStyles settings={content.settings} />
      <header className="no-print border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-[860px] items-center gap-3 px-4">
          <p className="min-w-0 flex-1 truncate text-sm font-semibold">{content.personalInfo.fullName || "Resume"}</p>
          <PrintButton />
        </div>
      </header>
      <main id="main" className="px-3 py-6 sm:px-6 sm:py-10 print:p-0">
        <div className="mx-auto max-w-[820px] overflow-hidden rounded-sm shadow-page print:hidden">
          <ScaledResume content={content} />
        </div>
        <div className="hidden print:block">
          <ResumeRenderer content={content} mode="print" />
        </div>
      </main>
      <footer className="no-print pb-10 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
          <LogoMark className="size-5" /> Made with {APP_NAME}
        </Link>
      </footer>
    </div>
  );
}
