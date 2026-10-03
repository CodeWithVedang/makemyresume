import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { APP_NAME, appUrl, DEVELOPER } from "@/lib/config";
import { getGuide, GUIDES } from "@/lib/content/guides";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata(props: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const guide = getGuide((await props.params).slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    keywords: guide.keywords,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: { type: "article", title: guide.title, description: guide.description, modifiedTime: guide.updated },
  };
}

export default async function GuidePage(props: PageProps<"/guides/[slug]">) {
  const guide = getGuide((await props.params).slug);
  if (!guide) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Link href="/guides" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> All guides
      </Link>
      <h1 className="mt-6 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{guide.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {guide.readingMinutes} min read · Updated{" "}
        {new Date(guide.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-foreground/90">
        {guide.blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="pt-4 text-xl font-semibold text-foreground">
              {b.text}
            </h2>
          ) : b.type === "p" ? (
            <p key={i}>{b.text}</p>
          ) : (
            <ul key={i} className="list-disc space-y-2 pl-5">
              {b.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ),
        )}
      </div>
      <aside className="mt-12 rounded-xl border border-border bg-card p-6">
        <p className="font-semibold">Put this into practice</p>
        <p className="mt-1 text-sm text-muted-foreground">Build your resume with live preview and download a clean PDF. Your first resume is free.</p>
        <Button asChild className="shine mt-4 h-11">
          <Link href="/signup">Create My Resume, Free</Link>
        </Button>
      </aside>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title,
          description: guide.description,
          dateModified: guide.updated,
          author: { "@type": "Organization", name: DEVELOPER.name, url: DEVELOPER.github },
          publisher: { "@type": "Organization", name: APP_NAME, url: appUrl() },
          mainEntityOfPage: `${appUrl()}/guides/${guide.slug}`,
        }}
      />
    </article>
  );
}
