"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { useDeferredValue, useState, type ReactNode } from "react";

import { showUpgradeToast } from "@/components/billing/upgrade-toast";
import { AtsBadge } from "@/components/landing/AtsBadge";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { Slider } from "@/components/ui/slider";
import { paidTemplateMessage, templateAllowed, type Entitlements } from "@/lib/billing/plans";
import { completionPercent } from "@/lib/resume/completion";
import { ACCENT_PRESETS, FONT_STACKS } from "@/lib/resume/page";
import { sampleForTemplate } from "@/lib/resume/samples";
import {
  dateFormats,
  fontFamilies,
  marginSizes,
  pageSizes,
  sectionSpacings,
  type ResumeSettings,
  type TemplateId,
} from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { getTemplateMeta, templates } from "@/templates/registry";

import { useEditor } from "./EditorContext";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
      {children}
    </section>
  );
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-md text-sm transition-colors",
            value === o.value ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

type TemplateFilter = "all" | "ats" | "photo" | "free";
const TEMPLATE_FILTERS: ReadonlyArray<{ value: TemplateFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "ats", label: "ATS" },
  { value: "photo", label: "Photo" },
  { value: "free", label: "Free" },
];
/** Below this completion, thumbnails use sample content so layouts are recognisable. */
const SAMPLE_THRESHOLD = 25;

export function DesignPanel({
  entitlements,
  onTemplateChange,
}: {
  entitlements: Entitlements;
  onTemplateChange?: (id: TemplateId) => void;
}) {
  const reduce = useReducedMotion();
  const { content, update } = useEditor();
  const s = content.settings;
  // Thumbnails re-render with low priority so typing stays responsive.
  const thumbContent = useDeferredValue(content);
  const set = (patch: Partial<ResumeSettings>) => update((c) => ({ ...c, settings: { ...c.settings, ...patch } }));
  const advanced = entitlements.advancedCustomization;
  const currentMeta = getTemplateMeta(content.templateId);
  const [filter, setFilter] = useState<TemplateFilter>("all");
  const useSample = completionPercent(thumbContent) < SAMPLE_THRESHOLD;
  const visibleTemplates = templates.filter((t) => {
    if (filter === "ats") return t.atsFriendly;
    if (filter === "photo") return t.supportsPhoto;
    if (filter === "free") return templateAllowed(entitlements, t.id) && entitlements.templates !== "all";
    return true;
  });

  return (
    <div className="space-y-8">
      <Group title="Template">
        <Segmented
          label="Filter templates"
          value={filter}
          options={entitlements.templates === "all" ? TEMPLATE_FILTERS.filter((f) => f.value !== "free") : TEMPLATE_FILTERS}
          onChange={setFilter}
        />
        {useSample ? (
          <p className="text-xs text-muted-foreground">Thumbnails show sample content until you add your own.</p>
        ) : null}
        <ul className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Template">
          {visibleTemplates.map((t) => {
            const selected = content.templateId === t.id;
            const allowed = templateAllowed(entitlements, t.id);
            return (
              <li key={t.id} className="relative">
                <div
                  aria-hidden="true"
                  inert
                  className={cn(
                    "overflow-hidden rounded-md border-2 transition-colors",
                    selected ? "border-primary" : "border-transparent",
                    !allowed && "opacity-60",
                  )}
                >
                  <div className="h-32 overflow-hidden bg-white">
                    <ScaledResume
                      content={
                        useSample
                          ? { ...sampleForTemplate(t.id), settings: thumbContent.settings }
                          : { ...thumbContent, templateId: t.id }
                      }
                      clip
                      lazy
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1 border-t border-border bg-card px-2 py-1.5">
                    <span className="truncate text-xs font-medium">{t.name}</span>
                    {selected ? <Check className="size-3.5 text-brand" /> : null}
                    {!allowed ? <Lock className="size-3.5 text-muted-foreground" /> : null}
                  </div>
                </div>
                <motion.button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={`${t.name} template${t.atsFriendly ? ", ATS friendly" : ""}${allowed ? "" : ", paid plan"}`}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  onClick={() => {
                    if (selected) return;
                    if (!allowed) {
                      showUpgradeToast(paidTemplateMessage(t.name));
                      return;
                    }
                    update((c) => ({ ...c, templateId: t.id }));
                    onTemplateChange?.(t.id);
                  }}
                  className="absolute inset-0 rounded-md hover:bg-foreground/5 disabled:cursor-not-allowed"
                />
              </li>
            );
          })}
        </ul>
        {currentMeta.layoutNote ? (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Layout: </span>
            {currentMeta.layoutNote} Your section order still applies within each area.
          </p>
        ) : null}
        {currentMeta.atsFriendly ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <AtsBadge /> Single column, no graphics around key text.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Styled layout. For large job portals, consider an ATS-friendly template.
          </p>
        )}
        <p className="text-xs text-muted-foreground">Switching templates never changes your content.</p>
      </Group>

      <Group title="Accent color">
        <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Accent color">
          {ACCENT_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={s.accentColor.toLowerCase() === c.value.toLowerCase()}
              aria-label={c.label}
              title={c.label}
              onClick={() => set({ accentColor: c.value })}
              className={cn(
                "flex size-9 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow",
                s.accentColor.toLowerCase() === c.value.toLowerCase() && "ring-2 ring-foreground",
              )}
              style={{ backgroundColor: c.value }}
            >
              {s.accentColor.toLowerCase() === c.value.toLowerCase() ? <Check className="size-4 text-white" aria-hidden="true" /> : null}
            </button>
          ))}
          <label className={cn("relative flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-input", !advanced && "pointer-events-none opacity-50")}>
            <span className="sr-only">Custom color</span>
            <input
              type="color"
              value={s.accentColor}
              disabled={!advanced}
              onChange={(e) => set({ accentColor: e.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              +
            </span>
          </label>
        </div>
      </Group>

      <Group title="Typography">
        <label className="block text-sm font-medium" htmlFor="font-family">
          Font
        </label>
        <select
          id="font-family"
          value={s.fontFamily}
          onChange={(e) => set({ fontFamily: e.target.value as ResumeSettings["fontFamily"] })}
          className="h-10 w-full rounded-md border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30"
        >
          {fontFamilies.map((f) => (
            <option key={f} value={f}>
              {FONT_STACKS[f].label}
            </option>
          ))}
        </select>
        <SliderRow label="Font size" value={s.fontSize} min={9} max={12} step={0.5} format={(v) => `${v} pt`} onChange={(v) => set({ fontSize: v })} />
        <SliderRow label="Line height" value={s.lineHeight} min={1.2} max={1.7} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => set({ lineHeight: Math.round(v * 100) / 100 })} />
      </Group>

      <Group title="Spacing">
        <p className="text-sm font-medium">Section spacing</p>
        <Segmented label="Section spacing" value={s.sectionSpacing} options={sectionSpacings.map((v) => ({ value: v, label: cap(v) }))} onChange={(v) => set({ sectionSpacing: v })} />
        <p className="text-sm font-medium">Page margins</p>
        <Segmented label="Page margins" value={s.margins} options={marginSizes.map((v) => ({ value: v, label: cap(v) }))} onChange={(v) => set({ margins: v })} />
      </Group>

      <Group title="Format">
        <label className="block text-sm font-medium" htmlFor="date-format">
          Date format
        </label>
        <select
          id="date-format"
          value={s.dateFormat}
          onChange={(e) => set({ dateFormat: e.target.value as ResumeSettings["dateFormat"] })}
          className="h-10 w-full rounded-md border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30"
        >
          {dateFormats.map((f) => (
            <option key={f} value={f}>
              {{ "MMM YYYY": "Mar 2024", "MMMM YYYY": "March 2024", "MM/YYYY": "03/2024", YYYY: "2024" }[f]}
            </option>
          ))}
        </select>
        <p className="text-sm font-medium">Page size</p>
        <Segmented label="Page size" value={s.pageSize} options={pageSizes.map((v) => ({ value: v, label: v === "A4" ? "A4" : "US Letter" }))} onChange={(v) => set({ pageSize: v })} />
      </Group>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">{format(value)}</span>
      </div>
      <Slider aria-label={label} value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
