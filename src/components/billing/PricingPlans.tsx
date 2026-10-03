"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planRequestEmail, type PlanRequester } from "@/lib/billing/plan-request";
import {
  formatInr,
  monthlyEquivalent,
  PAID_PLANS,
  PLAN_ORDER,
  PLANS,
  savingsVsPass,
  type PaidPlanId,
  type PlanId,
} from "@/lib/billing/plans";
import { PLAN_REQUEST_EMAIL } from "@/lib/config";
import { cn } from "@/lib/utils";

export function PricingPlans({ requester, compact = false }: { requester: PlanRequester | null; compact?: boolean }) {
  const reduce = useReducedMotion();
  const [requested, setRequested] = useState<PaidPlanId | null>(null);
  const current: PlanId | null = requester?.currentPlan ?? null;

  const request = (planId: PaidPlanId) => {
    const { gmailUrl } = planRequestEmail(planId, requester);
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    setRequested(planId);
  };

  const email = requested ? planRequestEmail(requested, requester) : null;

  return (
    <>
      {compact ? (
        /* Settings: paid plans as full-width rows, always visible, no scroll reveal. */
        <ul className="space-y-4">
          {PAID_PLANS.map((id) => {
            const plan = PLANS[id];
            const perMonth = monthlyEquivalent(plan);
            const savings = savingsVsPass(plan);
            const isCurrent = current === id;
            return (
              <li
                key={id}
                className={cn(
                  "bg-card relative grid gap-5 rounded-xl border p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center",
                  plan.highlight ? "border-primary ring-primary ring-1" : "border-border",
                )}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    {plan.badge ? (
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          plan.highlight ? "bg-primary text-primary-foreground" : "bg-highlight-soft text-foreground",
                        )}
                      >
                        {plan.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold tracking-tight">{formatInr(plan.priceInr)}</span>
                    <span className="text-muted-foreground text-sm">/ {plan.periodLabel}</span>
                  </p>
                  <p className="text-brand mt-1 text-sm">
                    {perMonth && plan.plan !== "JOB_PASS" ? `₹${perMonth}/month` : "One-time payment"}
                    {savings ? <span className="text-success"> · Save {savings}%</span> : null}
                  </p>
                </div>
                <ul className="grid gap-2 text-sm sm:grid-cols-2 md:grid-cols-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <Button variant="outline" className="h-11 w-full md:w-auto" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className={cn("h-11 w-full md:w-auto", plan.highlight && "shine")}
                    onClick={() => request(id)}
                  >
                    <Mail /> Get {plan.name.replace("Pro · ", "Pro ")}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((id, i) => {
            const plan = PLANS[id];
            const perMonth = monthlyEquivalent(plan);
            const savings = savingsVsPass(plan);
            const isCurrent = current === id;
            return (
              <motion.li
                key={id}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={reduce ? undefined : { y: -6 }}
                className={cn(
                  "bg-card hover:shadow-card relative flex flex-col rounded-xl border p-6 transition-shadow",
                  plan.highlight ? "border-primary shadow-card ring-primary ring-1 lg:-my-3 lg:py-9" : "border-border",
                )}
              >
                {plan.badge ? (
                  <span
                    className={cn(
                      "absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                      plan.highlight ? "bg-primary text-primary-foreground" : "bg-highlight text-foreground",
                    )}
                  >
                    {plan.highlight ? <Sparkles className="size-3" aria-hidden="true" /> : null}
                    {plan.badge}
                  </span>
                ) : null}

                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground mt-1 min-h-10 text-sm">{plan.tagline}</p>

                <p className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight">{formatInr(plan.priceInr)}</span>
                  <span className="text-muted-foreground text-sm">/ {plan.periodLabel}</span>
                </p>
                <p className="text-brand mt-1 h-5 text-sm font-medium">
                  {plan.plan === "PRO_YEARLY" && perMonth
                    ? `Just ₹${(plan.priceInr / 365).toFixed(1)}/day · ₹${perMonth}/month`
                    : perMonth && plan.plan !== "JOB_PASS"
                      ? `₹${perMonth}/month`
                      : plan.priceInr === 0
                        ? "No card needed"
                        : "One-time payment"}
                </p>
                {savings ? (
                  <p className="text-success mt-1 text-xs font-medium">Save {savings}% vs monthly passes</p>
                ) : (
                  <p className="mt-1 h-4 text-xs" aria-hidden="true" />
                )}

                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check className="text-success mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-7">
                  {isCurrent ? (
                    <Button variant="outline" className="h-11 w-full" disabled>
                      Your current plan
                    </Button>
                  ) : id === "FREE" ? (
                    <Button asChild variant="outline" className="h-11 w-full">
                      <Link href={requester ? "/dashboard" : "/signup"}>
                        {requester ? "Go to dashboard" : "Start free"}
                      </Link>
                    </Button>
                  ) : requester ? (
                    <Button
                      variant={plan.highlight ? "default" : "outline"}
                      className={cn("group relative h-11 w-full overflow-hidden", plan.highlight && "shine")}
                      onClick={() => request(id as PaidPlanId)}
                    >
                      <Mail /> Get {plan.name.replace("Pro · ", "Pro ")}
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant={plan.highlight ? "default" : "outline"}
                      className={cn("h-11 w-full", plan.highlight && "shine")}
                    >
                      <Link href="/signup?next=pricing">Sign up to get {plan.name.replace("Pro · ", "Pro ")}</Link>
                    </Button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
      <p className={cn("text-muted-foreground mt-8 text-sm", !compact && "text-center")}>
        Prices in ₹ INR · One-time payment · No auto-renewal · Your resumes stay yours if a plan ends
      </p>

      <Dialog open={Boolean(requested)} onOpenChange={(o) => !o && setRequested(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete your request in Gmail</DialogTitle>
            <DialogDescription>
              We opened a pre-filled email to <strong className="text-foreground">{PLAN_REQUEST_EMAIL}</strong> with
              your plan and account details. Send it and we&apos;ll reply with payment details (UPI or bank transfer).
              Your plan is activated once payment is confirmed.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-2 text-sm">
            {[
              "Send the pre-filled email",
              "Pay using the details we share",
              "Get your plan activated on this account",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-3">
                <span className="bg-secondary text-brand flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
          <DialogFooter className="gap-2 sm:justify-start">
            {email ? (
              <>
                <Button asChild variant="outline" className="h-10">
                  <a href={email.mailtoUrl}>
                    <Mail /> Use another email app
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  className="h-10"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `To: ${PLAN_REQUEST_EMAIL}\nSubject: ${email.subject}\n\n${email.body}`,
                      );
                      toast.success("Request copied. Paste it into any email.");
                    } catch {
                      toast.error("Couldn't copy. Please email us directly.");
                    }
                  }}
                >
                  <Copy /> Copy request
                </Button>
              </>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
