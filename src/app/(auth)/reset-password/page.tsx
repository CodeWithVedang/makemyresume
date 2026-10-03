import type { Metadata } from "next";
import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage(props: PageProps<"/reset-password">) {
  const { token } = await props.searchParams;
  const valid = typeof token === "string" && token.length >= 20;
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a new password</h1>
      {valid ? (
        <>
          <p className="mt-1.5 mb-6 text-sm text-muted-foreground">Use something you don&apos;t use elsewhere.</p>
          <ResetPasswordForm token={token} />
        </>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          This reset link is incomplete.{" "}
          <Link href="/forgot-password" className="font-medium text-brand hover:underline">
            Request a new link
          </Link>
          .
        </p>
      )}
    </>
  );
}
