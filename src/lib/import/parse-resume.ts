import { defaultSettings, emptyResumeContent } from "@/lib/resume/defaults";
import { createId } from "@/lib/resume/ids";
import { isSafeUrl } from "@/lib/resume/links";
import type {
  Achievement,
  Certification,
  CustomSection,
  Education,
  Experience,
  Language,
  Project,
  ResumeContent,
  Skill,
  VolunteerExperience,
} from "@/lib/resume/schema";

/**
 * Heuristic, rule-based resume parser. It only rearranges text that exists in
 * the uploaded document — it never invents content. Results are always shown
 * to the user for review, and every section reports how confident we are.
 */

export type SectionStatus = "found" | "review" | "missing";

export type ImportReportItem = {
  key: string;
  label: string;
  status: SectionStatus;
  note?: string;
};

export type ImportResult = {
  content: ResumeContent;
  report: ImportReportItem[];
  /** Text we could not place in any section, shown so nothing is silently lost. */
  unplaced: string;
};

type SectionId =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages"
  | "volunteer"
  | "custom";

const HEADINGS: Array<[Exclude<SectionId, "custom">, RegExp]> = [
  ["summary", /^(professional\s+)?(summary|profile)$|^about(\s+me)?$|^(career\s+)?objective$|^personal\s+statement$/],
  ["experience", /^((professional|work|relevant)\s+)?experience$|^employment(\s+history)?$|^work\s+history$|^career\s+history$/],
  ["education", /^education(\s+(and|&)\s+training)?$|^academic\s+(background|qualifications)$|^qualifications$/],
  ["skills", /^((technical|key|core|professional)\s+)?skills(\s+(and|&)\s+\w+)?$|^core\s+competencies$|^technologies$|^tech(nical)?\s+stack$|^expertise$/],
  ["projects", /^((personal|selected|academic|key)\s+)?projects$/],
  ["certifications", /^certifications?$|^licen[cs]es?(\s+(and|&)\s+certifications?)?$|^certificates$|^courses(\s+(and|&)\s+certifications?)?$/],
  ["achievements", /^(achievements|awards|honou?rs|accomplishments)(\s+(and|&)\s+\w+)?$/],
  ["languages", /^languages?$/],
  ["volunteer", /^volunteer(ing|\s+experience|\s+work)?$|^community(\s+involvement)?$/],
];

const CUSTOM_HEADINGS = /^(publications|interests|hobbies|research|conferences|talks|references|activities|extracurricular activities|patents|memberships|leadership)$/;

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", sept: "09", oct: "10", nov: "11", dec: "12",
};

const MONTH_ALT = "jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?";
const MONTH_WORD = `(${MONTH_ALT})`;
const DATE_TOKEN = `(?:(?:${MONTH_ALT})\\.?\\s*,?\\s*\\d{4}|\\d{1,2}[/.-]\\d{4}|\\d{4}[/.-]\\d{1,2}|\\d{4})`;
const RANGE = new RegExp(
  `(${DATE_TOKEN})\\s*(?:-|–|—|to|until)\\s*(${DATE_TOKEN}|present|current|now|ongoing|today)`,
  "i",
);
const SINGLE_DATE = new RegExp(`(${DATE_TOKEN})`, "i");

const EMAIL = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
const PHONE = /(\+?\d[\d\s().-]{7,}\d)/;
const URL_RE = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s,;|]*)?)/gi;
const BULLET = /^\s*(?:[-•*▪◦·●○■□➢➤►>]|\d+[.)])\s+/;

const clamp = (value: string, max: number) => value.trim().slice(0, max);

/** "PUBLICATIONS" -> "Publications"; mixed-case headings are kept as written. */
const titleCase = (value: string) =>
  value === value.toUpperCase() ? value.toLowerCase().replace(/\b\w/g, (ch) => ch.toUpperCase()) : value;

function normalizeHeading(line: string): string {
  return line
    .toLowerCase()
    .replace(/[:|_*#=]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectHeading(line: string): SectionId | null {
  if (line.length > 45 || BULLET.test(line)) return null;
  const h = normalizeHeading(line);
  for (const [id, re] of HEADINGS) if (re.test(h)) return id;
  if (CUSTOM_HEADINGS.test(h)) return "custom";
  return null;
}

/** "Mar 2021" | "03/2021" | "2021" -> "YYYY-MM". Year-only dates get January and are flagged. */
export function toMonth(token: string, flags?: { yearOnly: boolean }): string {
  const t = token.trim().toLowerCase().replace(/\./g, "");
  let m = new RegExp(`^${MONTH_WORD}\\s*,?\\s*(\\d{4})$`).exec(t);
  if (m) return `${m[2]}-${MONTHS[m[1].slice(0, m[1].startsWith("sept") ? 4 : 3)] ?? "01"}`;
  m = /^(\d{1,2})[/-](\d{4})$/.exec(t);
  if (m && Number(m[1]) >= 1 && Number(m[1]) <= 12) return `${m[2]}-${m[1].padStart(2, "0")}`;
  m = /^(\d{4})[/-](\d{1,2})$/.exec(t);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return `${m[1]}-${m[2].padStart(2, "0")}`;
  m = /^(\d{4})$/.exec(t);
  if (m) {
    if (flags) flags.yearOnly = true;
    return `${m[1]}-01`;
  }
  return "";
}

type Range = { start: string; end: string; current: boolean; raw: string };

function findRange(line: string, flags: { yearOnly: boolean }): Range | null {
  const m = RANGE.exec(line);
  if (m) {
    const endRaw = m[2].toLowerCase();
    const current = /present|current|now|ongoing|today/.test(endRaw);
    return { start: toMonth(m[1], flags), end: current ? "" : toMonth(m[2], flags), current, raw: m[0] };
  }
  return null;
}

function findSingleDate(line: string, flags: { yearOnly: boolean }): { value: string; raw: string } | null {
  const m = SINGLE_DATE.exec(line);
  if (!m) return null;
  const value = toMonth(m[1], flags);
  return value ? { value, raw: m[0] } : null;
}

function stripBullet(line: string): string {
  return line.replace(BULLET, "").trim();
}

function cleanSegment(text: string): string {
  return text.replace(/^[\s,|–—-]+|[\s,|–—-]+$/g, "").replace(/\s{2,}/g, " ").trim();
}

/** Splits a header like "Engineer at Acme" or "Engineer | Acme | Remote". */
function splitHeader(text: string): string[] {
  const at = /^(.+?)\s+(?:at|@)\s+(.+)$/i.exec(text);
  if (at) return [at[1], at[2]].map(cleanSegment);
  return text
    .split(/\s+[|–—]\s+|\s+-\s+|\s*\|\s*|,\s+(?=[A-Z])/)
    .map(cleanSegment)
    .filter(Boolean);
}

const LOCATION_HINT = /^(remote|hybrid|on-?site|[A-Z][a-zA-Z .'-]+,\s*[A-Z][a-zA-Z .'-]+)$/;

type Block = { headerLines: string[]; range: Range | null; body: string[] };

/**
 * Groups section lines into entries. An entry starts at a non-bullet line that
 * either contains a date range or directly precedes one.
 */
function splitEntries(lines: string[], flags: { yearOnly: boolean }): Block[] {
  const isDate = lines.map((l) => RANGE.test(l));
  const starts = new Set<number>();
  lines.forEach((line, i) => {
    if (!isDate[i]) return;
    const prev = i - 1;
    const remainder = cleanSegment(line.replace(RANGE, ""));
    if (prev >= 0 && !BULLET.test(lines[prev]) && !isDate[prev] && !starts.has(prev) && remainder.length < 4) {
      starts.add(prev);
      // A two-line header ("Title" / "Company" / dates) is common.
      const prev2 = i - 2;
      if (prev2 >= 0 && !BULLET.test(lines[prev2]) && !isDate[prev2] && lines[prev2].length < 70 && (prev2 === 0 || BULLET.test(lines[prev2 - 1]) || isDate[prev2 - 1] || lines[prev2 - 1] === "")) {
        starts.delete(prev);
        starts.add(prev2);
      }
    } else {
      starts.add(i);
    }
  });

  if (starts.size === 0) {
    const text = lines.filter(Boolean);
    return text.length ? [{ headerLines: text.slice(0, 1).map(stripBullet), range: null, body: text.slice(1) }] : [];
  }

  const sorted = [...starts].sort((a, b) => a - b);
  const blocks: Block[] = [];
  // Lines before the first entry are kept with it so nothing is dropped.
  sorted.forEach((start, idx) => {
    const from = idx === 0 ? 0 : start;
    const to = sorted[idx + 1] ?? lines.length;
    const chunk = lines.slice(from, to).filter((l) => l !== "");
    const block: Block = { headerLines: [], range: null, body: [] };
    let inBody = false;
    for (const line of chunk) {
      const range = block.range ? null : findRange(line, flags);
      if (range) {
        block.range = range;
        const rest = cleanSegment(line.replace(range.raw, ""));
        if (rest && !inBody) block.headerLines.push(rest);
        continue;
      }
      if (!inBody && !BULLET.test(line) && block.headerLines.length < 3 && line.length < 90) {
        block.headerLines.push(line);
      } else {
        inBody = true;
        block.body.push(line);
      }
    }
    blocks.push(block);
  });
  return blocks;
}

function bodyText(lines: string[]): string {
  return lines
    .map((l) => (BULLET.test(l) ? `- ${stripBullet(l)}` : l))
    .join("\n")
    .trim();
}

function headerParts(block: Block): { parts: string[]; location: string } {
  const parts = block.headerLines.flatMap(splitHeader);
  let location = "";
  const idx = parts.findIndex((p, i) => i > 0 && LOCATION_HINT.test(p));
  if (idx > 0) location = parts.splice(idx, 1)[0];
  return { parts, location };
}

const EDU_INSTITUTION = /universit|college|institute|school|academy|polytechnic|iit\b|iim\b/i;
const EDU_DEGREE = /\b(bachelor|master|b\.?\s?sc|m\.?\s?sc|b\.?\s?tech|m\.?\s?tech|b\.?\s?e\b|m\.?\s?e\b|b\.?\s?a\b|m\.?\s?a\b|b\.?\s?s\b|m\.?\s?s\b|bba|mba|ph\.?\s?d|diploma|associate|bcom|mcom|high school|secondary|hsc|ssc|pgp|pgdm|bmath)/i;
const GRADE = /\b(gpa|cgpa|grade|percentage|score)\b[:\s]*([\d.]+\s*(?:\/\s*[\d.]+)?%?)|(\d{1,2}(?:\.\d+)?\s*%)|(first class(?: with distinction)?|distinction|honou?rs)/i;

// --- Section parsers ----------------------------------------------------------

function parseExperience(lines: string[], flags: { yearOnly: boolean }): Experience[] {
  return splitEntries(lines, flags).map((block) => {
    const { parts, location } = headerParts(block);
    const type = /intern/i.test(block.headerLines.join(" "))
      ? "INTERNSHIP"
      : /freelance/i.test(block.headerLines.join(" "))
        ? "FREELANCE"
        : /contract/i.test(block.headerLines.join(" "))
          ? "CONTRACT"
          : /part[- ]time/i.test(block.headerLines.join(" "))
            ? "PART_TIME"
            : "FULL_TIME";
    return {
      id: createId(),
      jobTitle: clamp(parts[0] ?? "", 120),
      company: clamp(parts[1] ?? "", 120),
      location: clamp(location || parts[2] || "", 120),
      employmentType: type,
      startDate: block.range?.start ?? "",
      endDate: block.range?.end ?? "",
      current: block.range?.current ?? false,
      description: clamp(bodyText([...parts.slice(3), ...block.body]), 5000),
    };
  });
}

function parseVolunteer(lines: string[], flags: { yearOnly: boolean }): VolunteerExperience[] {
  return parseExperience(lines, flags).map((e) => ({
    id: e.id,
    role: e.jobTitle,
    organization: e.company,
    startDate: e.startDate,
    endDate: e.current ? "" : e.endDate,
    description: e.description,
  }));
}

function parseEducation(lines: string[], flags: { yearOnly: boolean }): Education[] {
  return splitEntries(lines, flags).map((block) => {
    const all = block.headerLines.flatMap(splitHeader);
    const institution = all.find((p) => EDU_INSTITUTION.test(p)) ?? "";
    const degreeLine = all.find((p) => p !== institution && EDU_DEGREE.test(p)) ?? all.find((p) => p !== institution) ?? "";
    let degree = degreeLine;
    let field = "";
    const inMatch = /^(.+?)\s+(?:in|of)\s+(.+)$/i.exec(degreeLine);
    if (inMatch && EDU_DEGREE.test(inMatch[1])) {
      degree = inMatch[1];
      field = inMatch[2];
    }
    const text = [...block.headerLines, ...block.body].join(" ");
    const grade = GRADE.exec(text);
    const rest = all.filter((p) => p !== institution && p !== degreeLine);
    const location = rest.find((p) => LOCATION_HINT.test(p)) ?? "";
    return {
      id: createId(),
      institution: clamp(institution || (degreeLine === all[0] ? all[1] ?? "" : all[0] ?? ""), 160),
      degree: clamp(degree, 160),
      fieldOfStudy: clamp(field, 160),
      location: clamp(location, 120),
      startDate: block.range?.start ?? "",
      endDate: block.range?.current ? "" : (block.range?.end ?? ""),
      grade: clamp(grade ? (grade[2] ?? grade[3] ?? grade[4] ?? "") : "", 60),
      description: clamp(bodyText(block.body), 3000),
    };
  });
}

function parseSkills(lines: string[]): Skill[] {
  const skills: Skill[] = [];
  const seen = new Set<string>();
  for (const raw of lines) {
    if (!raw) continue;
    const line = stripBullet(raw);
    const cat = /^([A-Za-z][\w &/+-]{1,40}):\s*(.+)$/.exec(line);
    const category = cat ? cat[1].trim() : "";
    const list = (cat ? cat[2] : line).split(/\s*[,;|•·]\s*|\s{3,}/);
    for (const item of list) {
      const name = item.replace(/\.$/, "").trim();
      const key = `${category}|${name.toLowerCase()}`;
      if (name && name.length <= 60 && !seen.has(key)) {
        seen.add(key);
        skills.push({ id: createId(), name, category: clamp(category, 60) });
      }
    }
  }
  return skills.slice(0, 100);
}

function parseLanguages(lines: string[]): Language[] {
  const result: Language[] = [];
  for (const raw of lines) {
    if (!raw) continue;
    for (const item of stripBullet(raw).split(/\s*[,;|•]\s*/)) {
      const m = /^([A-Za-zÀ-ÿ ]{2,30}?)\s*(?:\(([^)]+)\)|[-–:]\s*(.+))?$/.exec(item.trim());
      if (m) result.push({ id: createId(), name: clamp(m[1], 60), proficiency: clamp(m[2] ?? m[3] ?? "", 60) });
    }
  }
  return result.slice(0, 20);
}

function parseCertifications(lines: string[], flags: { yearOnly: boolean }): Certification[] {
  return lines
    .filter(Boolean)
    .map((raw) => {
      let line = stripBullet(raw);
      const range = findRange(line, flags);
      let issueDate = "";
      let expiryDate = "";
      if (range) {
        issueDate = range.start;
        expiryDate = range.end;
        line = line.replace(range.raw, "");
      } else {
        const d = findSingleDate(line, flags);
        if (d) {
          issueDate = d.value;
          line = line.replace(d.raw, "");
        }
      }
      const urls = line.match(URL_RE) ?? [];
      const url = urls.find((u) => isSafeUrl(u) && /\//.test(u)) ?? "";
      if (url) line = line.replace(url, "");
      const parts = splitHeader(cleanSegment(line));
      return {
        id: createId(),
        name: clamp(parts[0] ?? "", 160),
        issuer: clamp(parts.slice(1).join(", "), 160),
        issueDate,
        expiryDate,
        credentialId: "",
        credentialUrl: clamp(url, 500),
      };
    })
    .filter((c) => c.name)
    .slice(0, 30);
}

function parseAchievements(lines: string[], flags: { yearOnly: boolean }): Achievement[] {
  const items: Achievement[] = [];
  for (const raw of lines) {
    if (!raw) continue;
    let line = stripBullet(raw);
    const d = findSingleDate(line, flags);
    if (d && /\d{4}/.test(d.raw)) line = cleanSegment(line.replace(d.raw, ""));
    const [title, ...rest] = line.split(/\s+[–—-]\s+|:\s+/);
    if (!BULLET.test(raw) && items.length && !d && line.length > 60) {
      const last = items[items.length - 1];
      last.description = clamp(`${last.description}\n${line}`, 2000);
      continue;
    }
    items.push({ id: createId(), title: clamp(title, 160), description: clamp(rest.join(" - "), 2000), date: d?.value ?? "" });
  }
  return items.slice(0, 30);
}

function parseProjects(lines: string[], flags: { yearOnly: boolean }): Project[] {
  // Projects usually have no dates: split on non-bullet header lines instead.
  const blocks: string[][] = [];
  for (const line of lines) {
    if (!line) continue;
    const header = !BULLET.test(line) && line.length < 90 && !/^(tech|technologies|tools|stack|built with)\b/i.test(line);
    if (header && (blocks.length === 0 || blocks[blocks.length - 1].some((l) => BULLET.test(l) || l.length >= 90))) blocks.push([line]);
    else if (blocks.length === 0) blocks.push([line]);
    else blocks[blocks.length - 1].push(line);
  }
  return blocks
    .map((block) => {
      let header = block[0];
      const range = findRange(header, flags);
      if (range) header = cleanSegment(header.replace(range.raw, ""));
      const urls = block.join(" ").match(URL_RE)?.filter((u) => isSafeUrl(u) && /\//.test(u)) ?? [];
      const github = urls.find((u) => /github\.com/i.test(u)) ?? "";
      const url = urls.find((u) => u !== github) ?? "";
      const techLine = block.find((l) => /^(?:[-•*]\s*)?(tech(nologies)?|tools|stack|built with)\s*[:-]/i.test(l));
      const technologies = techLine
        ? techLine.replace(/^(?:[-•*]\s*)?[^:-]+[:-]\s*/, "").split(/\s*[,;|]\s*/).filter(Boolean).slice(0, 30).map((t) => clamp(t, 40))
        : [];
      const parts = splitHeader(header.replace(URL_RE, "").trim());
      const body = block.slice(1).filter((l) => l !== techLine);
      return {
        id: createId(),
        name: clamp(parts[0] ?? header, 120),
        role: clamp(parts[1] ?? "", 120),
        description: clamp(bodyText(body).replace(URL_RE, (m) => (urls.includes(m) ? "" : m)).trim(), 4000),
        technologies,
        startDate: range?.start ?? "",
        endDate: range?.current ? "" : (range?.end ?? ""),
        url: clamp(url, 500),
        githubUrl: clamp(github, 500),
      };
    })
    .filter((p) => p.name)
    .slice(0, 30);
}

// --- Main -------------------------------------------------------------------

export function parseResumeText(input: string, fileTitle = "Imported Resume"): ImportResult {
  const flags = { yearOnly: false };
  const expFlags = { yearOnly: false };
  const lines = input
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim());

  // Bucket lines by detected section heading.
  const buckets = new Map<SectionId, string[]>();
  const customs: Array<{ title: string; lines: string[] }> = [];
  const header: string[] = [];
  let current: SectionId | "header" = "header";
  let currentCustom: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const heading = line ? detectHeading(line) : null;
    if (heading) {
      current = heading;
      if (heading === "custom") {
        currentCustom = { title: line.replace(/[:]+$/, "").trim(), lines: [] };
        customs.push(currentCustom);
      }
      continue;
    }
    if (current === "header") header.push(line);
    else if (current === "custom") currentCustom?.lines.push(line);
    else buckets.set(current, [...(buckets.get(current) ?? []), line]);
  }

  // Personal info from the header block (and email/phone/links anywhere at the top).
  const content = emptyResumeContent(fileTitle);
  const p = content.personalInfo;
  const headerText = header.filter(Boolean);
  const topText = [...headerText, ...lines.slice(0, 15)].join("\n");
  p.email = clamp(EMAIL.exec(topText)?.[0] ?? "", 254);
  const phone = PHONE.exec(topText.replace(EMAIL, ""))?.[1];
  p.phone = phone && phone.replace(/\D/g, "").length >= 8 ? clamp(phone, 40) : "";

  const urls = [...topText.matchAll(URL_RE)].map((m) => m[1]).filter((u) => !EMAIL.test(u) && !topText.includes(`${u}@`) && isSafeUrl(u) && !/^\d/.test(u));
  for (const u of urls) {
    if (/linkedin\.com/i.test(u) && !p.linkedin) p.linkedin = clamp(u, 500);
    else if (/github\.com/i.test(u) && !p.github) p.github = clamp(u, 500);
    else if (!p.website && /\.[a-z]{2,}/i.test(u) && !p.email.endsWith(u)) p.website = clamp(u, 500);
  }

  const contactLike = (l: string) => EMAIL.test(l) || PHONE.test(l) || /linkedin|github|https?:|www\./i.test(l);
  const nameLine = headerText.find((l) => !contactLike(l) && /^[\p{L}][\p{L}'’. -]{1,60}$/u.test(l) && l.split(/\s+/).length <= 5);
  if (nameLine) {
    p.fullName = clamp(nameLine, 120);
    const after = headerText.slice(headerText.indexOf(nameLine) + 1).find((l) => !contactLike(l) && l.length <= 80);
    if (after && !/,/.test(after.replace(/,\s*[A-Z]{2}$/, ""))) p.professionalTitle = clamp(after, 120);
  }
  const locationLine = headerText
    .flatMap((l) => l.split(/\s*[|•·]\s*/))
    .find((s) => !contactLike(s) && /^[A-Z][\w .'-]+,\s*[A-Z][\w .'-]+$/.test(s) && s !== p.fullName);
  if (locationLine) p.location = clamp(locationLine, 120);

  const get = (id: SectionId) => (buckets.get(id) ?? []).map((l) => l);
  const summaryLines = get("summary").filter(Boolean);
  content.summary = clamp(summaryLines.join(" "), 3000);
  content.experience = parseExperience(get("experience"), expFlags).slice(0, 30);
  content.education = parseEducation(get("education"), flags).slice(0, 20);
  content.skills = parseSkills(get("skills"));
  content.projects = parseProjects(get("projects"), flags);
  content.certifications = parseCertifications(get("certifications"), flags);
  content.achievements = parseAchievements(get("achievements"), flags);
  content.languages = parseLanguages(get("languages"));
  content.volunteerExperience = parseVolunteer(get("volunteer"), flags).slice(0, 20);
  content.customSections = customs
    .filter((c) => c.lines.some(Boolean))
    .slice(0, 10)
    .map(
      (c): CustomSection => ({
        id: createId(),
        title: clamp(titleCase(c.title), 60) || "Other",
        entries: [{ id: createId(), title: "", subtitle: "", date: "", description: clamp(bodyText(c.lines.filter(Boolean)), 3000) }],
      }),
    );
  content.sectionOrder = [...content.sectionOrder, ...content.customSections.map((c) => `custom:${c.id}` as const)];
  content.settings = { ...defaultSettings };

  // Fix impossible ranges rather than block saving; flag them for review.
  let rangeIssue = false;
  const fixRange = <T extends { startDate: string; endDate: string }>(e: T): T => {
    if (e.startDate && e.endDate && e.endDate < e.startDate) {
      rangeIssue = true;
      return { ...e, endDate: "" };
    }
    return e;
  };
  content.experience = content.experience.map(fixRange);
  content.education = content.education.map(fixRange);
  content.projects = content.projects.map(fixRange);
  content.volunteerExperience = content.volunteerExperience.map(fixRange);

  const unplaced = buckets.size === 0 && customs.length === 0 ? lines.filter(Boolean).slice(headerText.length).join("\n") : "";
  if (unplaced && !content.summary) {
    // No headings found at all: keep the text visible so the user can move it.
    content.customSections.push({
      id: createId(),
      title: "Imported text",
      entries: [{ id: createId(), title: "", subtitle: "", date: "", description: clamp(unplaced, 3000) }],
    });
    content.sectionOrder.push(`custom:${content.customSections[content.customSections.length - 1].id}`);
  }

  const status = (count: number, review: boolean): SectionStatus => (count === 0 ? "missing" : review ? "review" : "found");
  const datesNote = expFlags.yearOnly ? "Some dates only had a year; we used January. Please check." : undefined;
  const experienceReview = content.experience.some((e) => !e.jobTitle || !e.company || !e.startDate) || expFlags.yearOnly || rangeIssue;

  const report: ImportReportItem[] = [
    {
      key: "personal",
      label: "Personal Information",
      status: !p.fullName && !p.email ? "missing" : !p.fullName || !p.email ? "review" : "found",
      note: !p.fullName ? "We couldn't identify your name." : !p.email ? "No email address found." : undefined,
    },
    { key: "summary", label: "Summary", status: status(content.summary ? 1 : 0, false) },
    {
      key: "experience",
      label: "Experience",
      status: status(content.experience.length, experienceReview),
      note: experienceReview ? (datesNote ?? "Check job titles, companies and dates.") : undefined,
    },
    {
      key: "education",
      label: "Education",
      status: status(content.education.length, content.education.some((e) => !e.institution)),
    },
    { key: "skills", label: "Skills", status: status(content.skills.length, false) },
    { key: "projects", label: "Projects", status: status(content.projects.length, content.projects.length > 0) , note: content.projects.length ? "Project boundaries are hard to detect. Please review." : undefined },
    { key: "certifications", label: "Certifications", status: status(content.certifications.length, false) },
    { key: "achievements", label: "Achievements", status: status(content.achievements.length, false) },
    { key: "languages", label: "Languages", status: status(content.languages.length, false) },
    { key: "volunteer", label: "Volunteer Experience", status: status(content.volunteerExperience.length, content.volunteerExperience.length > 0) },
  ];

  return { content, report, unplaced };
}
