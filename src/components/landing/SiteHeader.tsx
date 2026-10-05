"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { NavLink } from "@/components/layout/NavLink";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV = [
  { href: "/templates", label: "Templates" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/guides", label: "Guides" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <NavLink
                  href={item.href}
                  matchPrefix
                  className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  activeClassName="font-medium text-foreground"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" className="hidden h-10 px-4 md:inline-flex">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="hidden h-10 px-4 min-[400px]:inline-flex">
            <Link href="/signup">Create Resume</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="size-10 md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="px-4">
                <ul className="flex flex-col">
                  {[...NAV, { href: "/login", label: "Log in" }].map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex h-12 items-center border-b border-border text-base"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 h-12 w-full text-base">
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Create My Resume
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
