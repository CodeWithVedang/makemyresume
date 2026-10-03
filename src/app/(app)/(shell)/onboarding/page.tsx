import type { Metadata } from "next";

import { OnboardingChoices } from "@/components/dashboard/OnboardingChoices";
import { templateIds } from "@/lib/resume/schema";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/session";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const user = await requireUser();
  const params = await props.searchParams;
  const count = await prisma.resume.count({ where: { userId: user.id } });
  const template = (templateIds as readonly string[]).includes(String(params.template)) ? String(params.template) : null;
  const firstName = user.name?.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
      <p className="text-sm font-medium text-brand">Welcome{firstName ? `, ${firstName}` : ""}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">What do you want to create?</h1>
      <p className="mt-2 text-muted-foreground">Pick one to get started. You can do the others later.</p>
      <OnboardingChoices hasResumes={count > 0} template={template} highlightImport={params.intent === "import"} />
    </div>
  );
}
