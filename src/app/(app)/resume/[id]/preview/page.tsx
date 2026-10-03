import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewToolbar } from "@/components/resume/PreviewToolbar";
import { PrintStyles } from "@/components/resume/PrintStyles";
import { ScaledResume } from "@/components/resume/ScaledResume";
import { findOwnedResume, toContent } from "@/server/resume-repository";
import { requireUser } from "@/server/session";
import { ResumeRenderer } from "@/templates/ResumeRenderer";

export const metadata: Metadata = { title: "Preview" };

export default async function PreviewPage(props: PageProps<"/resume/[id]/preview">) {
  const { id } = await props.params;
  const { print } = await props.searchParams;
  const user = await requireUser();
  const resume = await findOwnedResume(user.id, id);
  if (!resume) notFound();
  const content = toContent(resume);

  return (
    <div className="min-h-dvh bg-canvas print:bg-white">
      <PrintStyles settings={content.settings} />
      <PreviewToolbar resumeId={resume.id} title={resume.title} autoPrint={print === "1"} />
      <main id="main" className="px-3 py-6 sm:px-6 sm:py-10 print:p-0">
        {/* Screen: scaled to fit any width. Print: full-size page with @page margins. */}
        <div className="mx-auto max-w-[820px] overflow-hidden rounded-sm shadow-page print:hidden">
          <ScaledResume content={content} showPageGuides />
        </div>
        <div className="hidden print:block">
          <ResumeRenderer content={content} mode="print" />
        </div>
      </main>
    </div>
  );
}
