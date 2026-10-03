import {
  ArrowRight,
  CloudCheck,
  FileDown,
  FileUp,
  GraduationCap,
  LayoutTemplate,
  Link2,
  PenLine,
  Smartphone,
  SwatchBook,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PricingPlans } from "@/components/billing/PricingPlans";
import { CountUp } from "@/components/landing/CountUp";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { Reveal } from "@/components/landing/Reveal";
import { RoleMarquee } from "@/components/landing/RoleMarquee";
import { RotatingWord } from "@/components/landing/RotatingWord";
import { TemplateGallery } from "@/components/landing/TemplateGallery";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";
import { LANDING_FAQ } from "@/lib/content/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const STEPS = [
  {
    title: "Add your details",
    body: "Start from scratch or import your current resume from PDF or Word. You review every imported field.",
  },
  {
    title: "Pick a template",
    body: "Switch between five designs anytime. Your content stays exactly as you wrote it.",
  },
  {
    title: "Download & apply",
    body: "Get a clean PDF for Naukri, LinkedIn or company portals, or share a link with recruiters.",
  },
];

const FEATURES = [
  { icon: PenLine, title: "Live preview", body: "Every keystroke updates the page instantly. What you see is what recruiters get." },
  { icon: CloudCheck, title: "Autosave", body: "Work is saved as you type and kept on your phone even if the network drops." },
  { icon: FileUp, title: "Import PDF or Word", body: "Bring your old resume. We lay out what we find for you to check and fix." },
  { icon: LayoutTemplate, title: "Switch templates freely", body: "Templates change only the design, never your content." },
  { icon: SwatchBook, title: "Your style", body: "Fonts, spacing, margins and accent colors, with limits that keep it professional." },
  { icon: FileDown, title: "Print-ready PDF", body: "A4 or Letter, proper page breaks, clickable links and selectable text." },
  { icon: Link2, title: "Shareable link", body: "Send a resume link on WhatsApp or email and turn it off anytime." },
  { icon: Smartphone, title: "Made for mobile", body: "Build your whole resume on your phone, one-handed, even on slow data." },
];

const STATS = [
  { value: 5, suffix: "", label: "professional templates" },
  { value: 0, prefix: "₹", suffix: "", label: "to make your first resume" },
  { value: 10, suffix: " min", label: "to a finished PDF" },
  { value: 100, suffix: "%", label: "your own words" },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pt-10 pb-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pt-20 lg:pb-24">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm font-medium text-brand">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              Free resume maker for India
            </p>
            <h1 className="mt-5 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Make a resume that gets you <span className="ink-underline">noticed</span>.
            </h1>
            <p className="mt-4 text-xl font-medium text-foreground/80 sm:text-2xl">
              Built for <RotatingWord words={["freshers", "developers", "MBA grads", "designers", "career switchers"]} />
            </p>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Create an ATS-friendly resume in minutes using your own experience, skills and achievements. Live
              preview, five templates and instant PDF download.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="shine h-12 px-6 text-base">
                <Link href="/signup">
                  Create My Resume, Free
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 bg-card px-6 text-base">
                <Link href="/signup?next=import">
                  <FileUp /> Import Existing Resume
                </Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">No credit card · First resume free forever · Your words, never rewritten</p>
          </Reveal>
          <Reveal delay={0.12} className="lg:pl-6">
            <HeroPreview />
          </Reveal>
        </div>
        <div className="relative pb-8">
          <RoleMarquee />
        </div>
      </section>

      {/* Stats */}
      <section aria-label="At a glance" className="border-b border-border bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 py-10 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.06} className="text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
                  <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">{s.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="text-sm font-semibold text-brand">How it works</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">From blank page to PDF in three steps</h2>
        </Reveal>
        <ol className="relative mt-12 grid gap-10 md:grid-cols-3">
          <span aria-hidden="true" className="absolute top-5 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-brand/0 via-brand/40 to-brand/0 md:block" />
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.12}>
              <li className="relative text-center md:px-4">
                <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-8 ring-background">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-muted-foreground">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Templates */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <Reveal>
              <p className="text-sm font-semibold text-brand">Templates</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Designs recruiters actually read</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Distinct layouts and typography, not one design in five colors. Three are built specifically for
                applicant tracking systems used by job portals.
              </p>
            </Reveal>
            <Button asChild variant="ghost" className="h-10 self-start sm:self-auto">
              <Link href="/templates">
                All templates <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          </div>
          <div className="mt-10">
            <TemplateGallery limit={3} showFilters={false} />
          </div>
        </div>
      </section>

      {/* Made for India */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center">
        <Reveal>
          <p className="text-sm font-semibold text-brand">Made for Indian job seekers</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">From campus placements to your next switch</h2>
          <p className="mt-4 text-muted-foreground">
            Whether it&apos;s your first job through campus placement, an internship, or a move to a product company,
            {` ${APP_NAME}`} gives you a clean, professional format that works on Naukri, LinkedIn, Indeed and company
            career portals.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              ["Freshers first", "Put education, CGPA and projects at the top with one tap."],
              ["One-page ready", "Spacing and margin controls help you fit everything on one page."],
              ["Works on any phone", "Fast, lightweight and installable like an app."],
              ["Fair pricing in ₹", "Free to start. One-time plans from ₹99, never auto-renewed."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-xl border border-border bg-card p-4 transition-transform hover:-translate-y-1">
                <GraduationCap className="size-5 text-brand" aria-hidden="true" />
                <p className="mt-3 font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <p className="text-sm font-semibold text-brand">Features</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">
              Everything you need to finish, nothing that writes for you
            </h2>
          </Reveal>
          <dl className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 4) * 0.06}>
                <div className="group">
                  <dt className="flex items-center gap-2.5 font-semibold">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-brand transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      <f.icon className="size-4.5" aria-hidden="true" />
                    </span>
                    {f.title}
                  </dt>
                  <dd className="mt-2 text-sm text-muted-foreground">{f.body}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative overflow-hidden border-t border-border">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-brand">Pricing</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-4xl">Free to start. Cheaper than a chai a week.</h2>
            <p className="mt-3 text-muted-foreground">One resume free forever. Paid plans are one-time payments in ₹.</p>
          </Reveal>
          <div className="mt-14">
            <PricingPlans requester={null} />
          </div>
        </div>
      </section>

      {/* Principle */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
          <Reveal>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">Your words. Your achievements.</h2>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              We don&apos;t generate summaries, invent numbers or suggest skills you don&apos;t have. Recruiters read
              what you actually did, formatted so they can find it fast.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ul className="space-y-3 text-primary-foreground/90">
              {[
                "No AI rewriting of your content",
                "Imported text is shown for review, never silently changed",
                "No fake “guaranteed ATS score” claims",
                "Download or delete your data anytime",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <Reveal>
          <h2 id="faq" className="text-center text-2xl font-semibold tracking-tight sm:text-4xl">
            Questions, answered
          </h2>
        </Reveal>
        <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
          {LANDING_FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                <h3 className="text-base">{f.q}</h3>
                <span className="text-xl leading-none text-muted-foreground transition-transform duration-300 group-open:rotate-45" aria-hidden="true">
                  +
                </span>
              </summary>
              <p className="mt-3 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          More tips in our{" "}
          <Link href="/guides" className="font-medium text-brand hover:underline">
            resume guides
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <div aria-hidden="true" className="hero-glow pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 text-center sm:px-6">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Your next opportunity starts here.</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Start from scratch or bring your existing resume. It takes about ten minutes.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="shine h-12 px-6 text-base">
                <Link href="/signup">Create My Resume, Free</Link>
              </Button>
              <Button asChild variant="outline" className="h-12 bg-card px-6 text-base">
                <Link href="/signup?next=import">Import Existing Resume</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: LANDING_FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
