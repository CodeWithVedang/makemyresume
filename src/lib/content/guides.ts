/**
 * Long-form guides for search. Plain, useful advice; no invented statistics.
 * Blocks render as headings, paragraphs and bullet lists.
 */

export type GuideBlock =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  readingMinutes: number;
  updated: string;
  blocks: GuideBlock[];
};

export const GUIDES: Guide[] = [
  {
    slug: "resume-format-for-freshers",
    title: "Resume Format for Freshers in India (with Section Order)",
    description:
      "The simplest resume format for freshers and final-year students in India: what to include, the right section order, and common mistakes to avoid.",
    keywords: ["resume format for freshers", "fresher resume", "campus placement resume", "resume for students India"],
    readingMinutes: 5,
    updated: "2026-10-04",
    blocks: [
      {
        type: "p",
        text: "As a fresher, recruiters judge you on potential: what you studied, what you built and how clearly you present it. A one-page, well-ordered resume does more than a long one full of generic lines.",
      },
      { type: "h2", text: "The best section order for freshers" },
      {
        type: "ul",
        items: [
          "Contact details: name, phone (+91), professional email, city, LinkedIn and GitHub or portfolio if you have one.",
          "Career objective or summary: two lines about the role you want and what you bring.",
          "Education: degree, college, year and CGPA or percentage. Add Class 12 and 10 only if asked or if scores are strong.",
          "Projects: two to four projects with what you built, your role and the tools you used.",
          "Internships and training: company, duration and what you worked on.",
          "Skills: group them, for example Languages, Frameworks, Tools.",
          "Certifications and achievements: hackathons, NPTEL or Coursera certificates, competitions.",
        ],
      },
      { type: "h2", text: "Keep it to one page" },
      {
        type: "p",
        text: "One page is enough for freshers. Use compact spacing, narrow margins and short bullet points instead of shrinking the font below 10 pt.",
      },
      { type: "h2", text: "Mistakes to avoid" },
      {
        type: "ul",
        items: [
          "Photos, date of birth, father's name and religion are not needed unless an employer asks.",
          "Avoid skill rating bars. A tracking system can't read them, and recruiters don't trust them.",
          "Don't copy a senior's resume. Write what you actually did in each project.",
          "Use a simple file name like Firstname_Lastname_Resume.pdf.",
        ],
      },
      { type: "h2", text: "Make it in minutes" },
      {
        type: "p",
        text: "Pick the Classic or Minimal template, move Education and Projects above Experience, fill in your details and download the PDF. Your first resume is free.",
      },
    ],
  },
  {
    slug: "ats-friendly-resume",
    title: "How to Make an ATS-Friendly Resume That Portals Can Read",
    description:
      "What applicant tracking systems look for, how to format an ATS-friendly resume for Naukri, LinkedIn and company portals, and what to avoid.",
    keywords: ["ATS friendly resume", "ATS resume format", "resume for Naukri", "applicant tracking system resume"],
    readingMinutes: 6,
    updated: "2026-10-04",
    blocks: [
      {
        type: "p",
        text: "An Applicant Tracking System (ATS) reads your resume and turns it into fields like name, experience and skills. If the layout confuses it, parts of your resume can be lost before a recruiter sees it.",
      },
      { type: "h2", text: "Formatting rules that help" },
      {
        type: "ul",
        items: [
          "Use a single-column layout with standard headings such as Experience, Education and Skills.",
          "Keep all important text as real text, not inside images, icons or text boxes.",
          "Use common fonts and avoid tables for your work history.",
          "Write dates consistently, for example Mar 2022 – Present.",
          "Export as a text-based PDF unless the portal asks for Word.",
        ],
      },
      { type: "h2", text: "Match the job description honestly" },
      {
        type: "p",
        text: "Read the job post and make sure skills you genuinely have use the same words it uses, for example “REST APIs” rather than only “backend”. Don't add skills you can't discuss in an interview.",
      },
      { type: "h2", text: "No tool can guarantee a score" },
      {
        type: "p",
        text: "Every company configures its ATS differently. Be careful with services promising a guaranteed ATS score. A clean format and relevant, truthful content are what matter.",
      },
      { type: "h2", text: "ATS-friendly templates" },
      {
        type: "p",
        text: "The Classic, Modern and Minimal templates are single-column with plain headings and real text, which makes them a safe choice for job portals.",
      },
    ],
  },
  {
    slug: "resume-summary-examples",
    title: "How to Write a Resume Summary (Structure + Examples)",
    description:
      "A simple structure for a professional summary or career objective, with examples for freshers and experienced professionals.",
    keywords: ["resume summary", "career objective for freshers", "professional summary examples", "resume objective"],
    readingMinutes: 4,
    updated: "2026-10-04",
    blocks: [
      {
        type: "p",
        text: "The summary is the first thing a recruiter reads. Two or three sentences should tell them who you are, what you're good at and what you want next.",
      },
      { type: "h2", text: "A simple structure" },
      {
        type: "ul",
        items: [
          "Who you are: your role or degree and years of experience.",
          "Your strengths: two or three skills or areas, in plain words.",
          "Proof: one real result, project or responsibility.",
          "Direction: the kind of role you're looking for (optional).",
        ],
      },
      { type: "h2", text: "Example for a fresher" },
      {
        type: "p",
        text: "“Final-year B.Tech Computer Science student with hands-on experience building web apps in React and Node.js. Built a college event platform used by 1,200 students. Looking for a frontend developer role.” Replace the details with your own.",
      },
      { type: "h2", text: "Example for an experienced professional" },
      {
        type: "p",
        text: "“Sales manager with 7 years in B2B SaaS across India and the Middle East. Led a team of 6 and grew regional revenue year on year. Strong at enterprise deal cycles and channel partnerships.” Use only numbers you can back up.",
      },
      { type: "h2", text: "Avoid buzzwords" },
      {
        type: "p",
        text: "Phrases like “hard-working team player” don't help. Specific skills and real outcomes do.",
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
