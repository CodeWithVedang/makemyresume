"use client";

import Link from "next/link";
import { toast } from "sonner";

/** Plan-limit message with a direct link to the plans page. */
export function showUpgradeToast(message: string) {
  toast.error(message, {
    duration: 8000,
    action: (
      <Link
        href="/settings/billing"
        className="ml-auto shrink-0 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground"
      >
        See plans
      </Link>
    ),
  });
}

/** Routes action errors: plan limits get the upgrade prompt, everything else a plain error. */
export function showActionError(result: { error: string; code?: string }) {
  if (result.code === "limit") showUpgradeToast(result.error);
  else toast.error(result.error);
}
