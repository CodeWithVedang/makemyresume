import { APP_NAME } from "@/lib/config";

/** Landing-page FAQ. Also emitted as FAQPage structured data. */
export const LANDING_FAQ = [
  {
    q: `Is ${APP_NAME} free?`,
    a: "Yes. You can create one complete resume, download it as a PDF as many times as you like, and create up to 3 shareable links, all free forever. Paid plans start at ₹99 if you need more resumes or templates.",
  },
  {
    q: "What is an ATS-friendly resume?",
    a: "Most companies in India use Applicant Tracking Systems on job portals and career sites to read resumes. ATS-friendly templates use a single column, real text and standard headings so the system can read your details. No tool can guarantee a score, but a clean format avoids common parsing problems.",
  },
  {
    q: "What is the best resume format for freshers?",
    a: "Freshers should keep it to one page: contact details, a short objective or summary, education with CGPA or percentage, projects, internships, skills and certifications. In the editor you can move Education and Projects above Experience in seconds.",
  },
  {
    q: "Can I upload my old resume?",
    a: "Yes. Import a PDF or Word (.docx) file and we lay out what we find in editable sections. You review and correct every field before saving. Your file is not stored.",
  },
  {
    q: "Will you write or change my content?",
    a: `No. ${APP_NAME} never rewrites your text or adds achievements. You stay in full control of what recruiters read.`,
  },
  {
    q: "Can I make different resumes for different jobs?",
    a: "Yes. Duplicate a resume or use it as a base for a new one, then tailor it for each role. The original stays unchanged. The Free plan includes one resume; paid plans add more.",
  },
] as const;
