"use client";

import { Briefcase, ChevronRight, FilePlus2, FileUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { completeOnboardingAction } from "@/server/actions/resume";

export function OnboardingChoices({
  hasResumes,
  template,
  highlightImport,
}: {
  hasResumes: boolean;
  template: string | null;
  highlightImport: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<string | null>(null);
  const templateQuery = template ? `&template=${template}` : "";

  const options = [
    {
      id: "first",
      icon: FilePlus2,
      title: "My first resume",
      body: "Start with a blank, structured resume.",
      href: `/resume/new?mode=scratch${templateQuery}`,
    },
    {
      id: "role",
      icon: Briefcase,
      title: "A resume for a new role",
      body: hasResumes ? "Copy an existing resume and tailor it." : "Start fresh and tailor it to the role.",
      href: hasResumes ? `/resume/new?mode=base${templateQuery}` : `/resume/new?mode=scratch${templateQuery}`,
    },
    {
      id: "file",
      icon: FileUp,
      title: "A resume from an existing file",
      body: "Import a PDF or DOCX and review what we find.",
      href: "/resume/new?mode=import",
    },
  ];

  return (
    <ul className="mt-8 space-y-3">
      {options.map((o) => (
        <li key={o.id}>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setChosen(o.id);
              startTransition(async () => {
                await completeOnboardingAction();
                router.push(o.href);
              });
            }}
            className={cn(
              "flex w-full items-center gap-4 rounded-lg border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-card disabled:opacity-70 sm:p-5",
              highlightImport && o.id === "file" ? "border-primary" : "border-border",
            )}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-secondary text-brand">
              <o.icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{o.title}</span>
              <span className="block text-sm text-muted-foreground">{o.body}</span>
            </span>
            {pending && chosen === o.id ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
            )}
          </button>
        </li>
      ))}
      <li className="pt-2 text-center">
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() =>
            startTransition(async () => {
              await completeOnboardingAction();
              router.push("/dashboard");
            })
          }
        >
          Skip for now
        </button>
      </li>
    </ul>
  );
}
