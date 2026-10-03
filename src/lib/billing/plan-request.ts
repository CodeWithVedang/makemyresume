import { APP_NAME, PLAN_REQUEST_EMAIL } from "@/lib/config";

import { formatInr, PLANS, type PaidPlanId, type PlanId } from "./plans";

export type PlanRequester = {
  name: string | null;
  email: string;
  currentPlan: PlanId;
  resumes: number;
};

/**
 * Builds the plan-request email. No payment gateway is configured yet, so the
 * user emails the team, pays by the method they share (e.g. UPI), and the plan
 * is activated manually (`npm run plan:grant`).
 */
export function planRequestEmail(planId: PaidPlanId, user: PlanRequester | null) {
  const plan = PLANS[planId];
  const subject = `${APP_NAME} plan request: ${plan.name} (${formatInr(plan.priceInr)})`;
  const lines = [
    "Hi team,",
    "",
    `I'd like to activate the ${plan.name} plan on ${APP_NAME}.`,
    "",
    "Plan details",
    `- Plan: ${plan.name}`,
    `- Price: ${formatInr(plan.priceInr)} (one-time, ${plan.periodLabel})`,
    "",
    "My account",
    `- Name: ${user?.name || "(please fill in)"}`,
    `- Account email: ${user?.email || "(the email you signed up with)"}`,
    `- Current plan: ${user ? PLANS[user.currentPlan].name : "Not signed up yet"}`,
    ...(user ? [`- Resumes created: ${user.resumes}`] : []),
    `- Requested on: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`,
    "",
    "Please share the payment details (UPI or bank transfer). I'll reply with the transaction reference.",
    "",
    "Thanks!",
  ];
  const body = lines.join("\n");
  const params = new URLSearchParams({ view: "cm", fs: "1", to: PLAN_REQUEST_EMAIL, su: subject, body });
  return {
    subject,
    body,
    gmailUrl: `https://mail.google.com/mail/?${params.toString()}`,
    mailtoUrl: `mailto:${PLAN_REQUEST_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  };
}
