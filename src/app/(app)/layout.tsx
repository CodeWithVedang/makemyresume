import type { Metadata } from "next";

import { requireUser } from "@/server/session";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrivateLayout({ children }: LayoutProps<"/">) {
  await requireUser();
  return children;
}
