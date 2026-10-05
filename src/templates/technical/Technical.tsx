import type { ResumeContent, SectionKey } from "@/lib/resume/schema";
import { sectionTitle, visibleSections } from "@/lib/resume/sections";

import { contactItems, SectionBody } from "../shared";
import "./technical.css";

/** Technical: engineering-focused single column with skills right after the summary. */
export function TechnicalTemplate({ content }: { content: ResumeContent }) {
  const p = content.personalInfo;
  const contacts = contactItems(content);
  const sections = visibleSections(content);
  // Technical recruiters scan the stack first, so skills move up under the summary.
  const ordered: SectionKey[] = sections.includes("skills")
    ? [
        ...sections.filter((k) => k === "summary"),
        "skills",
        ...sections.filter((k) => k !== "summary" && k !== "skills"),
      ]
    : sections;
  return (
    <div className="rs-technical">
      <header className="rs-header">
        <h1 className="rs-name">{p.fullName || "Your Name"}</h1>
        {p.professionalTitle ? <p className="rs-title">{p.professionalTitle}</p> : null}
        {contacts.length ? (
          <ul className="rs-contact">
            {contacts.map((c) => (
              <li key={c.key}>{c.node}</li>
            ))}
          </ul>
        ) : null}
      </header>
      {ordered.map((key) => (
        <section key={key} className="rs-section">
          <h2 className="rs-section-title">{sectionTitle(key, content.customSections)}</h2>
          <SectionBody sectionKey={key} content={content} />
        </section>
      ))}
    </div>
  );
}
