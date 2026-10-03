import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { templateIds } from "@/lib/resume/schema";
import { templates } from "@/templates/registry";
import { ResumeRenderer } from "@/templates/ResumeRenderer";

import { fullResume } from "./fixtures";

/** Every user-entered value that must survive in every template. */
function expectedText(): string[] {
  const r = fullResume();
  const p = r.personalInfo;
  return [
    p.fullName,
    p.professionalTitle,
    p.email,
    p.phone,
    p.location,
    "averyquinn.example.com",
    "linkedin.com/in/avery-quinn-example",
    "github.com/avery-quinn-example",
    "portfolio.example.com/avery",
    "blog.example.com",
    r.summary,
    ...r.experience.flatMap((e) => [e.jobTitle, e.company, e.location, `Bullet point for role ${e.id.slice(-1)}`]),
    ...r.education.flatMap((e) => [e.institution, e.degree, e.fieldOfStudy, e.grade]),
    ...r.skills.map((s) => s.name),
    ...r.projects.flatMap((p) => [p.name, p.role, p.description, ...p.technologies]),
    "Certification Name One",
    "Issuer Org",
    "CRED123",
    "Achievement Title",
    "Achievement detail",
    "LanguageOne",
    "Fluent",
    "Volunteer Org",
    "Volunteer Role",
    "Publications",
    "Paper Title",
    "Journal Name",
    "Paper detail",
  ];
}

describe("template switching", () => {
  it("has a renderer for every registered template", () => {
    expect(templates.map((t) => t.id).sort()).toEqual([...templateIds].sort());
  });

  it.each(templateIds)("%s renders all resume data (no data loss)", (templateId) => {
    const content = { ...fullResume(), templateId };
    const html = renderToStaticMarkup(<ResumeRenderer content={content} />);
    const missing = expectedText().filter((text) => !html.includes(text));
    expect(missing).toEqual([]);
  });

  it("switching through every template leaves the content untouched", () => {
    const original = fullResume();
    let current = structuredClone(original);
    for (const templateId of [...templateIds, "classic" as const]) {
      current = { ...current, templateId };
      renderToStaticMarkup(<ResumeRenderer content={current} />);
    }
    expect({ ...current, templateId: original.templateId }).toEqual(original);
  });

  it("hidden sections are not rendered but remain in the data", () => {
    const content = { ...fullResume(), hiddenSections: ["projects" as const] };
    const html = renderToStaticMarkup(<ResumeRenderer content={content} />);
    expect(html).not.toContain("Project Name 1");
    expect(content.projects).toHaveLength(3);
  });

  it("never renders unsafe link schemes", () => {
    const content = fullResume();
    content.personalInfo.website = "javascript:alert(1)";
    const html = renderToStaticMarkup(<ResumeRenderer content={content} />);
    expect(html).not.toContain('href="javascript:');
  });

  it("renders user text as text, not HTML", () => {
    const content = fullResume();
    content.summary = "<img src=x onerror=alert(1)>";
    const html = renderToStaticMarkup(<ResumeRenderer content={content} />);
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img");
  });
});
