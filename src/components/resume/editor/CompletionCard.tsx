"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

import { completionItems, completionPercent } from "@/lib/resume/completion";
import { cn } from "@/lib/utils";

import { useEditor } from "./EditorContext";

/** Completion based only on what the user has filled in. */
export function CompletionCard() {
  const { content } = useEditor();
  const [expanded, setExpanded] = useState(false);
  const percent = completionPercent(content);
  const items = completionItems(content);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 rounded-md text-left"
      >
        <span className="text-sm font-medium">Resume completion</span>
        <span className="ml-auto text-sm font-semibold tabular-nums">{percent}%</span>
      </button>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Resume completion"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
      {expanded ? (
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {items.map((i) => (
            <li key={i.key} className={cn("flex items-center gap-1.5 text-xs", i.done ? "text-foreground" : "text-muted-foreground")}>
              {i.done ? (
                <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
              ) : (
                <Circle className="size-3.5" aria-hidden="true" />
              )}
              {i.label}
              <span className="sr-only">{i.done ? "(complete)" : "(incomplete)"}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
