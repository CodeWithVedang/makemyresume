import { ArrowLeft, Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AtsBadge } from "@/components/landing/AtsBadge";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { PLANS, formatInr, templateAllowed, entitlementsFor } from "@/lib/billing/plans";
import { APP_NAME, appUrl } from "@/lib/config";
import { TEMPLATE_PAGES } from "@/lib/content/template-pages";
import { sampleForTemplate } from "@/lib/resume/samples";
import { templateIds, type TemplateId } from "@/lib/resume/schema";
import { getTemplateMeta, templates } from "@/templates/registry";

export const dynamicParams = false;

export function generateStaticParams() {
  return templateIds.map((id) => ({ id }));
}

function parseId(id: string): TemplateId | null {
  return (templateIds as readonly string[]).includes(id) ? (id as TemplateId) : null;
}

export async function generateMetadata(props: PageProps<"/templates/[id]">): Promise<Metadata> {
  const id = parseId((await props.params).id);
  if (!id) return {};
  const page = TEMPLATE_PAGES[id];
  return {
    title: page.title,
    description: page.description,
    keywords: page.keywords,
    alternates: { canonical: `/templates/${id}` },
    openGraph: { title: page.title, description: page.description, url: `/templates/${id}` },
  };
}

export default async function TemplateDetailPage(props: PageProps<"/templates/[id]">) {
  const id = parseId((await props.params).id);
  if (!id) notFound();
  const meta = getTemplateMeta(id);
  const page = TEMPLATE_PAGES[id];
  const isFree = templateAllowed(entitlementsFor("FREE"), id);
  const others = templates.filter((t) => t.id !== id);
  const base = appUrl();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <nav aria-label="Breadcrumb">
        <Link href="/templates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> All templates
        </Link>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap items-center gap-2">
            {meta.atsFriendly ? <AtsBadge /> : null}
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {isFree ? "Free" : `Paid plans from ${formatInr(PLANS.JOB_PASS.priceInr)}`}
            </span>
          </div>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{meta.name} resume template</h1>
          <p className="mt-3 text-muted-foreground">{meta.style}</p>
          <p className="mt-5 text-lg text-foreground/90">{page.description}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <section>
              <h2 className="text-sm font-semibold">Best for</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {page.bestFor.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-sm font-semibold">What you get</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {page.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {meta.layoutNote ? <p className="mt-6 text-sm text-muted-foreground">{meta.layoutNote}</p> : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="shine h-11">
              <Link href={`/signup?template=${id}`}>Use the {meta.name} template</Link>
            </Button>
            <Button asChild variant="outline" className="h-11">
              <Link href="/templates">Compare all templates</Link>
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Switch templates at any time without retyping. Download as PDF.
          </p>
        </div>

        <figure className="rounded-xl border border-border bg-canvas p-4 sm:p-8">
          <div className="overflow-hidden rounded-sm shadow-page">
            <ScaledResume content={sampleForTemplate(id)} clip />
          </div>
          <figcaption className="mt-3 text-center text-xs text-muted-foreground">
            {meta.name} template with sample content. People and companies are fictional.
          </figcaption>
        </figure>
      </div>

      <section className="mt-20" aria-labelledby="more-templates">
        <h2 id="more-templates" className="text-xl font-semibold tracking-tight">
          More resume templates
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((t) => (
            <li key={t.id}>
              <Link
                href={`/templates/${t.id}`}
                className="block h-full rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="flex items-center justify-between gap-2 font-medium">
                  {t.name}
                  {t.atsFriendly ? <AtsBadge /> : null}
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{t.style}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: base },
            { "@type": "ListItem", position: 2, name: "Resume templates", item: `${base}/templates` },
            { "@type": "ListItem", position: 3, name: `${meta.name} template`, item: `${base}/templates/${id}` },
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: `${meta.name} resume template`,
          description: page.description,
          url: `${base}/templates/${id}`,
          keywords: page.keywords.join(", "),
          isAccessibleForFree: isFree,
          publisher: { "@type": "Organization", name: APP_NAME, url: base },
        }}
      />
    </div>
  );
}
