"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Generic error boundary. Never shows stack traces; the digest helps support find server logs. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="flex min-h-[70dvh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        We hit an unexpected problem. Your saved work is safe. Try again, or head back to your resumes.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-muted-foreground">Reference: {error.digest}</p> : null}
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="h-11" asChild>
          <Link href="/dashboard">My Resumes</Link>
        </Button>
        <Button className="h-11" onClick={reset}>
          <RefreshCw /> Try Again
        </Button>
      </div>
    </main>
  );
}
