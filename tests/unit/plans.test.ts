import { describe, expect, it } from "vitest";

import { planRequestEmail } from "@/lib/billing/plan-request";
import {
  entitlementsFor,
  formatInr,
  monthlyEquivalent,
  PLANS,
  savingsVsPass,
  templateAllowed,
} from "@/lib/billing/plans";

describe("plans", () => {
  it("Free allows 1 resume, 3 share links and only ATS templates", () => {
    const free = entitlementsFor("FREE");
    expect(free.maxResumes).toBe(1);
    expect(free.maxShareLinks).toBe(3);
    expect(templateAllowed(free, "classic")).toBe(true);
    expect(templateAllowed(free, "creative")).toBe(false);
  });

  it("Pro plans are unlimited with all templates", () => {
    const pro = entitlementsFor("PRO_QUARTERLY");
    expect(Number.isFinite(pro.maxResumes)).toBe(false);
    expect(Number.isFinite(pro.maxShareLinks)).toBe(false);
    expect(templateAllowed(pro, "executive")).toBe(true);
  });

  it("computes honest per-month prices and savings against the 30-day pass", () => {
    expect(monthlyEquivalent(PLANS.PRO_QUARTERLY)).toBe(83);
    expect(monthlyEquivalent(PLANS.PRO_YEARLY)).toBe(49);
    expect(savingsVsPass(PLANS.PRO_QUARTERLY)).toBe(16);
    expect(savingsVsPass(PLANS.PRO_YEARLY)).toBe(50);
    expect(savingsVsPass(PLANS.JOB_PASS)).toBeNull();
    expect(savingsVsPass(PLANS.FREE)).toBeNull();
  });

  it("formats rupees", () => {
    expect(formatInr(249)).toBe("₹249");
  });
});

describe("plan request email", () => {
  it("prefills Gmail with plan and account details", () => {
    const { gmailUrl, subject, body } = planRequestEmail("PRO_QUARTERLY", {
      name: "Asha Rao",
      email: "asha@example.com",
      currentPlan: "FREE",
      resumes: 1,
    });
    const url = new URL(gmailUrl);
    expect(url.hostname).toBe("mail.google.com");
    expect(url.searchParams.get("to")).toBe("shelatkarvedang2@gmail.com");
    expect(url.searchParams.get("su")).toBe(subject);
    expect(subject).toContain("Pro · 3 months");
    expect(subject).toContain("₹249");
    expect(body).toContain("Name: Asha Rao");
    expect(body).toContain("Account email: asha@example.com");
    expect(body).toContain("Current plan: Free");
  });
});
