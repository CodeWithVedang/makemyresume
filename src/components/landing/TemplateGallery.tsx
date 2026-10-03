"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { ScaledResume } from "@/components/resume/ScaledResume";
import { Button } from "@/components/ui/button";
import { sampleDesigner, sampleMarketer, sampleSoftwareEngineer } from "@/lib/resume/samples";
import type { ResumeContent, TemplateId } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { templates, type TemplateCategory } from "@/templates/registry";

import { AtsBadge } from "./AtsBadge";

const SAMPLE_FOR: Record<TemplateId, ResumeContent> = {
  classic: sampleSoftwareEngineer,
  modern: sampleSoftwareEngineer,
  minimal: sampleSoftwareEngineer,
  executive: sampleMarketer,
  creative: sampleDesigner,
};

const FILTERS: Array<"All" | TemplateCategory> = [
  "All",
  "ATS",
  "Modern",
  "Professional",
  "Minimal",
  "Executive",
  "Creative",
  "Fresher",
  "Developer",
];

export function TemplateGallery({ limit, showFilters = true }: { limit?: number; showFilters?: boolean }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const list = templates.filter((t) => filter === "All" || t.categories.includes(filter)).slice(0, limit);

  return (
    <div>
      {showFilters ? (
        <div className="-mx-4 mb-6 overflow-x-auto px-4 pb-1" role="toolbar" aria-label="Filter templates">
          <div className="flex w-max gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
                className={cn(
                  "h-9 rounded-full border px-3.5 text-sm transition-colors",
                  filter === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <li key={t.id}>
            <motion.article
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ duration: 0.18 }}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card"
            >
              <div className="border-b border-border bg-canvas p-5">
                <div className="overflow-hidden rounded-sm shadow-card">
                  <ScaledResume content={{ ...SAMPLE_FOR[t.id], templateId: t.id }} clip />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.style}</p>
                  </div>
                  {t.atsFriendly ? <AtsBadge /> : null}
                </div>
                <p className="text-sm text-muted-foreground">{t.description}</p>
                <Button asChild variant="outline" className="mt-auto h-10">
                  <Link href={`/signup?template=${t.id}`} aria-label={`Use the ${t.name} template`}>
                    Use this template
                  </Link>
                </Button>
              </div>
            </motion.article>
          </li>
        ))}
      </ul>
      {list.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">No templates in this category yet.</p>
      ) : null}
    </div>
  );
}
