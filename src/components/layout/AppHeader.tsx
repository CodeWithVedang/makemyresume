import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

import { AccountMenu } from "./AccountMenu";
import { NavLink } from "./NavLink";
import { OfflineIndicator } from "./OfflineIndicator";

const LINKS: Array<{ href: string; label: string; nav?: string }> = [
  { href: "/dashboard", label: "Resumes" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings", nav: "/settings/profile" },
];

export function AppHeader({ user }: { user: { name: string | null; email: string } }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo href="/dashboard" />
        <nav aria-label="App" className="hidden md:block">
          <ul className="flex gap-1 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}>
                <NavLink
                  href={l.nav ?? l.href}
                  matchPrefix={l.href}
                  className="block rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
                  activeClassName="font-medium text-foreground"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <OfflineIndicator />
          <Button asChild className="hidden h-10 px-4 md:inline-flex">
            <Link href="/resume/new">Create Resume</Link>
          </Button>
          <AccountMenu user={user} />
        </div>
      </div>
    </header>
  );
}
