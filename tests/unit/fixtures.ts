import { emptyResumeContent } from "@/lib/resume/defaults";
import type { ResumeContent } from "@/lib/resume/schema";

/** Rich resume used to verify that every template renders every field. */
export function fullResume(): ResumeContent {
  const base = emptyResumeContent("Full Resume", "classic");
  return {
    ...base,
    personalInfo: {
      ...base.personalInfo,
      fullName: "Avery Quinn",
      professionalTitle: "Platform Engineer",
      email: "avery.quinn@example.com",
      phone: "+1 555 010 2030",
      location: "Denver, CO",
      website: "averyquinn.example.com",
      linkedin: "linkedin.com/in/avery-quinn-example",
      github: "github.com/avery-quinn-example",
      portfolio: "portfolio.example.com/avery",
      otherLinks: [{ id: "l1", label: "Blog", url: "blog.example.com" }],
    },
    summary: "Platform engineer focused on reliable developer tooling.",
    experience: [1, 2, 3].map((n) => ({
      id: `exp${n}`,
      jobTitle: `Role Title ${n}`,
      company: `Company Name ${n}`,
      location: `City ${n}`,
      employmentType: "FULL_TIME" as const,
      startDate: `201${n}-02`,
      endDate: n === 1 ? "" : `201${n + 1}-03`,
      current: n === 1,
      description: `- Bullet point for role ${n}\n- Second bullet for role ${n}`,
    })),
    education: [1, 2].map((n) => ({
      id: `edu${n}`,
      institution: `Institution Name ${n}`,
      degree: `Degree ${n}`,
      fieldOfStudy: `Field ${n}`,
      location: "",
      startDate: `200${n}-09`,
      endDate: `200${n + 3}-06`,
      grade: `Grade ${n}`,
      description: "",
    })),
    skills: Array.from({ length: 10 }, (_, i) => ({
      id: `sk${i}`,
      name: `SkillName${i}`,
      category: i < 5 ? "Category Alpha" : "Category Beta",
    })),
    projects: [1, 2, 3].map((n) => ({
      id: `pr${n}`,
      name: `Project Name ${n}`,
      role: `Project Role ${n}`,
      description: `Project description ${n}`,
      technologies: [`TechA${n}`, `TechB${n}`],
      startDate: "",
      endDate: "",
      url: `project${n}.example.com`,
      githubUrl: "",
    })),
    certifications: [
      {
        id: "c1",
        name: "Certification Name One",
        issuer: "Issuer Org",
        issueDate: "2020-05",
        expiryDate: "",
        credentialId: "CRED123",
        credentialUrl: "",
      },
    ],
    achievements: [{ id: "a1", title: "Achievement Title", description: "Achievement detail", date: "2021-01" }],
    languages: [{ id: "lg1", name: "LanguageOne", proficiency: "Fluent" }],
    volunteerExperience: [
      {
        id: "v1",
        organization: "Volunteer Org",
        role: "Volunteer Role",
        startDate: "2019-01",
        endDate: "2019-12",
        description: "Volunteer detail",
      },
    ],
    customSections: [
      {
        id: "cs1",
        title: "Publications",
        entries: [{ id: "ce1", title: "Paper Title", subtitle: "Journal Name", date: "2022", description: "Paper detail" }],
      },
    ],
    sectionOrder: [...base.sectionOrder, "custom:cs1"],
  };
}
