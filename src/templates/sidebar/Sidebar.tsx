/* eslint-disable @next/next/no-img-element -- data URL photo; next/image adds nothing here */
import type { ResumeContent, SectionKey } from "@/lib/resume/schema";
import { sectionTitle, visibleSections } from "@/lib/resume/sections";

import { contactItems, SectionBody } from "../shared";
import "./sidebar.css";

const SIDE_SECTIONS = new Set<SectionKey>(["skills", "languages", "certifications", "achievements"]);

/** Sidebar: tinted left column holding identity, contact and reference sections. */
export function SidebarTemplate({ content }: { content: ResumeContent }) {
  const p = content.personalInfo;
  const contacts = contactItems(content);
  const sections = visibleSections(content);
  const side = sections.filter((k) => SIDE_SECTIONS.has(k));
  const main = sections.filter((k) => !SIDE_SECTIONS.has(k));
  return (
    <div className="rs-sidebar-layout">
      <aside className="rs-side">
        {p.photo ? <img className="rs-photo" src={p.photo} alt="" /> : null}
        <h1 className="rs-name">{p.fullName || "Your Name"}</h1>
        {p.professionalTitle ? <p className="rs-title">{p.professionalTitle}</p> : null}
        {contacts.length ? (
          <section className="rs-section">
            <h2 className="rs-section-title">Contact</h2>
            <ul className="rs-contact">
              {contacts.map((c) => (
                <li key={c.key}>
                  <span className="rs-contact-label">{c.label}</span>
                  {c.node}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {side.map((key) => (
          <section key={key} className="rs-section">
            <h2 className="rs-section-title">{sectionTitle(key, content.customSections)}</h2>
            <SectionBody sectionKey={key} content={content} skillStyle="list" />
          </section>
        ))}
      </aside>
      <div className="rs-main">
        {main.map((key) => (
          <section key={key} className="rs-section">
            <h2 className="rs-section-title">{sectionTitle(key, content.customSections)}</h2>
            <SectionBody sectionKey={key} content={content} />
          </section>
        ))}
      </div>
    </div>
  );
}
