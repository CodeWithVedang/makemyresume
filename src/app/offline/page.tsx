import type { Metadata } from "next";

import { LogoMark } from "@/components/brand/Logo";
import { RetryButton } from "@/components/pwa/RetryButton";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };
export const dynamic = "force-static";

/** Served by the service worker when a page can't be loaded without a connection. */
export default function OfflinePage() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-10" />
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">You&apos;re offline</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        This page needs a connection. Any resume edits you made are saved on this device and will sync when
        you&apos;re back online.
      </p>
      <RetryButton />
    </main>
  );
}
