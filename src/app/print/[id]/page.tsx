import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PrintStyles } from "@/components/resume/PrintStyles";
import { prisma } from "@/server/db";
import { verifyPrintToken } from "@/server/print-token";
import { resumeInclude, toContent, toResume } from "@/server/resume-repository";
import { ResumeRenderer } from "@/templates/ResumeRenderer";

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Bare print view used only by the server-side PDF renderer (signed, short-lived token). */
export default async function PrintPage(props: PageProps<"/print/[id]">) {
  const { id } = await props.params;
  const { token } = await props.searchParams;
  if (typeof token !== "string" || !verifyPrintToken(id, token)) notFound();

  const row = await prisma.resume.findUnique({ where: { id }, include: resumeInclude });
  if (!row) notFound();
  const content = toContent(toResume(row));

  return (
    <>
      <PrintStyles settings={content.settings} />
      <ResumeRenderer content={content} mode="print" />
    </>
  );
}
