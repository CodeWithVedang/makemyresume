import type { ReactNode } from "react";

import { formatMonth, formatRange } from "@/lib/resume/dates";
import { displayUrl, toHref } from "@/lib/resume/links";
import type {
  ResumeContent,
  ResumeSettings,
  SectionKey,
  Skill,
} from "@/lib/resume/schema";
import { employmentTypeLabels } from "@/lib/resume/schema";
import { isCustomKey } from "@/lib/resume/sections";

/**
 * Building blocks shared by every template. They render plain text only
 * (never HTML), so user content cannot inject markup.
 */

type DateFormat = ResumeSettings["dateFormat"];

const BULLET = /^\s*[-•*▪◦·]\s+/;

/** Lines starting with "-", "•" or "*" become a list; other lines paragraphs. */
export function RichText({ value, className }: { value: string; className?: string }) {
  const lines = value.split(/\r?\n/).map((l) => l.trimEnd());
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="rs-list">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }
    if (BULLET.test(line)) {
      bullets.push(line.replace(BULLET, ""));
    } else {
      flush();
      blocks.push(
        <p key={`p-${blocks.length}`} className="rs-para">
          {line.trim()}
        </p>,
      );
    }
  }
  flush();
  if (!blocks.length) return null;
  return <div className={className ?? "rs-rich"}>{blocks}</div>;
}

export function ExternalLink({ value, children }: { value: string; children?: ReactNode }) {
  const href = toHref(value);
  if (!href) return <span>{children ?? value}</span>;
  return (
    <a href={href} className="rs-link" target="_blank" rel="noopener noreferrer">
      {children ?? displayUrl(value)}
    </a>
  );
}

export type ContactItem = { key: string; label: string; node: ReactNode };

export function contactItems(content: ResumeContent): ContactItem[] {
  const p = content.personalInfo;
  const items: ContactItem[] = [];
  if (p.email)
    items.push({
      key: "email",
      label: "Email",
      node: (
        <a className="rs-link" href={`mailto:${p.email}`}>
          {p.email}
        </a>
      ),
    });
  if (p.phone)
    items.push({
      key: "phone",
      label: "Phone",
      node: (
        <a className="rs-link" href={`tel:${p.phone.replace(/[^\d+]/g, "")}`}>
          {p.phone}
        </a>
      ),
    });
  if (p.location) items.push({ key: "location", label: "Location", node: <span>{p.location}</span> });
  const links: Array<[string, string, string]> = [
    ["website", "Website", p.website],
    ["linkedin", "LinkedIn", p.linkedin],
    ["github", "GitHub", p.github],
    ["portfolio", "Portfolio", p.portfolio],
  ];
  for (const [key, label, value] of links) {
    if (value) items.push({ key, label, node: <ExternalLink value={value} /> });
  }
  for (const link of p.otherLinks) {
    if (link.url)
      items.push({
        key: link.id,
        label: link.label || "Link",
        node: <ExternalLink value={link.url} />,
      });
  }
  return items;
}

export function groupSkills(skills: Skill[]): Array<{ category: string; names: string[] }> {
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const category = skill.category.trim();
    const list = groups.get(category) ?? [];
    list.push(skill.name);
    groups.set(category, list);
  }
  return [...groups.entries()].map(([category, names]) => ({ category, names }));
}

export function Dates({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <span className="rs-dates">{children}</span>;
}

type EntryProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  dates?: string;
  children?: ReactNode;
};

/**
 * Generic entry: title + right-aligned dates, then subtitle/meta line, then body.
 * Templates restyle `.rs-entry*` classes; "gutter" layouts move dates left via CSS.
 */
export function Entry({ title, subtitle, meta, dates, children }: EntryProps) {
  return (
    <div className="rs-entry">
      <div className="rs-entry-head">
        <div className="rs-entry-main">
          {title ? <h3 className="rs-entry-title">{title}</h3> : null}
          {subtitle ? <div className="rs-entry-subtitle">{subtitle}</div> : null}
          {meta ? <div className="rs-entry-meta">{meta}</div> : null}
        </div>
        {dates ? <Dates>{dates}</Dates> : null}
      </div>
      {children ? <div className="rs-entry-body">{children}</div> : null}
    </div>
  );
}

function joinParts(parts: Array<string | false | undefined>): string {
  return parts.filter(Boolean).join(" · ");
}

export type SkillStyle = "grouped" | "inline" | "list" | "grid";

/** Renders the body of any section. Templates wrap it with their own heading. */
export function SectionBody({
  sectionKey,
  content,
  skillStyle = "grouped",
}: {
  sectionKey: SectionKey;
  content: ResumeContent;
  skillStyle?: SkillStyle;
}) {
  const fmt: DateFormat = content.settings.dateFormat;

  if (isCustomKey(sectionKey)) {
    const id = sectionKey.slice("custom:".length);
    const section = content.customSections.find((s) => s.id === id);
    if (!section) return null;
    return (
      <>
        {section.entries.map((e) => (
          <Entry key={e.id} title={e.title} subtitle={e.subtitle} dates={e.date}>
            <RichText value={e.description} />
          </Entry>
        ))}
      </>
    );
  }

  switch (sectionKey) {
    case "summary":
      return <RichText value={content.summary} className="rs-rich rs-summary" />;

    case "experience":
      return (
        <>
          {content.experience.map((e) => (
            <Entry
              key={e.id}
              title={e.jobTitle}
              subtitle={joinParts([
                e.company,
                e.employmentType !== "FULL_TIME" && employmentTypeLabels[e.employmentType],
              ])}
              meta={e.location}
              dates={formatRange(e.startDate, e.endDate, fmt, e.current)}
            >
              <RichText value={e.description} />
            </Entry>
          ))}
        </>
      );

    case "education":
      return (
        <>
          {content.education.map((e) => (
            <Entry
              key={e.id}
              title={joinParts([e.degree, e.fieldOfStudy]) || e.institution}
              subtitle={joinParts([e.degree || e.fieldOfStudy ? e.institution : "", e.location])}
              meta={e.grade ? `Grade: ${e.grade}` : undefined}
              dates={formatRange(e.startDate, e.endDate, fmt)}
            >
              <RichText value={e.description} />
            </Entry>
          ))}
        </>
      );

    case "skills":
      return <Skills skills={content.skills} style={skillStyle} />;

    case "projects":
      return (
        <>
          {content.projects.map((p) => (
            <Entry
              key={p.id}
              title={p.name}
              subtitle={p.role}
              meta={
                p.url || p.githubUrl ? (
                  <span className="rs-inline-links">
                    {p.url ? <ExternalLink value={p.url} /> : null}
                    {p.githubUrl ? <ExternalLink value={p.githubUrl} /> : null}
                  </span>
                ) : undefined
              }
              dates={formatRange(p.startDate, p.endDate, fmt)}
            >
              <RichText value={p.description} />
              {p.technologies.length ? (
                <p className="rs-tech">
                  <span className="rs-tech-label">Technologies: </span>
                  {p.technologies.join(", ")}
                </p>
              ) : null}
            </Entry>
          ))}
        </>
      );

    case "certifications":
      return (
        <>
          {content.certifications.map((c) => (
            <Entry
              key={c.id}
              title={c.name}
              subtitle={c.issuer}
              meta={
                c.credentialId || c.credentialUrl ? (
                  <span className="rs-inline-links">
                    {c.credentialId ? <span>ID: {c.credentialId}</span> : null}
                    {c.credentialUrl ? <ExternalLink value={c.credentialUrl}>Verify</ExternalLink> : null}
                  </span>
                ) : undefined
              }
              dates={
                c.expiryDate
                  ? formatRange(c.issueDate, c.expiryDate, fmt)
                  : c.issueDate
                    ? formatMonth(c.issueDate, fmt)
                    : undefined
              }
            />
          ))}
        </>
      );

    case "achievements":
      return (
        <>
          {content.achievements.map((a) => (
            <Entry
              key={a.id}
              title={a.title}
              dates={a.date ? formatMonth(a.date, fmt) : undefined}
            >
              <RichText value={a.description} />
            </Entry>
          ))}
        </>
      );

    case "languages":
      return (
        <ul className="rs-languages">
          {content.languages.map((l) => (
            <li key={l.id}>
              <span className="rs-language-name">{l.name}</span>
              {l.proficiency ? <span className="rs-language-level"> — {l.proficiency}</span> : null}
            </li>
          ))}
        </ul>
      );

    case "volunteer":
      return (
        <>
          {content.volunteerExperience.map((v) => (
            <Entry
              key={v.id}
              title={v.role}
              subtitle={v.organization}
              dates={formatRange(v.startDate, v.endDate, fmt)}
            >
              <RichText value={v.description} />
            </Entry>
          ))}
        </>
      );
  }
}

function Skills({ skills, style }: { skills: Skill[]; style: SkillStyle }) {
  const groups = groupSkills(skills);
  if (style === "inline") {
    return <p className="rs-skills-inline">{skills.map((s) => s.name).join(" · ")}</p>;
  }
  if (style === "grid") {
    return (
      <ul className="rs-skills-grid">
        {skills.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    );
  }
  if (style === "list") {
    return (
      <div className="rs-skills-list">
        {groups.map((g) => (
          <div key={g.category || "_"} className="rs-skill-group">
            {g.category ? <h4 className="rs-skill-category">{g.category}</h4> : null}
            <ul>
              {g.names.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="rs-skills-grouped">
      {groups.map((g) => (
        <p key={g.category || "_"} className="rs-skill-row">
          {g.category ? <span className="rs-skill-category">{g.category}: </span> : null}
          <span>{g.names.join(", ")}</span>
        </p>
      ))}
    </div>
  );
}
