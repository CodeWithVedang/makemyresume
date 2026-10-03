"use client";

import { showActionError } from "@/components/billing/upgrade-toast";
import {
  Copy,
  Download,
  Globe,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Share2,
  TextCursorInput,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { AtsBadge } from "@/components/landing/AtsBadge";
import { DeleteResumeDialog, RenameResumeDialog } from "@/components/resume/ResumeDialogs";
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
import { completionPercent } from "@/lib/resume/completion";
import type { Resume } from "@/lib/resume/schema";
import { duplicateResumeAction } from "@/server/actions/resume";
import { getTemplateMeta } from "@/templates/registry";

export function formatUpdated(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function ResumeCard({
  resume,
  onRemoved,
  onUpdated,
}: {
  resume: Resume;
  onRemoved: (id: string) => void;
  onUpdated: (id: string, patch: Partial<Resume>) => void;
}) {
  const router = useRouter();
  const [dialog, setDialog] = useState<null | "rename" | "share" | "delete">(null);
  const [duplicating, startDuplicate] = useTransition();
  const template = getTemplateMeta(resume.templateId);
  const completion = completionPercent(resume);
  const editHref = `/resume/${resume.id}/edit`;

  const duplicate = () =>
    startDuplicate(async () => {
      const result = await duplicateResumeAction({ id: resume.id });
      if (!result.ok) {
        showActionError(result);
        return;
      }
      toast.success("Copy created. The original is unchanged.");
      router.push(`/resume/${result.data.id}/edit`);
    });

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-card">
      <div className="relative border-b border-border bg-canvas px-6 pt-6">
        <div className="h-44 overflow-hidden rounded-t-sm shadow-sm sm:h-52" aria-hidden="true" inert>
          <ScaledResume content={resume} clip />
        </div>
        <Link href={editHref} className="absolute inset-0 rounded-t-lg" aria-label={`Edit ${resume.title}`} />
        <div className="pointer-events-none absolute top-2.5 left-2.5 flex gap-1.5">
          {resume.isDemo ? (
            <span className="rounded-full bg-highlight-soft px-2 py-0.5 text-xs font-medium text-foreground">Demo Resume</span>
          ) : null}
          {resume.visibility !== "PRIVATE" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-xs font-medium shadow-sm">
              {resume.visibility === "PUBLIC" ? <Globe className="size-3" aria-hidden="true" /> : <Link2 className="size-3" aria-hidden="true" />}
              {resume.visibility === "PUBLIC" ? "Public" : "Unlisted"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">
              <Link href={editHref} className="hover:underline">
                {resume.title}
              </Link>
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {template.name} · Updated {formatUpdated(resume.updatedAt)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-1 size-10" aria-label={`Actions for ${resume.title}`}>
                {duplicating ? <Loader2 className="animate-spin" /> : <MoreHorizontal />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem asChild>
                <Link href={editHref}>
                  <Pencil /> Edit Resume
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={duplicate}>
                <Copy /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialog("rename")}>
                <TextCursorInput /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/api/resumes/${resume.id}/pdf`} download>
                  <Download /> Download PDF
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setDialog("share")}>
                <Share2 /> Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDialog("delete")}>
                <Trash2 /> Delete Resume
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={completion}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Resume completion"
            >
              <div className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{completion}%</span>
          </div>
          {template.atsFriendly ? <AtsBadge /> : null}
        </div>
      </div>

      <RenameResumeDialog
        resumeId={resume.id}
        title={resume.title}
        open={dialog === "rename"}
        onOpenChange={(o) => setDialog(o ? "rename" : null)}
        onRenamed={(title) => onUpdated(resume.id, { title })}
      />
      <ShareDialog
        resumeId={resume.id}
        state={{ visibility: resume.visibility, publicSlug: resume.publicSlug }}
        open={dialog === "share"}
        onOpenChange={(o) => setDialog(o ? "share" : null)}
        onChange={(next: ShareState) => onUpdated(resume.id, next)}
      />
      <DeleteResumeDialog
        resumeId={resume.id}
        title={resume.title}
        open={dialog === "delete"}
        onOpenChange={(o) => setDialog(o ? "delete" : null)}
        onDeleted={() => onRemoved(resume.id)}
      />
    </article>
  );
}
