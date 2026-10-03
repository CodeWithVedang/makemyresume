import Link from "next/link";

import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <LogoMark className="size-10" />
      <p className="mt-6 text-sm font-medium text-brand">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">We couldn&apos;t find that page</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The link may be wrong, or the resume may have been made private or deleted.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline" className="h-11">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild className="h-11">
          <Link href="/dashboard">My Resumes</Link>
        </Button>
      </div>
    </main>
  );
}
