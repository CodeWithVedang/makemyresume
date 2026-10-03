"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Field } from "@/components/forms/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignupInput,
} from "@/lib/validation/auth";
import {
  googleSignInAction,
  loginAction,
  requestPasswordResetAction,
  resetPasswordAction,
  signupAction,
} from "@/server/actions/auth";

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
      {message}
    </p>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <Button type="submit" className="h-11 w-full text-base" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

export function GoogleButton({ callbackUrl }: { callbackUrl?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full text-base"
        disabled={pending}
        onClick={() => startTransition(() => googleSignInAction(callbackUrl))}
      >
        {pending ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
            <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8Z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.9 14c-.2-.7-.4-1.3-.4-2s.1-1.4.4-2V7.2H2.2a11 11 0 0 0 0 9.8L5.9 14Z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.2L5.9 10c.9-2.6 3.3-4.6 6.1-4.6Z" />
          </svg>
        )}
        Continue with Google
      </Button>
      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </>
  );
}

export function LoginForm({ callbackUrl, initialError }: { callbackUrl?: string; initialError?: string | null }) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          setError(null);
          const result = await loginAction(values, callbackUrl);
          if (result && !result.ok) setError(result.error);
        }),
      )}
    >
      <FormError message={error} />
      <Field label="Email" error={errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" className="h-11" {...form.register("email")} />}
      </Field>
      <div className="space-y-1.5">
        <Field label="Password" error={errors.password?.message}>
          {(p) => <Input {...p} type="password" autoComplete="current-password" className="h-11" {...form.register("password")} />}
        </Field>
        <Link href="/forgot-password" className="inline-block text-sm text-brand hover:underline">
          Forgot password?
        </Link>
      </div>
      <SubmitButton pending={pending}>Log in</SubmitButton>
    </form>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          setError(null);
          const result = await signupAction(values, next);
          if (result && !result.ok) setError(result.error);
        }),
      )}
    >
      <FormError message={error} />
      <Field label="Full name" error={errors.name?.message}>
        {(p) => <Input {...p} autoComplete="name" className="h-11" {...form.register("name")} />}
      </Field>
      <Field label="Email" error={errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" className="h-11" {...form.register("email")} />}
      </Field>
      <Field label="Password" hint="At least 8 characters, with a letter and a number." error={errors.password?.message}>
        {(p) => <Input {...p} type="password" autoComplete="new-password" className="h-11" {...form.register("password")} />}
      </Field>
      <SubmitButton pending={pending}>Create account</SubmitButton>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  if (sent) {
    return (
      <div role="status" className="rounded-lg border border-border bg-card p-5">
        <CheckCircle2 className="size-5 text-success" aria-hidden="true" />
        <p className="mt-3 font-medium">Check your email</p>
        <p className="mt-1 text-sm text-muted-foreground">
          If an account exists for {form.getValues("email")}, we&apos;ve sent a link to reset your password. It
          expires in one hour.
        </p>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          setError(null);
          const result = await requestPasswordResetAction(values);
          if (result.ok) setSent(true);
          else setError(result.error);
        }),
      )}
    >
      <FormError message={error} />
      <Field label="Email" error={form.formState.errors.email?.message}>
        {(p) => <Input {...p} type="email" autoComplete="email" inputMode="email" className="h-11" {...form.register("email")} />}
      </Field>
      <SubmitButton pending={pending}>Send reset link</SubmitButton>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={form.handleSubmit((values) =>
        startTransition(async () => {
          setError(null);
          const result = await resetPasswordAction(values);
          if (result.ok) router.push("/login?reset=1");
          else setError(result.error);
        }),
      )}
    >
      <FormError message={error} />
      <Field label="New password" hint="At least 8 characters, with a letter and a number." error={errors.password?.message}>
        {(p) => <Input {...p} type="password" autoComplete="new-password" className="h-11" {...form.register("password")} />}
      </Field>
      <Field label="Confirm new password" error={errors.confirmPassword?.message}>
        {(p) => <Input {...p} type="password" autoComplete="new-password" className="h-11" {...form.register("confirmPassword")} />}
      </Field>
      <SubmitButton pending={pending}>Update password</SubmitButton>
    </form>
  );
}
