import { NextResponse } from "next/server";

import { track } from "@/server/analytics";
import { pdfFilename, renderPdf } from "@/server/pdf";
import { createPrintToken } from "@/server/print-token";
import { rateLimit } from "@/server/rate-limit";
import { findOwnedResume } from "@/server/resume-repository";
import { getCurrentUser } from "@/server/session";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request, ctx: RouteContext<"/api/resumes/[id]/pdf">) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

  const { id } = await ctx.params;
  const resume = await findOwnedResume(user.id, id);
  if (!resume) return NextResponse.json({ error: "Resume not found." }, { status: 404 });

  if (!rateLimit(`pdf:${user.id}`, 20, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many exports. Please wait a few minutes." }, { status: 429 });
  }

  const origin = (process.env.INTERNAL_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
  const url = `${origin}/print/${encodeURIComponent(resume.id)}?token=${createPrintToken(resume.id)}`;

  try {
    const pdf = await renderPdf(url);
    track("resume_exported", user.id, { templateId: resume.templateId, format: "pdf" });
    const filename = pdfFilename(resume.personalInfo.fullName, resume.title);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[pdf] generation failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "PDF generation failed. Please try again." }, { status: 500 });
  }
}
