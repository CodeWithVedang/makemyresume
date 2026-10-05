"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import { ScaledResume } from "@/components/resume/ScaledResume";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sampleSoftwareEngineer } from "@/lib/resume/samples";
import type { TemplateId } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { templates } from "@/templates/registry";

/**
 * Interactive hero: visitors can switch templates and edit the title to see
 * the live preview update. Auto-advances through templates once, then stops.
 */
export function HeroPreview() {
  const reduce = useReducedMotion();
  const [templateId, setTemplateId] = useState<TemplateId>("modern");
  const [title, setTitle] = useState(sampleSoftwareEngineer.personalInfo.professionalTitle);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || reduce) return;
    const order = templates.map((t) => t.id).filter((id) => id !== "modern");
    let index = -1;
    const timer = window.setInterval(() => {
      index += 1;
      if (index >= order.length) {
        window.clearInterval(timer);
        setTemplateId("modern");
        setAutoplay(false);
        return;
      }
      setTemplateId(order[index]);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [autoplay, reduce]);

  const content = {
    ...sampleSoftwareEngineer,
    templateId,
    personalInfo: { ...sampleSoftwareEngineer.personalInfo, professionalTitle: title },
  };

  return (
    <div className="relative">
      <div
        className="-mx-4 mb-3 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
        role="radiogroup"
        aria-label="Preview template"
      >
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={templateId === t.id}
            onClick={() => {
              setAutoplay(false);
              setTemplateId(t.id);
            }}
            className={cn(
              "h-9 shrink-0 rounded-full border px-3.5 text-sm transition-colors",
              templateId === t.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="relative max-h-[420px] overflow-hidden rounded-lg border border-border shadow-page sm:max-h-[560px]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-white to-transparent" />
        <span className="absolute top-3 right-3 z-10 rounded-full bg-foreground/80 px-2.5 py-1 text-[11px] font-medium text-background">
          Sample resume
        </span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={templateId}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ScaledResume content={content} clip />
          </motion.div>
        </AnimatePresence>
      </div>

      <div aria-hidden="true" className="pointer-events-none hidden lg:block">
        <span className="float-slow absolute top-24 -right-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-card">
          <span className="size-2 rounded-full bg-success" /> ATS friendly
        </span>
        <span className="float-slower absolute top-1/2 -right-10 z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-card">
          <span className="size-2 rounded-full bg-brand" /> Saved just now
        </span>
        <span className="float-slow absolute right-10 -bottom-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-card">
          PDF ready · 1 page
        </span>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4 shadow-card lg:absolute lg:z-20 lg:-bottom-8 lg:-left-12 lg:mt-0 lg:w-72">
        <Label htmlFor="hero-title" className="text-xs text-muted-foreground">
          Try it: edit the professional title
        </Label>
        <Input
          id="hero-title"
          value={title}
          maxLength={60}
          onChange={(e) => {
            setAutoplay(false);
            setTitle(e.target.value);
          }}
          className="mt-1.5 h-10"
        />
      </div>
    </div>
  );
}
