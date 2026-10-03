import { describe, expect, it } from "vitest";

import { safeRedirectPath } from "@/lib/result";
import { completionItems, completionPercent } from "@/lib/resume/completion";
import { formatMonth, formatRange } from "@/lib/resume/dates";
import { emptyResumeContent } from "@/lib/resume/defaults";
import { displayUrl, isSafeUrl, toHref } from "@/lib/resume/links";
import { experienceSchema, personalInfoSchema, resumeContentSchema } from "@/lib/resume/schema";
import { normalizeSectionOrder, visibleSections } from "@/lib/resume/sections";
import { signupSchema } from "@/lib/validation/auth";

import { fullResume } from "./fixtures";

describe("resume validation", () => {
  it("accepts a complete resume", () => {
    expect(resumeContentSchema.safeParse(fullResume()).success).toBe(true);
  });

  it("rejects an invalid email with a friendly message", () => {
    const result = personalInfoSchema.safeParse({ ...emptyResumeContent().personalInfo, email: "not-an-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Please enter a valid email address.");
  });

  it("rejects an end date before the start date", () => {
    const result = experienceSchema.safeParse({ ...fullResume().experience[1], startDate: "2022-05", endDate: "2021-01" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ path: ["endDate"], message: "End date cannot be before start date." });
  });

  it("ignores the end date for current roles", () => {
    const result = experienceSchema.safeParse({ ...fullResume().experience[0], current: true, endDate: "1999-01" });
    expect(result.success).toBe(true);
  });

  it("rejects malformed months and unsafe URLs", () => {
    const resume = fullResume();
    resume.experience[0].startDate = "2021-13";
    resume.personalInfo.website = "javascript:alert(1)";
    const result = resumeContentSchema.safeParse(resume);
    expect(result.success).toBe(false);
    const paths = result.error?.issues.map((i) => i.path.join("."));
    expect(paths).toContain("experience.0.startDate");
    expect(paths).toContain("personalInfo.website");
  });

  it("rejects unknown section keys and templates", () => {
    expect(resumeContentSchema.safeParse({ ...fullResume(), templateId: "fancy" }).success).toBe(false);
    expect(resumeContentSchema.safeParse({ ...fullResume(), sectionOrder: ["custom:<script>"] }).success).toBe(false);
  });

  it("requires a full name on signup", () => {
    const result = signupSchema.safeParse({ name: " ", email: "a@b.co", password: "password1" });
    expect(result.error?.issues[0].message).toBe("Full name is required.");
  });
});

describe("completion", () => {
  it("is 0% for an empty resume and 100% for a complete one", () => {
    expect(completionPercent(emptyResumeContent())).toBe(0);
    expect(completionPercent(fullResume())).toBe(100);
  });

  it("is based only on filled fields", () => {
    const resume = emptyResumeContent();
    resume.personalInfo = { ...resume.personalInfo, fullName: "A", email: "a@b.co", phone: "1" };
    const items = Object.fromEntries(completionItems(resume).map((i) => [i.key, i.done]));
    expect(items.personal).toBe(true);
    expect(items.experience).toBe(false);
    expect(completionPercent(resume)).toBe(20);
  });
});

describe("dates", () => {
  it("formats months in every supported format", () => {
    expect(formatMonth("2024-03", "MMM YYYY")).toBe("Mar 2024");
    expect(formatMonth("2024-03", "MMMM YYYY")).toBe("March 2024");
    expect(formatMonth("2024-03", "MM/YYYY")).toBe("03/2024");
    expect(formatMonth("2024-03", "YYYY")).toBe("2024");
  });

  it("formats ranges including current roles", () => {
    expect(formatRange("2020-01", "", "MMM YYYY", true)).toBe("Jan 2020 – Present");
    expect(formatRange("2020-01", "2021-06", "MMM YYYY")).toBe("Jan 2020 – Jun 2021");
    expect(formatRange("", "", "MMM YYYY")).toBe("");
  });
});

describe("links", () => {
  it("upgrades bare domains and blocks unsafe schemes", () => {
    expect(toHref("linkedin.com/in/x")).toBe("https://linkedin.com/in/x");
    expect(toHref("http://example.com")).toBe("http://example.com/");
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,hi")).toBe(false);
    expect(isSafeUrl("not a url")).toBe(false);
    expect(displayUrl("https://www.example.com/")).toBe("example.com");
  });

  it("only allows same-origin relative redirects", () => {
    expect(safeRedirectPath("/resume/1/edit")).toBe("/resume/1/edit");
    expect(safeRedirectPath("//evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("https://evil.com")).toBe("/dashboard");
    expect(safeRedirectPath("/\\evil.com")).toBe("/dashboard");
  });
});

describe("sections", () => {
  it("normalizes order: keeps user order, drops stale keys, appends missing ones", () => {
    const order = normalizeSectionOrder(["skills", "custom:gone", "experience"], [{ id: "a", title: "A", entries: [] }]);
    expect(order.slice(0, 2)).toEqual(["skills", "experience"]);
    expect(order).not.toContain("custom:gone");
    expect(order).toContain("custom:a");
    expect(new Set(order).size).toBe(order.length);
  });

  it("only shows sections with content that are not hidden", () => {
    const resume = fullResume();
    resume.hiddenSections = ["skills"];
    resume.languages = [];
    const visible = visibleSections(resume);
    expect(visible).not.toContain("skills");
    expect(visible).not.toContain("languages");
    expect(visible).toContain("custom:cs1");
  });
});
