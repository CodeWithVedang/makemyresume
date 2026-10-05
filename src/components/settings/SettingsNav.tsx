"use client";

import { NavLink } from "@/components/layout/NavLink";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/billing", label: "Billing" },
];

export function SettingsNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Settings">
      <ul className="flex gap-1 overflow-x-auto md:flex-col">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <NavLink
                href={item.href}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm whitespace-nowrap transition-colors",
                  active ? "bg-secondary font-medium text-secondary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
