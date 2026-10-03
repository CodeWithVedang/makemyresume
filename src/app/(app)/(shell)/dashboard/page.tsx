import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { DashboardView } from "@/components/dashboard/DashboardView";
import { PLANS } from "@/lib/billing/plans";
import { getAccountUsage } from "@/server/entitlements";
import { listOwnedResumes } from "@/server/resume-repository";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [resumes, usage] = await Promise.all([listOwnedResumes(user.id), getAccountUsage(user.id)]);
  if (!user.onboardedAt && resumes.length === 0) redirect("/onboarding");
  const firstName = user.name?.trim().split(/\s+/)[0] ?? "";
  return (
    <DashboardView
      firstName={firstName}
      initialResumes={resumes}
      plan={{
        name: PLANS[usage.plan].name,
        isFree: usage.plan === "FREE",
        resumes: usage.resumes,
        maxResumes: Number.isFinite(usage.entitlements.maxResumes) ? usage.entitlements.maxResumes : null,
        links: usage.shareLinksCreated,
        maxLinks: Number.isFinite(usage.entitlements.maxShareLinks) ? usage.entitlements.maxShareLinks : null,
      }}
    />
  );
}
