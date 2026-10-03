import Link from "next/link";

import { APP_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <rect width="32" height="32" rx="7" fill="#183B56" />
      <path d="M10 8h9l5 5v11a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="#fff" />
      <path d="M19 8v4a1 1 0 0 0 1 1h4" fill="#F59E6C" />
      <rect x="12" y="15" width="8" height="1.6" rx=".8" fill="#2F6B8A" />
      <rect x="12" y="18.5" width="9" height="1.6" rx=".8" fill="#C9D5DE" />
      <rect x="12" y="22" width="6" height="1.6" rx=".8" fill="#C9D5DE" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("flex shrink-0 items-center gap-2 rounded-md font-semibold tracking-tight whitespace-nowrap", className)}>
      <LogoMark />
      <span>{APP_NAME}</span>
    </Link>
  );
}
