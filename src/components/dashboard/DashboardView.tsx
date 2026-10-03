"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Crown, FilePlus2, FileUp, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ScaledResume } from "@/components/resume/ScaledResume";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sampleSoftwareEngineer } from "@/lib/resume/samples";
import type { Resume } from "@/lib/resume/schema";
import { templates } from "@/templates/registry";

import { ResumeCard } from "./ResumeCard";

type Sort = "recent" | "name";
type VisibilityFilter = "all" | "private" | "shared";

export type PlanSummary = {
  name: string;
  isFree: boolean;
  resumes: number;
  maxResumes: number | null;
  links: number;
  maxLinks: number | null;
};

function PlanStrip({ plan }: { plan: PlanSummary }) {
  const full = plan.maxResumes !== null && plan.resumes >= plan.maxResumes;
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-lg bg-highlight-soft text-highlight">
          <Crown className="size-4.5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">{plan.name} plan</p>
          <p className="text-xs text-muted-foreground">
            {plan.resumes}/{plan.maxResumes ?? "∞"} resumes · {plan.links}/{plan.maxLinks ?? "∞"} share links used
          </p>
        </div>
      </div>
      {plan.isFree ? (
        <div className="flex items-center gap-3 sm:ml-auto">
          <p className="hidden text-sm text-muted-foreground lg:block">
            {full ? "Tailor a resume for every role you apply to." : "Need more resumes or templates?"}
          </p>
          <Button asChild className="shine h-10 w-full sm:w-auto">
            <Link href="/settings/billing">
              <Sparkles /> Upgrade from ₹99
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardView({
  firstName,
  initialResumes,
  plan,
}: {
  firstName: string;
  initialResumes: Resume[];
  plan: PlanSummary;
}) {
  const reduce = useReducedMotion();
  const [resumes, setResumes] = useState(initialResumes);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [template, setTemplate] = useState("all");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resumes
      .filter((r) => !q || r.title.toLowerCase().includes(q) || r.personalInfo.fullName.toLowerCase().includes(q))
      .filter((r) => template === "all" || r.templateId === template)
      .filter((r) =>
        visibility === "all" ? true : visibility === "private" ? r.visibility === "PRIVATE" : r.visibility !== "PRIVATE",
      )
      .sort((a, b) => (sort === "name" ? a.title.localeCompare(b.title) : b.updatedAt.localeCompare(a.updatedAt)));
  }, [resumes, query, sort, template, visibility]);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  })();

  if (resumes.length === 0) return <EmptyDashboard firstName={firstName} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" suppressHydrationWarning>
            {greeting}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="h-11 flex-1 sm:flex-none">
            <Link href="/resume/new?mode=import">
              <FileUp /> Import Resume
            </Link>
          </Button>
          <Button asChild className="h-11 flex-1 sm:flex-none">
            <Link href="/resume/new">
              <FilePlus2 /> Create Resume
            </Link>
          </Button>
        </div>
      </div>

      <PlanStrip plan={plan} />

      <div className="mt-8 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resumes"
            aria-label="Search resumes"
            className="h-10 pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 md:ml-auto md:flex">
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="col-span-2 h-10 w-full md:w-44" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently updated</SelectItem>
              <SelectItem value="name">Name</SelectItem>
            </SelectContent>
          </Select>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger className="h-10 w-full min-w-0 md:w-36" aria-label="Template">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All templates</SelectItem>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={visibility} onValueChange={(v) => setVisibility(v as VisibilityFilter)}>
            <SelectTrigger className="h-10 w-full min-w-0 md:w-32" aria-label="Visibility">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any access</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-border px-6 py-14 text-center">
          <p className="font-medium">No resumes match your filters</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => {
              setQuery("");
              setTemplate("all");
              setVisibility("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 [&>li]:min-w-0">
          <AnimatePresence initial={false}>
            {filtered.map((resume) => (
              <motion.li
                key={resume.id}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <ResumeCard
                  resume={resume}
                  onRemoved={(id) => setResumes((list) => list.filter((r) => r.id !== id))}
                  onUpdated={(id, patch) => setResumes((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)))}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function EmptyDashboard({ firstName }: { firstName: string }) {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-12 sm:px-6 md:grid-cols-2 md:py-20">
      <div>
        <p className="text-sm font-medium text-brand">Welcome{firstName ? `, ${firstName}` : ""}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Your next opportunity starts here.</h1>
        <p className="mt-3 text-muted-foreground">
          Start with a blank resume or import the one you already have. You can change templates at any time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 px-5 text-base">
            <Link href="/resume/new">
              <FilePlus2 /> Create Resume
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-5 text-base">
            <Link href="/resume/new?mode=import">
              <FileUp /> Import Existing Resume
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative mx-auto w-full max-w-sm" aria-hidden="true">
        <div className="absolute inset-0 translate-x-4 translate-y-4 rounded-md bg-highlight-soft" />
        <div className="relative overflow-hidden rounded-md shadow-page">
          <ScaledResume content={sampleSoftwareEngineer} clip />
        </div>
      </div>
    </div>
  );
}
