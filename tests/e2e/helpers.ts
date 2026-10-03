import { execSync } from "node:child_process";

import { expect, type Page } from "@playwright/test";

export function uniqueEmail(prefix = "e2e"): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

export async function signUp(page: Page, opts: { name?: string; email?: string; password?: string } = {}) {
  const email = opts.email ?? uniqueEmail();
  const password = opts.password ?? "Sup3rSecret!";
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(opts.name ?? "Test User");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  return { email, password };
}

export async function logIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard|\/onboarding/);
}

/** Creates a blank resume from the dashboard flow and lands in the editor. */
export async function createResume(page: Page, title = "E2E Resume") {
  await page.goto("/resume/new?mode=scratch");
  await page.getByLabel("Resume name").fill(title);
  await page.getByRole("button", { name: "Create Resume" }).click();
  await expect(page).toHaveURL(/\/resume\/[^/]+\/edit/);
  return page.url().split("/resume/")[1].split("/")[0];
}

/**
 * Waits until autosave has persisted every change: each edit writes a local
 * draft immediately and removes it only after the server confirms the save.
 */
export async function waitForSaved(page: Page) {
  await expect
    .poll(
      () => page.evaluate(() => Object.keys(window.localStorage).some((k) => k.startsWith("resume-draft:"))),
      { timeout: 20_000 },
    )
    .toBe(false);
  await expect(page.getByRole("status").filter({ hasText: /^Saved$/ })).toBeVisible({ timeout: 20_000 });
}

/** Activates a plan the same way an admin does after payment (npm run plan:grant). */
export function grantPlan(email: string, plan: "FREE" | "JOB_PASS" | "PRO_QUARTERLY" | "PRO_YEARLY") {
  execSync(`npx tsx --env-file-if-exists=.env scripts/grant-plan.ts ${email} ${plan}`, { stdio: "pipe" });
}
