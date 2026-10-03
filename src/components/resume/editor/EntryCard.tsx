"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, ChevronDown, Copy, MoreVertical, Trash2 } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** Collapsible entry with reorder, duplicate and delete actions. */
export function EntryCard({
  title,
  subtitle,
  handle,
  index,
  count,
  defaultOpen = false,
  hasError,
  onMove,
  onDuplicate,
  onDelete,
  itemLabel,
  children,
}: {
  title: string;
  subtitle?: string;
  handle: ReactNode;
  index: number;
  count: number;
  defaultOpen?: boolean;
  hasError?: boolean;
  onMove: (to: number) => void;
  onDuplicate?: () => void;
  onDelete: () => void;
  itemLabel: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const name = title.trim() || `Untitled ${itemLabel.toLowerCase()}`;

  return (
    <div className={cn("rounded-lg border bg-card", hasError ? "border-destructive/60" : "border-border")}>
      <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-1">
        {handle}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left hover:bg-muted/60"
        >
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate text-sm font-medium", !title.trim() && "text-muted-foreground")}>{name}</span>
            {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
          </span>
          {hasError ? <span className="text-xs font-medium text-destructive">Needs attention</span> : null}
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-9" aria-label={`More actions for ${name}`}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={index === 0} onSelect={() => onMove(index - 1)}>
              <ArrowUp /> Move up
            </DropdownMenuItem>
            <DropdownMenuItem disabled={index === count - 1} onSelect={() => onMove(index + 1)}>
              <ArrowDown /> Move down
            </DropdownMenuItem>
            {onDuplicate ? (
              <DropdownMenuItem onSelect={onDuplicate}>
                <Copy /> Duplicate
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={onDelete}>
              <Trash2 /> Delete {itemLabel.toLowerCase()}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={bodyId}
            key="body"
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-border p-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
