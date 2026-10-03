import type { Metadata } from "next";

import { LimitReached } from "@/components/billing/LimitReached";
import { NewResumeFlow } from "@/components/resume/NewResumeFlow";
import { templateAllowed } from "@/lib/billing/plans";
import { templateIds, type TemplateId } from "@/lib/resume/schema";
import { prisma } from "@/server/db";
import { getEntitlements } from "@/server/entitlements";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Create resume" };

export default async function NewResumePage(props: PageProps<"/resume/new">) {
  const user = await requireUser();
  const params = await props.searchParams;
  const entitlements = await getEntitlements(user.id);
  const lockedTemplates = templateIds.filter((t) => !templateAllowed(entitlements, t));
  const existing = await prisma.resume.findMany({
    where: { userId: user.id },
    select: { id: true, title: true, templateId: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  const mode =
    params.mode === "import" ? "import" : params.mode === "scratch" ? "scratch" : params.mode === "base" && existing.length ? "base" : "choose";
  const ownCount = existing.length - (await prisma.resume.count({ where: { userId: user.id, isDemo: true } }));
  if (Number.isFinite(entitlements.maxResumes) && ownCount >= entitlements.maxResumes) {
    return <LimitReached plan={entitlements.plan} limit={entitlements.maxResumes} />;
  }
  const template = (templateIds as readonly string[]).includes(String(params.template)) ? (params.template as TemplateId) : "classic";

  return (
    <NewResumeFlow
      key={mode}
      initialMode={params.template && mode === "choose" ? "scratch" : mode}
      initialTemplate={lockedTemplates.includes(template) ? "classic" : template}
      lockedTemplates={lockedTemplates}
      existing={existing.map((r) => ({
        id: r.id,
        title: r.title,
        templateId: (templateIds as readonly string[]).includes(r.templateId) ? (r.templateId as TemplateId) : "classic",
        updatedAt: r.updatedAt.toISOString(),
      }))}
    />
  );
}
