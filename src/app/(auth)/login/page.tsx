import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { googleEnabled } from "@/auth";
import { GoogleButton, LoginForm } from "@/components/auth/AuthForms";
import { safeRedirectPath } from "@/lib/result";
import { getCurrentUser } from "@/server/session";

export const metadata: Metadata = { title: "Log in" };

const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already registered with a password. Log in with your email instead.",
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Sign-in is temporarily unavailable. Please try again later.",
};

export default async function LoginPage(props: PageProps<"/login">) {
  const params = await props.searchParams;
  const callbackUrl = safeRedirectPath(params.callbackUrl);
  if (await getCurrentUser()) redirect(callbackUrl);
  const errorKey = typeof params.error === "string" ? params.error : null;
  const reset = params.reset === "1";

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1.5 mb-6 text-sm text-muted-foreground">Log in to continue working on your resumes.</p>
      {reset ? (
        <p role="status" className="mb-4 rounded-md bg-success-soft px-3 py-2.5 text-sm text-success">
          Password updated. Log in with your new password.
        </p>
      ) : null}
      {googleEnabled ? <GoogleButton callbackUrl={callbackUrl} /> : null}
      <LoginForm
        callbackUrl={callbackUrl}
        initialError={errorKey ? (ERRORS[errorKey] ?? "Something went wrong. Please try again.") : null}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
