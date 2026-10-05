"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Thin bar under a nav link while its route is loading. */
function PendingBar() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-3 -bottom-px h-0.5 origin-left rounded-full bg-brand transition-transform duration-500 ease-out",
        pending ? "scale-x-100" : "scale-x-0 duration-0",
      )}
    />
  );
}

/**
 * Navigation link that marks the current page and shows immediate feedback
 * while the next route streams in.
 */
export function NavLink({
  href,
  children,
  className,
  activeClassName,
  matchPrefix = false,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  /** Treat nested routes as active: `true` uses `href`, a string uses that path. */
  matchPrefix?: boolean | string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const prefix = typeof matchPrefix === "string" ? matchPrefix : href;
  const active = pathname === href || (matchPrefix !== false && (pathname === prefix || pathname.startsWith(`${prefix}/`)));
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn("relative", className, active && activeClassName)}
    >
      {children}
      <PendingBar />
    </Link>
  );
}
