import { expect, test } from "@playwright/test";

import { createResume, signUp, waitForSaved } from "./helpers";

test("private routes redirect to login when signed out", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard/);
  await page.goto("/resume/new");
  await expect(page).toHaveURL(/\/login/);
});

test("users cannot open another user's resume by changing the id", async ({ browser }) => {
  const owner = await browser.newContext();
  const ownerPage = await owner.newPage();
  await signUp(ownerPage);
  const id = await createResume(ownerPage, "Owner Resume");

  const intruder = await browser.newContext();
  const intruderPage = await intruder.newPage();
  await signUp(intruderPage);
  // The page streams (loading UI), so the HTTP status is 200; the content must be the 404 view.
  await intruderPage.goto(`/resume/${id}/edit`);
  await expect(intruderPage.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await expect(intruderPage.locator("#resume-title")).toHaveCount(0);
  await intruderPage.goto(`/resume/${id}/preview`);
  await expect(intruderPage.getByRole("heading", { name: "We couldn't find that page" })).toBeVisible();
  await expect(intruderPage.getByText("Owner Resume")).toHaveCount(0);
  const pdf = await intruderPage.request.get(`/api/resumes/${id}/pdf`);
  expect(pdf.status()).toBe(404);
  const print = await intruderPage.request.get(`/print/${id}?token=forged.token`);
  expect(print.status()).toBe(404);

  await owner.close();
  await intruder.close();
});

test("public link: share, view signed out, disable", async ({ browser }) => {
  const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const page = await ctx.newPage();
  await signUp(page);
  await createResume(page, "Shared Resume");
  await page.getByLabel("Full name").fill("Morgan Public");
  await waitForSaved(page);

  await page.getByRole("button", { name: "Share" }).click();
  await page.getByText("Unlisted", { exact: true }).click();
  await expect(page.getByText("Anyone with this link can view your resume.")).toBeVisible();
  const link = await page.getByLabel("Resume link").inputValue();
  expect(link).toMatch(/\/r\/[a-z0-9]+$/);

  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(link);
  await expect(anonPage.getByText("Morgan Public").first()).toBeVisible();
  await expect(anonPage.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.getByRole("button", { name: "Disable Link" }).click();
  await expect(page.getByText("Link disabled. Your resume is private.")).toBeVisible();
  const after = await anonPage.goto(link);
  expect(after?.status()).toBe(404);

  await ctx.close();
  await anon.close();
});
