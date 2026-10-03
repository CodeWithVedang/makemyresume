"use client";

import { showUpgradeToast } from "@/components/billing/upgrade-toast";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, Copy, FilePlus2, FileUp, Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";

import { Field } from "@/components/forms/Field";
import { AtsBadge } from "@/components/landing/AtsBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ImportResult } from "@/lib/import/parse-resume";
import type { TemplateId } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { createResumeAction, duplicateResumeAction } from "@/server/actions/resume";
import { templates } from "@/templates/registry";

import { ImportReview } from "./import/ImportReview";
import { ImportUploader } from "./import/ImportUploader";

type Mode = "choose" | "scratch" | "import" | "base";
type ExistingResume = { id: string; title: string; templateId: TemplateId; updatedAt: string };

function TemplatePicker({
  value,
  onChange,
  locked,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
  locked: readonly TemplateId[];
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Template</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {templates.map((t) => (
          <label
            key={t.id}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
              value === t.id ? "border-primary bg-secondary" : "border-border bg-card hover:bg-muted",
            )}
          >
            <input type="radio" name="template" className="sr-only" checked={value === t.id} onChange={() => {
                if (locked.includes(t.id)) {
                  showUpgradeToast(t.name + " is part of the paid plans, from ₹99. Free includes Classic, Modern and Minimal.");
                  return;
                }
                onChange(t.id);
              }}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium">
                {t.name}
                {t.atsFriendly ? <AtsBadge /> : null}
                {locked.includes(t.id) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-highlight-soft px-2 py-0.5 text-xs font-medium">
                    <Lock className="size-3" aria-hidden="true" /> Paid
                  </span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{t.style}</span>
            </span>
            {value === t.id ? <Check className="size-4 text-brand" aria-hidden="true" /> : null}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">You can switch templates at any time without losing content.</p>
    </fieldset>
  );
}

export function NewResumeFlow({
  initialMode,
  initialTemplate,
  existing,
  lockedTemplates,
}: {
  initialMode: Mode;
  initialTemplate: TemplateId;
  existing: ExistingResume[];
  lockedTemplates: readonly TemplateId[];
}) {
  const reduce = useReducedMotion();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [title, setTitle] = useState("My Resume");
  const [templateId, setTemplateId] = useState<TemplateId>(initialTemplate);
  const [baseId, setBaseId] = useState(existing[0]?.id ?? "");
  const [error, setError] = useState<string | undefined>();
  const [parsed, setParsed] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  const go = (next: Mode) => {
    setError(undefined);
    setMode(next);
    const url = next === "choose" ? "/resume/new" : `/resume/new?mode=${next}`;
    window.history.replaceState(null, "", url);
  };

  const createFromScratch = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Resume name is required.");
    startTransition(async () => {
      const result = await createResumeAction({ title, templateId, source: "scratch" });
      if (!result.ok) {
        if (result.code === "limit") showUpgradeToast(result.error);
        return setError(result.error);
      }
      router.push(`/resume/${result.data.id}/edit`);
    });
  };

  const createFromBase = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Resume name is required.");
    if (!baseId) return setError("Choose a resume to start from.");
    startTransition(async () => {
      const result = await duplicateResumeAction({ id: baseId, title, templateId });
      if (!result.ok) {
        if (result.code === "limit") showUpgradeToast(result.error);
        return setError(result.error);
      }
      toast.success("New resume created. The original is unchanged.");
      router.push(`/resume/${result.data.id}/edit`);
    });
  };

  const motionProps = reduce
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.22 } };

  return (
    <div className={cn("mx-auto px-4 py-8 sm:px-6 sm:py-12", parsed ? "max-w-6xl" : "max-w-3xl")}>
      {mode !== "choose" ? (
        <Button variant="ghost" className="-ml-3 mb-4 h-10" onClick={() => (parsed ? setParsed(null) : go("choose"))}>
          <ArrowLeft /> Back
        </Button>
      ) : null}

      <AnimatePresence mode="wait" initial={false}>
        {mode === "choose" ? (
          <motion.div key="choose" {...motionProps}>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create a resume</h1>
            <p className="mt-2 text-muted-foreground">How would you like to start?</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { id: "scratch" as const, icon: FilePlus2, title: "Start From Scratch", body: "Fill in structured sections and watch your resume take shape." },
                { id: "import" as const, icon: FileUp, title: "Import Existing Resume", body: "Upload a PDF or DOCX. We'll lay out what we find for you to review." },
              ].map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => go(o.id)}
                  className="group flex flex-col items-start rounded-lg border border-border bg-card p-6 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-card"
                >
                  <span className="flex size-11 items-center justify-center rounded-md bg-secondary text-brand">
                    <o.icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="mt-4 text-lg font-semibold">{o.title}</span>
                  <span className="mt-1 text-sm text-muted-foreground">{o.body}</span>
                </button>
              ))}
            </div>
            {existing.length ? (
              <button
                type="button"
                onClick={() => go("base")}
                className="mt-4 flex w-full items-center gap-4 rounded-lg border border-dashed border-border p-4 text-left hover:bg-card"
              >
                <Copy className="size-5 shrink-0 text-brand" aria-hidden="true" />
                <span>
                  <span className="block font-medium">Use an existing resume as a base</span>
                  <span className="block text-sm text-muted-foreground">Copy your content into a new resume for a different role.</span>
                </span>
              </button>
            ) : null}
          </motion.div>
        ) : null}

        {mode === "scratch" ? (
          <motion.form key="scratch" {...motionProps} onSubmit={createFromScratch} noValidate className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Start from scratch</h1>
              <p className="mt-1 text-muted-foreground">Name your resume and pick a starting template.</p>
            </div>
            <Field label="Resume name" hint="Only you see this, e.g. “Frontend roles 2026”." error={error}>
              {(p) => <Input {...p} value={title} maxLength={100} className="h-11" onChange={(e) => setTitle(e.target.value)} />}
            </Field>
            <TemplatePicker value={templateId} onChange={setTemplateId} locked={lockedTemplates} />
            <Button type="submit" className="h-12 w-full text-base sm:w-auto sm:px-6" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Resume
            </Button>
          </motion.form>
        ) : null}

        {mode === "base" ? (
          <motion.form key="base" {...motionProps} onSubmit={createFromBase} noValidate className="space-y-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Use an existing resume</h1>
              <p className="mt-1 text-muted-foreground">We copy the content into a new resume. The original stays untouched.</p>
            </div>
            <Field label="Start from">
              {(p) => (
                <select
                  {...p}
                  value={baseId}
                  onChange={(e) => setBaseId(e.target.value)}
                  className="h-11 rounded-md border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30"
                >
                  {existing.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="New resume name" error={error}>
              {(p) => <Input {...p} value={title} maxLength={100} className="h-11" onChange={(e) => setTitle(e.target.value)} />}
            </Field>
            <TemplatePicker value={templateId} onChange={setTemplateId} locked={lockedTemplates} />
            <Button type="submit" className="h-12 w-full text-base sm:w-auto sm:px-6" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Resume
            </Button>
          </motion.form>
        ) : null}

        {mode === "import" ? (
          <motion.div key={parsed ? "review" : "import"} {...motionProps}>
            {parsed ? (
              <>
                <h1 className="mb-4 text-2xl font-semibold tracking-tight">Review your imported resume</h1>
                <ImportReview result={parsed} lockedTemplates={lockedTemplates} onRestart={() => setParsed(null)} />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-semibold tracking-tight">Import existing resume</h1>
                <p className="mt-1 mb-6 text-muted-foreground">We&apos;ll read your file and show you everything we extracted.</p>
                <ImportUploader onParsed={(r) => setParsed({ ...r, content: { ...r.content, templateId } })} />
              </>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
