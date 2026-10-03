"use client";

import { toast } from "sonner";

/** Downloads the server-rendered PDF with progress and error feedback. */
export async function downloadPdf(resumeId: string): Promise<boolean> {
  const id = toast.loading("Preparing your PDF…");
  try {
    const res = await fetch(`/api/resumes/${encodeURIComponent(resumeId)}/pdf`, { credentials: "same-origin" });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      throw new Error(body?.error ?? "PDF generation failed. Please try again.");
    }
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") ?? "";
    const match = /filename="([^"]+)"/.exec(disposition);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = match?.[1] ?? "Resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    toast.success("PDF downloaded.", { id });
    return true;
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "PDF generation failed.", { id });
    return false;
  }
}
