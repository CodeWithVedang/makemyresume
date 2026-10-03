import { Crown, PenLine } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatInr, PLANS, type PlanId } from "@/lib/billing/plans";

/** Shown instead of the create flow when the plan's resume limit is reached. */
export function LimitReached({ plan, limit }: { plan: PlanId; limit: number }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-14 text-center sm:px-6 sm:py-20">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-highlight-soft text-highlight">
        <Crown className="size-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
        {plan === "FREE" ? "Your free resume is ready to shine" : "You've reached your plan's resume limit"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {plan === "FREE"
          ? `The Free plan includes ${limit} resume. Applying to different roles? Make a tailored resume for each one with a paid plan, from just ${formatInr(PLANS.JOB_PASS.priceInr)}.`
          : `${PLANS[plan].name} includes ${limit} resumes. Delete one you no longer need, or move to Pro for unlimited resumes.`}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild className="shine h-12 px-6 text-base">
          <Link href="/settings/billing">
            <Crown /> See plans
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-12 px-6 text-base">
          <Link href="/dashboard">
            <PenLine /> Edit my resume
          </Link>
        </Button>
      </div>
    </div>
  );
}
