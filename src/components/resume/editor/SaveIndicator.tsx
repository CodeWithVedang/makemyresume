"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, CloudOff, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import type { SaveStatus } from "./useAutosave";

const LABELS: Record<SaveStatus, string> = {
  saved: "Saved",
  dirty: "Unsaved changes",
  saving: "Saving…",
  error: "Save failed",
  offline: "Offline — saved on this device",
  invalid: "Not saved",
  conflict: "Newer version elsewhere",
};

export function SaveIndicator({
  status,
  message,
  onRetry,
}: {
  status: SaveStatus;
  message: string | null;
  onRetry: () => void;
}) {
  const reduce = useReducedMotion();
  const tone =
    status === "saved"
      ? "text-success"
      : status === "error" || status === "conflict" || status === "invalid"
        ? "text-destructive"
        : status === "offline"
          ? "text-warning"
          : "text-muted-foreground";
  const Icon =
    status === "saving" || status === "dirty"
      ? Loader2
      : status === "saved"
        ? CheckCircle2
        : status === "offline"
          ? CloudOff
          : AlertCircle;

  const body = (
    <span role="status" aria-live="polite" className={cn("inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap", tone)}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={reduce ? false : { opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -3 }}
          transition={{ duration: 0.16 }}
          className="inline-flex items-center gap-1.5"
        >
          <Icon className={cn("size-3.5", status === "saving" && "animate-spin", status === "dirty" && "opacity-0")} aria-hidden="true" />
          <span className={cn(status === "offline" && "max-sm:sr-only")}>{LABELS[status]}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );

  if (status === "conflict") {
    return (
      <span className="inline-flex items-center gap-2">
        {body}
        <Button size="sm" variant="outline" className="h-8" onClick={() => window.location.reload()}>
          <RefreshCw /> Reload
        </Button>
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-2">
        {body}
        <Button size="sm" variant="outline" className="h-8" onClick={onRetry}>
          Retry
        </Button>
      </span>
    );
  }
  if (message && status === "invalid") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="rounded-sm">
            {body}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-60">{message}</TooltipContent>
      </Tooltip>
    );
  }
  return body;
}
