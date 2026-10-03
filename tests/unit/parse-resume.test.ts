import { describe, expect, it } from "vitest";

import { parseResumeText, toMonth } from "@/lib/import/parse-resume";
import { resumeContentSchema } from "@/lib/resume/schema";

const SAMPLE = `Jordan Lee
Backend Engineer
jordan.lee@example.com | +1 415 555 0134 | San Francisco, CA
linkedin.com/in/jordanlee-example | github.com/jordanlee-example

SUMMARY
Backend engineer with six years of experience building payment systems.

EXPERIENCE
Senior Backend Engineer
Paylane Inc.
Mar 2021 – Present
- Designed the ledger service handling 2M transactions per day
- Led migration from MySQL to PostgreSQL

Software Engineer | Orbit Labs | Remote
06/2018 - 02/2021
• Built internal billing APIs in Go

EDUCATION
University of Washington
B.S. in Computer Science
2014 - 2018
GPA: 3.7/4.0

SKILLS
Languages: Go, Python, TypeScript
Databases: PostgreSQL, Redis

PROJECTS
Ledger Viz
- Visualization of double-entry ledgers
Tech: React, D3

CERTIFICATIONS
AWS Certified Solutions Architect - Amazon Web Services, 2022

LANGUAGES
English (Native), Spanish (Intermediate)

PUBLICATIONS
"Idempotency at scale", Payments Engineering Blog, 2023
`;

describe("parseResumeText", () => {
  const result = parseResumeText(SAMPLE, "Imported");
  const c = result.content;

  it("extracts personal information", () => {
    expect(c.personalInfo.fullName).toBe("Jordan Lee");
    expect(c.personalInfo.professionalTitle).toBe("Backend Engineer");
    expect(c.personalInfo.email).toBe("jordan.lee@example.com");
    expect(c.personalInfo.phone).toContain("415");
    expect(c.personalInfo.location).toBe("San Francisco, CA");
    expect(c.personalInfo.linkedin).toContain("linkedin.com/in/jordanlee-example");
    expect(c.personalInfo.github).toContain("github.com/jordanlee-example");
  });

  it("extracts experience entries with dates and bullets", () => {
    expect(c.experience).toHaveLength(2);
    expect(c.experience[0]).toMatchObject({
      jobTitle: "Senior Backend Engineer",
      company: "Paylane Inc.",
      startDate: "2021-03",
      current: true,
    });
    expect(c.experience[0].description).toContain("- Designed the ledger service");
    expect(c.experience[1]).toMatchObject({
      jobTitle: "Software Engineer",
      company: "Orbit Labs",
      location: "Remote",
      startDate: "2018-06",
      endDate: "2021-02",
    });
  });

  it("extracts education, skills, languages and certifications", () => {
    expect(c.education[0].institution).toBe("University of Washington");
    expect(c.education[0].degree).toBe("B.S.");
    expect(c.education[0].fieldOfStudy).toBe("Computer Science");
    expect(c.education[0].grade).toContain("3.7");
    expect(c.skills.map((s) => s.name)).toEqual(["Go", "Python", "TypeScript", "PostgreSQL", "Redis"]);
    expect(c.skills[0].category).toBe("Languages");
    expect(c.languages).toEqual([
      expect.objectContaining({ name: "English", proficiency: "Native" }),
      expect.objectContaining({ name: "Spanish", proficiency: "Intermediate" }),
    ]);
    expect(c.certifications[0]).toMatchObject({ name: "AWS Certified Solutions Architect", issueDate: "2022-01" });
    expect(c.projects[0]).toMatchObject({ name: "Ledger Viz", technologies: ["React", "D3"] });
  });

  it("keeps unknown sections as custom sections instead of dropping them", () => {
    expect(c.customSections[0].title).toBe("Publications");
    expect(c.customSections[0].entries[0].description).toContain("Idempotency at scale");
  });

  it("produces content that passes the resume schema", () => {
    expect(resumeContentSchema.safeParse(c).success).toBe(true);
  });

  it("reports sections for review", () => {
    const status = Object.fromEntries(result.report.map((r) => [r.key, r.status]));
    expect(status.personal).toBe("found");
    expect(status.volunteer).toBe("missing");
    expect(status.projects).toBe("review");
  });

  it("never invents content for an empty document", () => {
    const empty = parseResumeText("", "Empty");
    expect(empty.content.experience).toEqual([]);
    expect(empty.content.personalInfo.fullName).toBe("");
    expect(empty.report.find((r) => r.key === "personal")?.status).toBe("missing");
  });
});

describe("toMonth", () => {
  it.each([
    ["Mar 2021", "2021-03"],
    ["September 2020", "2020-09"],
    ["Sept. 2020", "2020-09"],
    ["03/2019", "2019-03"],
    ["2019-11", "2019-11"],
    ["2018", "2018-01"],
    ["13/2019", ""],
  ])("%s -> %s", (input, expected) => {
    expect(toMonth(input)).toBe(expected);
  });
});

describe("parse edge cases", () => {
  it("does not mistake the email local part for a website", () => {
    const r = parseResumeText("Jordan Lee\njordan.lee@example.com\n\nSKILLS\nGo", "x");
    expect(r.content.personalInfo.website).toBe("");
  });
});
