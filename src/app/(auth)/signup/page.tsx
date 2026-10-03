import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { googleEnabled } from "@/auth";
import { GoogleButton, SignupForm } from "@/components/auth/AuthForms";
import { templateIds } from "@/lib/resume/schema";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "Create your account" };

export default async function SignupPage(props: PageProps<"/signup">) {
  const params = await props.searchParams;
  const template = typeof params.template === "string" && (templateIds as readonly string[]).includes(params.template)
    ? params.template
    : null;
  const next = template
    ? `/onboarding?template=${template}`
    : params.next === "import"
      ? "/onboarding?intent=import"
      : params.next === "pricing"
        ? "/pricing"
        : "/onboarding";
  if (await getCurrentUser()) redirect(next.startsWith("/onboarding") ? next.replace("/onboarding", "/resume/new") : next);

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 mb-6 text-sm text-muted-foreground">Free to start. Your resumes stay private until you share them.</p>
      {googleEnabled ? <GoogleButton callbackUrl={next} /> : null}
      <SignupForm next={next} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
