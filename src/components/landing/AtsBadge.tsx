import { ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";

export function AtsBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-medium text-success",
        className,
      )}
    >
      <ShieldCheck className="size-3.5" aria-hidden="true" />
      ATS friendly
    </span>
  );
}
