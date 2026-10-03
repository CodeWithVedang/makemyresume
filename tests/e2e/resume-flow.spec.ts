import { expect, test } from "@playwright/test";

import { createResume, grantPlan, signUp, waitForSaved } from "./helpers";

test.describe("core resume flow", () => {
  test("signup, fill sections, switch templates, autosave, reload, export, duplicate, delete", async ({ page }) => {
    const { email } = await signUp(page, { name: "Riley Carter" });
    grantPlan(email, "PRO_QUARTERLY");
    await page.getByRole("button", { name: /My first resume/ }).click();
    await expect(page).toHaveURL(/\/resume\/new\?mode=scratch/);
    await page.getByLabel("Resume name").fill("Frontend Resume");
    await page.getByRole("button", { name: "Create Resume" }).click();
    await expect(page).toHaveURL(/\/resume\/[^/]+\/edit/);
    const editUrl = page.url();

    // Personal information (open by default) — preview updates live.
    const preview = page.getByRole("region", { name: "Live preview" });
    await page.getByLabel("Full name").fill("Riley Carter");
    await page.getByLabel("Professional title").fill("Frontend Developer");
    await page.getByLabel("Email").fill("riley@example.com");
    await expect(preview.getByText("Frontend Developer")).toBeVisible();
    await page.getByLabel("Professional title").fill("Senior Frontend Developer");
    await expect(preview.getByText("Senior Frontend Developer")).toBeVisible();

    // Validation message for invalid email.
    await page.getByLabel("Email").fill("riley@");
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await page.getByLabel("Email").fill("riley@example.com");

    // Experience entry.
    await page.getByRole("button", { name: /^Experience/ }).click();
    await page.getByRole("button", { name: "Add Experience" }).click();
    await page.getByLabel("Job title").fill("UI Engineer");
    await page.getByLabel("Company").fill("Acme Corp");
    await page.getByLabel("Start date month").selectOption("03");
    await page.getByLabel("Start date year").selectOption("2021");
    await page.getByLabel("End date month").selectOption("01");
    await page.getByLabel("End date year").selectOption("2020");
    await expect(page.getByText("End date cannot be before start date.")).toBeVisible();
    await page.getByLabel("I currently work here").check();
    await page.getByLabel("Description and responsibilities").fill("- Built the design system\n- Led accessibility work");
    await expect(preview.getByText("Acme Corp")).toBeVisible();

    // Skills.
    await page.getByRole("button", { name: /^Skills/ }).click();
    await page.getByLabel("Skill", { exact: true }).fill("React, TypeScript, CSS");
    await page.getByRole("button", { name: "Add Skill" }).click();
    await expect(preview.getByText(/React, TypeScript, CSS/)).toBeVisible();

    await waitForSaved(page);

    // Switch through every template — content must stay.
    const design = page.getByRole("complementary", { name: "Design" });
    for (const name of ["Modern", "Minimal", "Executive", "Creative", "Classic"]) {
      await design.getByRole("radio", { name: new RegExp(`^${name} template`) }).click();
      await expect(preview.getByText("Acme Corp")).toBeVisible();
      await expect(preview.getByText("Senior Frontend Developer")).toBeVisible();
    }
    await design.getByRole("radio", { name: /^Modern template/ }).click();
    await waitForSaved(page);

    // Reload: everything persisted.
    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("Riley Carter");
    await expect(preview.getByText("Acme Corp")).toBeVisible();
    await expect(preview.getByText(/React, TypeScript, CSS/)).toBeVisible();
    await expect(design.getByRole("radio", { name: /^Modern template/ })).toHaveAttribute("aria-checked", "true");

    // PDF export.
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download PDF" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("Riley_Carter_Resume.pdf");
    const path = await download.path();
    const { readFileSync } = await import("node:fs");
    expect(readFileSync(path).subarray(0, 5).toString()).toBe("%PDF-");

    // Duplicate from the dashboard; original untouched.
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Actions for Frontend Resume" }).click();
    await page.getByRole("menuitem", { name: "Duplicate" }).click();
    await expect(page).toHaveURL(/\/resume\/[^/]+\/edit/);
    expect(page.url()).not.toBe(editUrl);
    await expect(page.locator("#resume-title")).toHaveValue("Frontend Resume — Copy");
    await page.locator("#resume-title").fill("Backend Resume");
    await page.getByLabel("Professional title").fill("Backend Developer");
    await waitForSaved(page);
    await page.goto(editUrl);
    await expect(page.getByLabel("Professional title")).toHaveValue("Senior Frontend Developer");

    // Delete with confirmation.
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Actions for Backend Resume" }).click();
    await page.getByRole("menuitem", { name: "Delete Resume" }).click();
    await expect(page.getByRole("alertdialog")).toContainText("Delete “Backend Resume”?");
    await page.getByRole("button", { name: "Delete Resume" }).click();
    await expect(page.getByRole("link", { name: "Edit Backend Resume" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Edit Frontend Resume" })).toBeVisible();
  });

  test("rename and custom sections", async ({ page }) => {
    await signUp(page);
    await createResume(page, "Custom Sections");
    await page.getByRole("button", { name: "Add custom section" }).click();
    await page.getByLabel("Section name").fill("Publications");
    await page.getByRole("button", { name: "Add Entry" }).click();
    await page.getByLabel("Title", { exact: true }).fill("Scaling Design Systems");
    const preview = page.getByRole("region", { name: "Live preview" });
    await expect(preview.getByText("Publications")).toBeVisible();
    await expect(preview.getByText("Scaling Design Systems")).toBeVisible();
    await waitForSaved(page);
    await page.reload();
    await expect(preview.getByText("Scaling Design Systems")).toBeVisible();

    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Actions for Custom Sections" }).click();
    await page.getByRole("menuitem", { name: "Rename" }).click();
    await page.getByLabel("Resume name").fill("Renamed Resume");
    await page.getByRole("button", { name: "Save Name" }).click();
    await expect(page.getByRole("link", { name: "Edit Renamed Resume" })).toBeVisible();
  });
});
