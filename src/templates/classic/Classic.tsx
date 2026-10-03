import type { ResumeContent } from "@/lib/resume/schema";
import { sectionTitle, visibleSections } from "@/lib/resume/sections";

import { contactItems, SectionBody } from "../shared";
import "./classic.css";

/** Classic ATS: single column, plain headings, no graphics. */
export function ClassicTemplate({ content }: { content: ResumeContent }) {
  const p = content.personalInfo;
  const contacts = contactItems(content);
  return (
    <div className="rs-classic">
      <header className="rs-header">
        <h1 className="rs-name">{p.fullName || "Your Name"}</h1>
        {p.professionalTitle ? <p className="rs-title">{p.professionalTitle}</p> : null}
        {contacts.length ? (
          <p className="rs-contact">
            {contacts.map((c, i) => (
              <span key={c.key}>
                {i > 0 ? <span className="rs-sep" aria-hidden="true"> | </span> : null}
                {c.node}
              </span>
            ))}
          </p>
        ) : null}
      </header>
      {visibleSections(content).map((key) => (
        <section key={key} className="rs-section">
          <h2 className="rs-section-title">{sectionTitle(key, content.customSections)}</h2>
          <SectionBody sectionKey={key} content={content} />
        </section>
      ))}
    </div>
  );
}
