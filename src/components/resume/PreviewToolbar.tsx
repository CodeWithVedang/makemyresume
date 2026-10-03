"use client";

import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { downloadPdf } from "./download-pdf";

export function PreviewToolbar({ resumeId, title, autoPrint }: { resumeId: string; title: string; autoPrint: boolean }) {
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!autoPrint) return;
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, [autoPrint]);

  return (
    <header className="no-print sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-border bg-card px-2 sm:px-4">
      <Button asChild variant="ghost" className="h-10">
        <Link href={`/resume/${resumeId}/edit`}>
          <ArrowLeft /> <span className="max-sm:sr-only">Back to editor</span>
        </Link>
      </Button>
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h1>
      <Button variant="outline" className="h-10" onClick={() => window.print()}>
        <Printer /> <span className="max-sm:sr-only">Print</span>
      </Button>
      <Button
        className="h-10"
        disabled={exporting}
        onClick={async () => {
          setExporting(true);
          await downloadPdf(resumeId);
          setExporting(false);
        }}
      >
        {exporting ? <Loader2 className="animate-spin" /> : <Download />}
        <span className="max-sm:sr-only">Download PDF</span>
      </Button>
    </header>
  );
}
