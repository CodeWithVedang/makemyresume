import { expect, test } from "@playwright/test";

import { createResume, grantPlan, signUp } from "./helpers";

test("Free plan: one resume, paid templates locked, upgrade path shown", async ({ page }) => {
  await signUp(page);
  await createResume(page, "Only Resume");

  // Premium template prompts an upgrade instead of switching.
  const design = page.getByRole("complementary", { name: "Design" });
  await design.getByRole("radio", { name: /^Creative template/ }).click();
  await expect(page.getByText(/Creative is part of the paid plans/)).toBeVisible();
  await expect(design.getByRole("radio", { name: /^Classic template/ })).toHaveAttribute("aria-checked", "true");

  // Second resume is blocked up front.
  await page.goto("/resume/new");
  await expect(page.getByRole("heading", { name: "Your free resume is ready to shine" })).toBeVisible();
  await expect(page.getByRole("link", { name: "See plans" })).toHaveAttribute("href", "/settings/billing");

  // Dashboard shows usage.
  await page.goto("/dashboard");
  await expect(page.getByText("1 of 1 resume used · 0 of 3 share links used")).toBeVisible();
});

test("Free plan: only 3 share links can be created", async ({ page }) => {
  await signUp(page);
  await createResume(page, "Shared");
  await page.getByRole("button", { name: "Share" }).click();
  for (let i = 0; i < 3; i++) {
    await page.getByText("Unlisted", { exact: true }).click();
    await expect(page.getByText("Anyone with this link can view your resume.")).toBeVisible();
    await page.getByRole("button", { name: "Disable Link" }).click();
    await expect(page.getByText("Anyone with this link can view your resume.")).toHaveCount(0);
  }
  await page.getByText("Unlisted", { exact: true }).click();
  await expect(page.getByText(/You've used all 3 shareable links/)).toBeVisible();
});

test("plan request opens a pre-filled Gmail message; granted plan lifts limits", async ({ page, context }) => {
  const { email } = await signUp(page, { name: "Kavya Iyer" });
  await page.goto("/pricing");
  const popupPromise = context.waitForEvent("page");
  await page.getByRole("button", { name: /Get Pro 3 months/ }).click();
  const popup = await popupPromise;
  const url = new URL(popup.url().startsWith("https://accounts.google.com") ? decodeURIComponent(new URL(popup.url()).searchParams.get("continue") ?? popup.url()) : popup.url());
  expect(url.hostname).toBe("mail.google.com");
  expect(url.searchParams.get("su")).toContain("Pro · 3 months");
  expect(url.searchParams.get("body")).toContain(`Account email: ${email}`);
  await popup.close();
  await expect(page.getByRole("heading", { name: "Complete your request in Gmail" })).toBeVisible();

  grantPlan(email, "PRO_QUARTERLY");
  await page.goto("/settings/billing");
  await expect(page.getByText("Pro · 3 months").first()).toBeVisible();
  await expect(page.getByText(/Active until/)).toBeVisible();
  await createResume(page, "First");
  await createResume(page, "Second");
});
