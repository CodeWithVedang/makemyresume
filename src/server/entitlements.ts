import "server-only";

import { entitlementsFor, type Entitlements, type PlanId } from "@/lib/billing/plans";
import { prisma } from "@/server/db";

export type PlanStatus = { plan: PlanId; expiresAt: Date | null };

/** Active paid plan if its period hasn't ended; otherwise Free. */
export async function getPlanStatus(userId: string): Promise<PlanStatus> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true, currentPeriodEnd: true },
  });
  if (!sub || sub.status !== "active" || sub.plan === "FREE") return { plan: "FREE", expiresAt: null };
  if (sub.currentPeriodEnd && sub.currentPeriodEnd <= new Date()) return { plan: "FREE", expiresAt: null };
  const plan: PlanId = sub.plan === "PRO" ? "PRO_YEARLY" : sub.plan;
  return { plan, expiresAt: sub.currentPeriodEnd };
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  return entitlementsFor((await getPlanStatus(userId)).plan);
}

export type AccountUsage = PlanStatus & {
  entitlements: Entitlements;
  resumes: number;
  shareLinksCreated: number;
};

export async function getAccountUsage(userId: string): Promise<AccountUsage> {
  const [status, resumes, user] = await Promise.all([
    getPlanStatus(userId),
    prisma.resume.count({ where: { userId, isDemo: false } }),
    prisma.user.findUnique({ where: { id: userId }, select: { shareLinksCreated: true } }),
  ]);
  return { ...status, entitlements: entitlementsFor(status.plan), resumes, shareLinksCreated: user?.shareLinksCreated ?? 0 };
}
