import type { Metadata } from "next";

import { PricingPlans } from "@/components/billing/PricingPlans";
import { SettingsCard } from "@/components/settings/SettingsForms";
import { formatLimit, PLANS } from "@/lib/billing/plans";
import { PLAN_REQUEST_EMAIL } from "@/lib/config";
import { getAccountUsage } from "@/server/entitlements";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Plan & billing" };

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const finite = Number.isFinite(limit);
  const pct = finite ? Math.min(100, Math.round((used / Math.max(limit, 1)) * 100)) : 8;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {used} / {formatLimit(limit)}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={finite ? limit : undefined}
      >
        <div className={pct >= 100 ? "h-full rounded-full bg-highlight" : "h-full rounded-full bg-brand"} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function BillingSettingsPage() {
  const user = await requireUser();
  const usage = await getAccountUsage(user.id);
  const plan = PLANS[usage.plan];

  return (
    <div className="space-y-6">
      <SettingsCard title="Your plan">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-2xl font-semibold tracking-tight">{plan.name}</p>
          <p className="text-sm text-muted-foreground">
            {usage.expiresAt
              ? `Active until ${usage.expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`
              : usage.plan === "FREE"
                ? "Free forever"
                : "Active"}
          </p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Meter label="Resumes" used={usage.resumes} limit={usage.entitlements.maxResumes} />
          <Meter label="Shareable links created" used={usage.shareLinksCreated} limit={usage.entitlements.maxShareLinks} />
        </div>
      </SettingsCard>

      <section aria-labelledby="upgrade-title">
        <h2 id="upgrade-title" className="mb-2 font-semibold">
          {usage.plan === "FREE" ? "Upgrade when you need more" : "Extend or change your plan"}
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          Choose a plan to open a pre-filled request email to {PLAN_REQUEST_EMAIL}. We&apos;ll reply with payment details and
          activate the plan on this account.
        </p>
        <PricingPlans
          compact
          requester={{ name: user.name, email: user.email, currentPlan: usage.plan, resumes: usage.resumes }}
        />
      </section>
    </div>
  );
}
