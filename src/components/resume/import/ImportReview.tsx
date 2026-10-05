"use client";

import { showActionError, showUpgradeToast } from "@/components/billing/upgrade-toast";
import { AlertTriangle, CheckCircle2, CircleDashed, Eye, Loader2, PenLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AtsBadge } from "@/components/landing/AtsBadge";
import { EditorProvider, useEditor } from "@/components/resume/editor/EditorContext";
import { SectionsPanel } from "@/components/resume/editor/SectionsPanel";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { Button } from "@/components/ui/button";
import { paidTemplateMessage } from "@/lib/billing/plans";
import type { ImportReportItem, ImportResult } from "@/lib/import/parse-resume";
import type { TemplateId } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { createResumeAction } from "@/server/actions/resume";
import { templates } from "@/templates/registry";

const STATUS = {
  found: { icon: CheckCircle2, label: "Found", tone: "text-success" },
  review: { icon: AlertTriangle, label: "Review", tone: "text-warning" },
  missing: { icon: CircleDashed, label: "Not found", tone: "text-muted-foreground" },
} as const;

function Report({ items }: { items: ImportReportItem[] }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {items.map((item) => {
        const s = STATUS[item.status];
        return (
          <li key={item.key} className="flex items-start gap-3 px-3 py-2.5">
            <s.icon className={cn("mt-0.5 size-4 shrink-0", s.tone)} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              {item.note ? <p className="text-xs text-muted-foreground">{item.note}</p> : null}
            </div>
            <span className={cn("text-xs font-medium", s.tone)}>{s.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function ImportReview({
  result,
  onRestart,
  lockedTemplates,
}: {
  result: ImportResult;
  onRestart: () => void;
  lockedTemplates: readonly TemplateId[];
}) {
  return (
    <EditorProvider initial={result.content}>
      <ReviewBody report={result.report} onRestart={onRestart} locked={lockedTemplates} />
    </EditorProvider>
  );
}

function ReviewBody({
  report,
  onRestart,
  locked,
}: {
  report: ImportReportItem[];
  onRestart: () => void;
  locked: readonly TemplateId[];
}) {
  const router = useRouter();
  const { content, update, errors } = useEditor();
  const [view, setView] = useState<"review" | "preview">("review");
  const [pending, startTransition] = useTransition();
  const errorCount = Object.keys(errors).length;

  const save = () =>
    startTransition(async () => {
      const result = await createResumeAction({ content, source: "import" });
      if (!result.ok) {
        showActionError(result);
        return;
      }
      toast.success("Imported resume saved.");
      router.push(`/resume/${result.data.id}/edit`);
    });

  return (
    <div className="pb-32 lg:pb-10">
      <div role="note" className="mb-6 flex gap-3 rounded-lg border border-warning/30 bg-warning-soft p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
        <div>
          <p className="font-medium">Review imported information before continuing.</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Automatic reading isn&apos;t perfect. Check each section, fix anything that looks wrong, then save.
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1 lg:hidden" role="tablist" aria-label="Review views">
        {(
          [
            ["review", "Review", PenLine],
            ["preview", "Preview", Eye],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn("flex h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm", view === id ? "bg-card font-medium shadow-sm" : "text-muted-foreground")}
          >
            <Icon className="size-4" aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className={cn("space-y-6", view === "review" ? "block" : "hidden lg:block")}>
          <section aria-labelledby="extracted-title">
            <h2 id="extracted-title" className="mb-3 text-sm font-semibold">
              What we found
            </h2>
            <Report items={report} />
          </section>
          <section aria-labelledby="edit-title">
            <h2 id="edit-title" className="mb-3 text-sm font-semibold">
              Edit extracted information
            </h2>
            <SectionsPanel photoSupported={false} initialOpen="personal" />
          </section>
        </div>

        <div className={cn(view === "preview" ? "block" : "hidden lg:block")}>
          <div className="space-y-4 lg:sticky lg:top-24">
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Choose a template</legend>
              <div className="flex flex-wrap gap-1.5">
                {templates.map((t) => (
                  <label
                    key={t.id}
                    className={cn(
                      "flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
                      content.templateId === t.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="template"
                      className="sr-only"
                      checked={content.templateId === t.id}
                      onChange={() => {
                        if (locked.includes(t.id)) {
                          showUpgradeToast(paidTemplateMessage(t.name));
                          return;
                        }
                        update((c) => ({ ...c, templateId: t.id }));
                      }}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
              {templates.find((t) => t.id === content.templateId)?.atsFriendly ? <AtsBadge className="mt-2" /> : null}
            </fieldset>
            <div className="overflow-hidden rounded-sm shadow-page">
              <ScaledResume content={content} showPageGuides />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:static lg:mt-8 lg:border-0 lg:bg-transparent lg:p-0">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <Button type="button" variant="ghost" className="h-11" onClick={onRestart} disabled={pending}>
            Start over
          </Button>
          <p className="hidden flex-1 text-sm text-muted-foreground sm:block">
            {errorCount ? `${errorCount} field${errorCount === 1 ? "" : "s"} need${errorCount === 1 ? "s" : ""} attention before saving.` : "Your original file is not changed."}
          </p>
          <Button type="button" className="ml-auto h-11 px-5" onClick={save} disabled={pending || errorCount > 0}>
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Save Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
