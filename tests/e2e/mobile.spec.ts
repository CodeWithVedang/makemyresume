import { expect, test } from "@playwright/test";

import { createResume, signUp } from "./helpers";

test("@mobile editor uses Edit / Preview / Design tabs and has no horizontal scroll", async ({ page }) => {
  await signUp(page);
  await createResume(page, "Mobile Resume");
  const tabs = page.getByRole("navigation", { name: "Editor views" });
  await expect(tabs).toBeVisible();

  await page.getByLabel("Full name").fill("Sam Mobile");
  await tabs.getByRole("tab", { name: "Preview" }).click();
  await expect(page.getByRole("region", { name: "Live preview" }).getByText("Sam Mobile")).toBeVisible();
  await tabs.getByRole("tab", { name: "Design" }).click();
  await expect(page.getByRole("radiogroup", { name: "Template" })).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("@mobile landing page has no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
