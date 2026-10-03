import { Suspense } from "react";

import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNav } from "@/components/layout/MobileNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { requireUser } from "@/server/session";

export default async function ShellLayout({ children }: LayoutProps<"/">) {
  const user = await requireUser();
  return (
    <>
      <AppHeader user={{ name: user.name, email: user.email }} />
      <main id="main" className="flex-1 pb-24 md:pb-0">
        {children}
      </main>
      <Suspense>
        <MobileNav />
      </Suspense>
      <InstallPrompt />
    </>
  );
}
