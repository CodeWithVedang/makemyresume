import { templateIds, type TemplateId } from "@/lib/resume/schema";
import { getTemplateMeta } from "@/templates/registry";

/**
 * Plan catalog, priced for Indian job seekers.
 *
 * Pricing choices:
 * - Free forever with real value (1 resume, 3 share links) so freshers can finish a resume at no cost.
 * - One-time payments with no auto-renewal: subscriptions with mandates feel risky to many Indian users.
 * - A low-commitment 30-day pass (₹99) as the entry point and comparison anchor; the quarterly plan
 *   is positioned as the obvious pick (₹83/month for a typical job-search window).
 * - Yearly shows a per-day price, because small daily numbers are easier to judge.
 * Savings shown are computed against the 30-day pass, never invented "original" prices.
 */

export type PlanId = "FREE" | "JOB_PASS" | "PRO_QUARTERLY" | "PRO_YEARLY";
export type PaidPlanId = Exclude<PlanId, "FREE">;

export type Entitlements = {
  plan: PlanId;
  maxResumes: number;
  maxShareLinks: number;
  templates: "all" | readonly TemplateId[];
  advancedCustomization: boolean;
};

export type PlanDefinition = Entitlements & {
  name: string;
  tagline: string;
  priceInr: number;
  periodLabel: string;
  durationDays: number | null;
  badge?: string;
  highlight?: boolean;
  features: string[];
};

const UNLIMITED = Number.POSITIVE_INFINITY;
const FREE_TEMPLATES: readonly TemplateId[] = ["classic", "modern", "minimal", "compact"];

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    plan: "FREE",
    name: "Free",
    tagline: "Everything you need for your first resume.",
    priceInr: 0,
    periodLabel: "forever",
    durationDays: null,
    maxResumes: 1,
    maxShareLinks: 3,
    templates: FREE_TEMPLATES,
    advancedCustomization: false,
    features: [
      "1 resume",
      `${FREE_TEMPLATES.length} ATS-friendly templates`,
      "Unlimited PDF downloads",
      "Import from PDF or Word",
      "3 shareable links",
    ],
  },
  JOB_PASS: {
    plan: "JOB_PASS",
    name: "Job Pass",
    tagline: "For a quick, focused job hunt.",
    priceInr: 99,
    periodLabel: "30 days",
    durationDays: 30,
    maxResumes: 5,
    maxShareLinks: 15,
    templates: "all",
    advancedCustomization: true,
    features: ["5 resumes, one per role", `All ${templateIds.length} templates`, "15 shareable links", "Custom accent colors"],
  },
  PRO_QUARTERLY: {
    plan: "PRO_QUARTERLY",
    name: "Pro · 3 months",
    tagline: "Covers a typical placement season or job switch.",
    priceInr: 249,
    periodLabel: "3 months",
    durationDays: 90,
    badge: "Most popular",
    highlight: true,
    maxResumes: UNLIMITED,
    maxShareLinks: UNLIMITED,
    templates: "all",
    advancedCustomization: true,
    features: [
      "Unlimited resumes",
      "All templates and future ones",
      "Unlimited shareable links",
      "Custom accent colors",
      "Priority email support",
    ],
  },
  PRO_YEARLY: {
    plan: "PRO_YEARLY",
    name: "Pro · 1 year",
    tagline: "Keep your resume ready for every opportunity.",
    priceInr: 599,
    periodLabel: "1 year",
    durationDays: 365,
    badge: "Best value",
    maxResumes: UNLIMITED,
    maxShareLinks: UNLIMITED,
    templates: "all",
    advancedCustomization: true,
    features: [
      "Everything in Pro",
      "12 months of access",
      "Unlimited resumes and links",
      "Priority email support",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["FREE", "JOB_PASS", "PRO_QUARTERLY", "PRO_YEARLY"];
export const PAID_PLANS: PaidPlanId[] = ["JOB_PASS", "PRO_QUARTERLY", "PRO_YEARLY"];

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && (PAID_PLANS as string[]).includes(value);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

/** Effective monthly price, e.g. ₹249 / 3 months → ₹83/month. */
export function monthlyEquivalent(plan: PlanDefinition): number | null {
  if (!plan.durationDays || plan.priceInr === 0) return null;
  return Math.round(plan.priceInr / (plan.durationDays / 30));
}

/** Savings versus buying 30-day passes for the same period (honest comparison, no fake MRP). */
export function savingsVsPass(plan: PlanDefinition): number | null {
  const pass = PLANS.JOB_PASS;
  if (!plan.durationDays || plan.plan === "JOB_PASS" || plan.priceInr === 0) return null;
  const passCost = pass.priceInr * Math.round(plan.durationDays / 30);
  return Math.round(((passCost - plan.priceInr) / passCost) * 100);
}

export function entitlementsFor(plan: PlanId): Entitlements {
  const { maxResumes, maxShareLinks, templates, advancedCustomization } = PLANS[plan];
  return { plan, maxResumes, maxShareLinks, templates, advancedCustomization };
}

export function templateAllowed(e: Entitlements, templateId: TemplateId): boolean {
  return e.templates === "all" || e.templates.includes(templateId);
}

/** Upgrade prompt for a template the Free plan does not include. */
export function paidTemplateMessage(templateName: string): string {
  const names = FREE_TEMPLATES.map((id) => getTemplateMeta(id).name);
  const free = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
  return `${templateName} is part of the paid plans, from ${formatInr(PLANS.JOB_PASS.priceInr)}. Free includes ${free}.`;
}

export function formatLimit(n: number): string {
  return Number.isFinite(n) ? String(n) : "Unlimited";
}
