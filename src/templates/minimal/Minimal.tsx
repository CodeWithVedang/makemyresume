import type { ResumeContent } from "@/lib/resume/schema";
import { sectionTitle, visibleSections } from "@/lib/resume/sections";

import { contactItems, SectionBody } from "../shared";
import "./minimal.css";

/** Minimal ATS: light header, section labels in a narrow side column. */
export function MinimalTemplate({ content }: { content: ResumeContent }) {
  const p = content.personalInfo;
  const contacts = contactItems(content);
  return (
    <div className="rs-minimal">
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
      {visibleSections(content).map((key) => (
        <section key={key} className="rs-section">
          <h2 className="rs-section-title">{sectionTitle(key, content.customSections)}</h2>
          <div className="rs-section-content">
            <SectionBody sectionKey={key} content={content} skillStyle="inline" />
          </div>
        </section>
      ))}
    </div>
  );
}
