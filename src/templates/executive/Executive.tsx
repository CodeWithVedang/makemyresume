/* eslint-disable @next/next/no-img-element -- data URL photo; next/image adds nothing here */
import type { ResumeContent } from "@/lib/resume/schema";
import { sectionTitle, visibleSections } from "@/lib/resume/sections";

import { contactItems, SectionBody } from "../shared";
import "./executive.css";

const EXECUTIVE_TITLES: Partial<Record<string, string>> = {
  summary: "Executive Profile",
  skills: "Core Competencies",
  experience: "Professional Experience",
};

/** Executive: commanding centered header, profile emphasis, competencies grid. */
export function ExecutiveTemplate({ content }: { content: ResumeContent }) {
  const p = content.personalInfo;
  const contacts = contactItems(content);
  return (
    <div className="rs-executive">
      <header className="rs-header">
        {p.photo ? <img className="rs-photo" src={p.photo} alt="" /> : null}
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
        <section key={key} className={`rs-section rs-section-${key.split(":")[0]}`}>
          <h2 className="rs-section-title">
            <span>{EXECUTIVE_TITLES[key] ?? sectionTitle(key, content.customSections)}</span>
          </h2>
          <SectionBody sectionKey={key} content={content} skillStyle="grid" />
        </section>
      ))}
    </div>
  );
}
