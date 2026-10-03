"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineIndicator() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <span
      role="status"
      className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning"
    >
      <WifiOff className="size-3.5" aria-hidden="true" />
      Offline
    </span>
  );
}
