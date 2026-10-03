import { Heart } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { APP_NAME, DEVELOPER } from "@/lib/config";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["/templates", "Resume templates"],
      ["/features", "Features"],
      ["/pricing", "Pricing"],
      ["/signup", "Create resume free"],
    ],
  },
  {
    title: "Guides",
    links: [
      ["/guides/resume-format-for-freshers", "Resume format for freshers"],
      ["/guides/ats-friendly-resume", "ATS-friendly resume"],
      ["/guides/resume-summary-examples", "Resume summary examples"],
      ["/guides", "All guides"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "About"],
      ["/about#privacy", "Privacy"],
      ["/about#contact", "Contact"],
      ["/login", "Log in"],
    ],
  },
] as const;

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.68 0-1.26.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.82 1.19 3.08 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-muted-foreground">
            Free ATS-friendly resume maker for India. Your words, beautifully formatted. No ghostwriting, no invented
            achievements.
          </p>
          <a
            href={DEVELOPER.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <GithubIcon className="size-4" />
            Follow {DEVELOPER.name} on GitHub
          </a>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h2 className="text-sm font-semibold">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Made in India for Indian job seekers.
          </p>
          <p className="inline-flex items-center gap-1.5">
            Designed &amp; developed with <Heart className="size-3.5 fill-highlight text-highlight" aria-label="love" /> by{" "}
            <a
              href={DEVELOPER.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              <GithubIcon className="size-3.5" />
              {DEVELOPER.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
