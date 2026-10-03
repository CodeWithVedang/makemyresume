"use client";

import { FilePlus2, FileUp, LayoutGrid, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Resumes", icon: LayoutGrid, match: (p: string) => p === "/dashboard" },
  { href: "/resume/new", label: "Create", icon: FilePlus2, match: (p: string, m: string | null) => p === "/resume/new" && m !== "import" },
  { href: "/resume/new?mode=import", label: "Import", icon: FileUp, match: (p: string, m: string | null) => p === "/resume/new" && m === "import" },
  { href: "/settings/profile", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

/** Bottom navigation for phones; hidden from md up. */
export function MobileNav() {
  const pathname = usePathname();
  const mode = useSearchParams().get("mode");
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = item.match(pathname, mode);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <item.icon className={cn("size-5", active && "text-brand")} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
