import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ResumeEditor } from "@/components/resume/editor/ResumeEditor";
import { getEntitlements } from "@/server/entitlements";
import { findOwnedResume, toContent } from "@/server/resume-repository";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Edit resume" };

export default async function EditResumePage(props: PageProps<"/resume/[id]/edit">) {
  const { id } = await props.params;
  const user = await requireUser();
  const [resume, entitlements] = await Promise.all([findOwnedResume(user.id, id), getEntitlements(user.id)]);
  // Same response for "missing" and "someone else's" so ids can't be probed.
  if (!resume) notFound();
  return <ResumeEditor resume={resume} initial={toContent(resume)} entitlements={entitlements} />;
}
