import path from "node:path";

import { expect, test } from "@playwright/test";

import { signUp } from "./helpers";

const fixtures = path.join(__dirname, "fixtures");

test("import a TXT resume, review, edit and save", async ({ page }) => {
  await signUp(page);
  await page.goto("/resume/new?mode=import");
  await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "resume.txt"));

  await expect(page.getByText("Review imported information before continuing.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "What we found" })).toBeVisible();
  await expect(page.getByLabel("Full name")).toHaveValue("Jordan Lee");
  await expect(page.getByLabel("Email")).toHaveValue("jordan.lee@example.com");

  // Correct an extracted field before saving.
  await page.getByLabel("Professional title").fill("Staff Backend Engineer");
  await page.getByRole("button", { name: "Save Resume" }).click();
  await expect(page).toHaveURL(/\/resume\/[^/]+\/edit/);
  const preview = page.getByRole("region", { name: "Live preview" });
  await expect(preview.getByText("Staff Backend Engineer")).toBeVisible();
  await expect(preview.getByText("Paylane Inc.")).toBeVisible();
});

test("import a PDF and a DOCX resume", async ({ page }) => {
  await signUp(page);
  for (const file of ["resume.pdf", "resume.docx"]) {
    await page.goto("/resume/new?mode=import");
    await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, file));
    await expect(page.getByText("Review imported information before continuing.")).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Jordan Lee");
  }
});

test("rejects unsupported files with a helpful message", async ({ page }) => {
  await signUp(page);
  await page.goto("/resume/new?mode=import");
  await page.locator('input[type="file"]').setInputFiles({
    name: "resume.exe",
    mimeType: "application/octet-stream",
    buffer: Buffer.from("MZ"),
  });
  await expect(page.getByText("Upload a PDF, DOCX or TXT file.")).toBeVisible();
});
