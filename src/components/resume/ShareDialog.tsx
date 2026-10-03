"use client";

import { showActionError } from "@/components/billing/upgrade-toast";
import { Check, Copy, ExternalLink, Globe, Link2, Loader2, Lock } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Visibility } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { setVisibilityAction } from "@/server/actions/resume";

const OPTIONS: Array<{ value: Visibility; label: string; body: string; icon: typeof Lock }> = [
  { value: "PRIVATE", label: "Private", body: "Only you can see this resume.", icon: Lock },
  { value: "UNLISTED", label: "Unlisted", body: "Anyone with the link can view it. Hidden from search engines.", icon: Link2 },
  { value: "PUBLIC", label: "Public", body: "Anyone with the link can view it, and search engines may index it.", icon: Globe },
];

export type ShareState = { visibility: Visibility; publicSlug: string | null };

export function ShareDialog({
  resumeId,
  state,
  open,
  onOpenChange,
  onChange,
}: {
  resumeId: string;
  state: ShareState;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (next: ShareState) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const url =
    state.publicSlug && typeof window !== "undefined" ? `${window.location.origin}/r/${state.publicSlug}` : "";
  const shared = state.visibility !== "PRIVATE" && Boolean(url);

  const update = (visibility: Visibility) =>
    startTransition(async () => {
      const result = await setVisibilityAction(resumeId, visibility);
      if (!result.ok) {
        showActionError(result);
        return;
      }
      onChange(result.data);
      toast.success(visibility === "PRIVATE" ? "Link disabled. Your resume is private." : "Sharing updated.");
    });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy automatically. Select the link and copy it.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share resume</DialogTitle>
          <DialogDescription>Choose who can view this resume online.</DialogDescription>
        </DialogHeader>

        <fieldset disabled={pending} className="space-y-2">
          <legend className="sr-only">Visibility</legend>
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className={cn(
                "flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring",
                state.visibility === o.value ? "border-primary bg-secondary" : "border-border hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name="visibility"
                value={o.value}
                checked={state.visibility === o.value}
                onChange={() => update(o.value)}
                className="sr-only"
              />
              <o.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>
                <span className="block text-sm font-medium">{o.label}</span>
                <span className="block text-xs text-muted-foreground">{o.body}</span>
              </span>
              {pending && state.visibility !== o.value ? null : state.visibility === o.value ? (
                <Check className="ml-auto size-4 text-brand" aria-hidden="true" />
              ) : null}
            </label>
          ))}
        </fieldset>

        {pending ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Updating…
          </p>
        ) : null}

        {shared ? (
          <div className="space-y-3 rounded-lg bg-muted p-3">
            <p className="text-sm">Anyone with this link can view your resume.</p>
            <div className="flex gap-2">
              <Input readOnly value={url} aria-label="Resume link" className="h-10 bg-background" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="outline" className="h-10" onClick={copy}>
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="ghost" className="h-9">
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink /> Open
                </a>
              </Button>
              <Button type="button" variant="destructive" className="h-9" disabled={pending} onClick={() => update("PRIVATE")}>
                Disable Link
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
