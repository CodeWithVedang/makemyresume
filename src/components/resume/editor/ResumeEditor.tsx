"use client";

import {
  ArrowLeft,
  CopyPlus,
  Download,
  Eye,
  Loader2,
  MoreVertical,
  Palette,
  PenLine,
  Printer,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { OfflineIndicator } from "@/components/layout/OfflineIndicator";
import { downloadPdf } from "@/components/resume/download-pdf";
import { UseAsBaseDialog } from "@/components/resume/ResumeDialogs";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { ShareDialog, type ShareState } from "@/components/resume/ShareDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Entitlements } from "@/lib/billing/plans";
import type { Resume, ResumeContent, TemplateId } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { recordTemplateSelectedAction } from "@/server/actions/resume";
import { getTemplateMeta } from "@/templates/registry";

import { CompletionCard } from "./CompletionCard";
import { DesignPanel } from "./DesignPanel";
import { EditorProvider, useEditor } from "./EditorContext";
import { SaveIndicator } from "./SaveIndicator";
import { SectionsPanel } from "./SectionsPanel";
import { clearDraft, readDraft, useAutosave } from "./useAutosave";

type Tab = "edit" | "preview" | "design";

export function ResumeEditor({ resume, initial, entitlements }: { resume: Resume; initial: ResumeContent; entitlements: Entitlements }) {
  return (
    <EditorProvider initial={initial}>
      <EditorShell resume={resume} entitlements={entitlements} />
    </EditorProvider>
  );
}

function EditorShell({ resume, entitlements }: { resume: Resume; entitlements: Entitlements }) {
  const { content, replace, errors, update } = useEditor();
  const autosave = useAutosave({ resumeId: resume.id, content, errors, initialRevision: resume.revision });
  const [tab, setTab] = useState<Tab>("edit");
  const [share, setShare] = useState<ShareState>({ visibility: resume.visibility, publicSlug: resume.publicSlug });
  const [dialog, setDialog] = useState<null | "share" | "base">(null);
  const [exporting, setExporting] = useState(false);
  const restoredRef = useRef(false);
  const meta = getTemplateMeta(content.templateId);

  // Recover edits that never reached the server (crash, closed tab, offline).
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const draft = readDraft(resume.id);
    if (!draft) return;
    if (JSON.stringify(draft.content) === JSON.stringify(content)) {
      clearDraft(resume.id);
      return;
    }
    if (draft.baseRevision === resume.revision) {
      replace(draft.content);
      toast.info("Restored unsaved changes from this device.");
    } else {
      toast("Unsaved changes from an older version were found on this device.", {
        duration: 15000,
        action: { label: "Restore", onClick: () => replace(draft.content) },
        cancel: { label: "Discard", onClick: () => clearDraft(resume.id) },
      });
    }
  }, [resume.id, resume.revision, content, replace]);

  const exportPdf = async () => {
    setExporting(true);
    await autosave.saveNow();
    await downloadPdf(resume.id);
    setExporting(false);
  };

  const print = async () => {
    await autosave.saveNow();
    window.open(`/resume/${resume.id}/preview?print=1`, "_blank", "noopener");
  };

  const onTemplateChange = (id: TemplateId) => {
    void recordTemplateSelectedAction(id);
    toast.success(`Switched to ${getTemplateMeta(id).name}. Your content is unchanged.`);
  };

  const preview = (
    <div className="mx-auto w-full max-w-[820px]">
      <div className="overflow-hidden rounded-sm shadow-page">
        <ScaledResume content={content} showPageGuides />
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {meta.name} · {content.settings.pageSize === "A4" ? "A4" : "US Letter"} · Dashed lines show approximate page breaks
      </p>
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Toolbar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-2 sm:h-16 sm:px-4">
        <Button asChild variant="ghost" size="icon" className="size-10" aria-label="Back to dashboard">
          <Link href="/dashboard">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <label htmlFor="resume-title" className="sr-only">
            Resume name
          </label>
          <input
            id="resume-title"
            value={content.title}
            maxLength={100}
            onChange={(e) => update((c) => ({ ...c, title: e.target.value }))}
            className="w-full max-w-sm truncate rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold hover:border-border focus-visible:border-ring focus-visible:outline-none sm:text-base"
          />
          <div className="px-2">
            <SaveIndicator status={autosave.status} message={autosave.message} onRetry={() => void autosave.saveNow()} />
          </div>
        </div>
        <OfflineIndicator />
        <Button asChild variant="ghost" className="hidden h-10 md:inline-flex">
          <Link href={`/resume/${resume.id}/preview`}>
            <Eye /> Preview
          </Link>
        </Button>
        <Button variant="ghost" className="hidden h-10 md:inline-flex" onClick={() => setDialog("share")}>
          <Share2 /> Share
        </Button>
        <Button className="h-10" onClick={() => void exportPdf()} disabled={exporting}>
          {exporting ? <Loader2 className="animate-spin" /> : <Download />}
          <span className="max-sm:sr-only">Download PDF</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-10" aria-label="More options">
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem asChild className="md:hidden">
              <Link href={`/resume/${resume.id}/preview`}>
                <Eye /> Full preview
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="md:hidden" onSelect={() => setDialog("share")}>
              <Share2 /> Share
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void print()}>
              <Printer /> Print
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { void autosave.saveNow(); setDialog("base"); }}>
              <CopyPlus /> Use as base for a new resume
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Body */}
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[minmax(360px,420px)_1fr_300px] xl:grid-cols-[440px_1fr_320px]">
        <aside
          aria-label="Resume sections"
          className={cn("h-full overflow-y-auto border-border bg-background lg:block lg:border-r", tab === "edit" ? "block" : "hidden")}
        >
          <div className="space-y-3 p-3 pb-28 sm:p-4 lg:pb-8">
            <CompletionCard />
            <SectionsPanel photoSupported={meta.supportsPhoto} />
          </div>
        </aside>

        <section
          aria-label="Live preview"
          className={cn("h-full overflow-y-auto bg-canvas lg:block", tab === "preview" ? "block" : "hidden")}
        >
          <div className="p-3 pb-28 sm:p-6 lg:p-8">{preview}</div>
        </section>

        <aside
          aria-label="Design"
          className={cn("h-full overflow-y-auto border-border bg-card lg:block lg:border-l", tab === "design" ? "block" : "hidden")}
        >
          <div className="p-4 pb-28 lg:pb-8">
            <DesignPanel entitlements={entitlements} onTemplateChange={onTemplateChange} />
          </div>
        </aside>
      </div>

      {/* Mobile / tablet tabs */}
      <nav
        aria-label="Editor views"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div role="tablist" className="mx-auto grid max-w-md grid-cols-3">
          {(
            [
              ["edit", "Edit", PenLine],
              ["preview", "Preview", Eye],
              ["design", "Design", Palette],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs transition-colors",
                tab === id ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon className={cn("size-5", tab === id && "text-brand")} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <ShareDialog
        resumeId={resume.id}
        state={share}
        open={dialog === "share"}
        onOpenChange={(o) => setDialog(o ? "share" : null)}
        onChange={setShare}
      />
      <UseAsBaseDialog
        resumeId={resume.id}
        title={content.title}
        templateId={content.templateId}
        open={dialog === "base"}
        onOpenChange={(o) => setDialog(o ? "base" : null)}
      />
    </div>
  );
}
