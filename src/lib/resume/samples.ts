import { defaultSettings, emptyResumeContent } from "./defaults";
import type { ResumeContent } from "./schema";

/**
 * Demo resumes for marketing previews, the seed script and development.
 * People and companies are fictional. Anything rendered from these must be
 * labelled "Demo Resume" or "Sample" in the UI.
 */

const base = emptyResumeContent();

export const sampleSoftwareEngineer: ResumeContent = {
  ...base,
  title: "Demo Resume — Software Engineer",
  templateId: "modern",
  personalInfo: {
    ...base.personalInfo,
    fullName: "Maya Okafor",
    professionalTitle: "Senior Frontend Engineer",
    email: "maya.okafor@example.com",
    phone: "+1 (555) 014-2290",
    location: "Toronto, ON",
    linkedin: "linkedin.com/in/maya-okafor-example",
    github: "github.com/maya-okafor-example",
  },
  summary:
    "Frontend engineer with eight years of experience building accessible, high-traffic web applications. Focused on design systems, performance and developer experience.",
  experience: [
    {
      id: "demo-exp-1",
      jobTitle: "Senior Frontend Engineer",
      company: "Northwind Logistics",
      location: "Toronto, ON",
      employmentType: "FULL_TIME",
      startDate: "2021-03",
      endDate: "",
      current: true,
      description:
        "- Led the migration of the customer portal from a legacy SPA to Next.js, cutting median page load from 4.1s to 1.6s\n- Built and documented a shared component library used by four product teams\n- Mentored three engineers through structured code review and pairing",
    },
    {
      id: "demo-exp-2",
      jobTitle: "Frontend Engineer",
      company: "Brightline Health",
      location: "Remote",
      employmentType: "FULL_TIME",
      startDate: "2018-06",
      endDate: "2021-02",
      current: false,
      description:
        "- Delivered the patient scheduling flow used by 120 clinics\n- Introduced automated accessibility checks in CI, resolving 300+ WCAG issues",
    },
    {
      id: "demo-exp-3",
      jobTitle: "Web Developer",
      company: "Studio Fern",
      location: "Ottawa, ON",
      employmentType: "CONTRACT",
      startDate: "2016-09",
      endDate: "2018-05",
      current: false,
      description: "- Built responsive marketing sites for 15+ clients in the non-profit sector",
    },
  ],
  education: [
    {
      id: "demo-edu-1",
      institution: "University of Waterloo",
      degree: "BMath",
      fieldOfStudy: "Computer Science",
      location: "Waterloo, ON",
      startDate: "2012-09",
      endDate: "2016-04",
      grade: "",
      description: "",
    },
  ],
  skills: [
    { id: "demo-sk-1", name: "TypeScript", category: "Languages" },
    { id: "demo-sk-2", name: "JavaScript", category: "Languages" },
    { id: "demo-sk-3", name: "React", category: "Frontend" },
    { id: "demo-sk-4", name: "Next.js", category: "Frontend" },
    { id: "demo-sk-5", name: "CSS Architecture", category: "Frontend" },
    { id: "demo-sk-6", name: "Node.js", category: "Backend" },
    { id: "demo-sk-7", name: "PostgreSQL", category: "Backend" },
    { id: "demo-sk-8", name: "Playwright", category: "Testing" },
    { id: "demo-sk-9", name: "Vitest", category: "Testing" },
    { id: "demo-sk-10", name: "Figma", category: "Tools" },
  ],
  projects: [
    {
      id: "demo-proj-1",
      name: "Open Transit Board",
      role: "Maintainer",
      description: "Open-source real-time departures display for community transit agencies.",
      technologies: ["React", "WebSockets", "GTFS"],
      startDate: "2020-01",
      endDate: "",
      url: "",
      githubUrl: "github.com/maya-okafor-example/transit-board",
    },
  ],
  certifications: [
    {
      id: "demo-cert-1",
      name: "Certified Professional in Accessibility Core Competencies",
      issuer: "IAAP",
      issueDate: "2022-05",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    },
  ],
  languages: [
    { id: "demo-lang-1", name: "English", proficiency: "Native" },
    { id: "demo-lang-2", name: "French", proficiency: "Professional working" },
  ],
  settings: { ...defaultSettings, accentColor: "#2F6B8A" },
};

export const sampleDesigner: ResumeContent = {
  ...base,
  title: "Demo Resume — Product Designer",
  templateId: "creative",
  personalInfo: {
    ...base.personalInfo,
    fullName: "Daniel Reyes",
    professionalTitle: "Product Designer",
    email: "daniel.reyes@example.com",
    phone: "+44 20 7946 0321",
    location: "London, UK",
    portfolio: "danielreyes.example.com",
  },
  summary:
    "Product designer working across research, interaction and visual design. Six years shipping B2B tools with small, cross-functional teams.",
  experience: [
    {
      id: "demo-d-exp-1",
      jobTitle: "Senior Product Designer",
      company: "Ledgerly",
      location: "London, UK",
      employmentType: "FULL_TIME",
      startDate: "2022-01",
      endDate: "",
      current: true,
      description:
        "- Redesigned invoice approval, reducing average approval time by 30%\n- Ran 40+ customer interviews to define the 2024 reporting roadmap",
    },
    {
      id: "demo-d-exp-2",
      jobTitle: "Product Designer",
      company: "Parcel & Co",
      location: "Manchester, UK",
      employmentType: "FULL_TIME",
      startDate: "2019-02",
      endDate: "2021-12",
      current: false,
      description: "- Owned the courier mobile app from discovery to launch across iOS and Android",
    },
  ],
  education: [
    {
      id: "demo-d-edu-1",
      institution: "Glasgow School of Art",
      degree: "BA (Hons)",
      fieldOfStudy: "Communication Design",
      location: "Glasgow, UK",
      startDate: "2014-09",
      endDate: "2018-06",
      grade: "First Class",
      description: "",
    },
  ],
  skills: [
    { id: "demo-d-sk-1", name: "Interaction design", category: "Design" },
    { id: "demo-d-sk-2", name: "Design systems", category: "Design" },
    { id: "demo-d-sk-3", name: "Prototyping", category: "Design" },
    { id: "demo-d-sk-4", name: "Usability testing", category: "Research" },
    { id: "demo-d-sk-5", name: "Customer interviews", category: "Research" },
    { id: "demo-d-sk-6", name: "Figma", category: "Tools" },
  ],
  languages: [
    { id: "demo-d-lang-1", name: "English", proficiency: "Native" },
    { id: "demo-d-lang-2", name: "Spanish", proficiency: "Native" },
  ],
  settings: { ...defaultSettings, accentColor: "#5B3A6B", fontFamily: "plex" },
};

export const sampleMarketer: ResumeContent = {
  ...base,
  title: "Demo Resume — Marketing Manager",
  templateId: "executive",
  personalInfo: {
    ...base.personalInfo,
    fullName: "Priya Nair",
    professionalTitle: "Growth Marketing Manager",
    email: "priya.nair@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/priya-nair-example",
  },
  summary:
    "Marketing manager with seven years in B2C subscription growth. Experienced in lifecycle campaigns, paid acquisition and building lean marketing teams.",
  experience: [
    {
      id: "demo-m-exp-1",
      jobTitle: "Growth Marketing Manager",
      company: "Kitab Learning",
      location: "Bengaluru, India",
      employmentType: "FULL_TIME",
      startDate: "2020-07",
      endDate: "",
      current: true,
      description:
        "- Grew paid subscribers from 40k to 210k over three years\n- Built a four-person lifecycle team and an experimentation cadence of 6 tests per month",
    },
    {
      id: "demo-m-exp-2",
      jobTitle: "Marketing Associate",
      company: "Ferns Retail",
      location: "Mumbai, India",
      employmentType: "FULL_TIME",
      startDate: "2017-06",
      endDate: "2020-06",
      current: false,
      description: "- Managed a ₹2 crore annual paid social budget across five product lines",
    },
  ],
  education: [
    {
      id: "demo-m-edu-1",
      institution: "Indian Institute of Management Kozhikode",
      degree: "PGP",
      fieldOfStudy: "Marketing",
      location: "Kozhikode, India",
      startDate: "2015-06",
      endDate: "2017-04",
      grade: "",
      description: "",
    },
  ],
  skills: [
    { id: "demo-m-sk-1", name: "Lifecycle marketing", category: "" },
    { id: "demo-m-sk-2", name: "Paid acquisition", category: "" },
    { id: "demo-m-sk-3", name: "Experiment design", category: "" },
    { id: "demo-m-sk-4", name: "SQL", category: "" },
    { id: "demo-m-sk-5", name: "Team leadership", category: "" },
    { id: "demo-m-sk-6", name: "Brand positioning", category: "" },
  ],
  achievements: [
    {
      id: "demo-m-ach-1",
      title: "Company Impact Award",
      description: "Recognized for the 2022 annual-plan launch campaign.",
      date: "2022-12",
    },
  ],
  settings: { ...defaultSettings, accentColor: "#183B56", fontFamily: "source-serif" },
};

export const sampleResumes = [sampleSoftwareEngineer, sampleDesigner, sampleMarketer] as const;
