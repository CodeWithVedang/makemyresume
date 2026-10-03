"use client";

import { Loader2 } from "lucide-react";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Field } from "@/components/forms/Field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction, deleteAccountAction, updateProfileAction } from "@/server/actions/account";

export function SettingsCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [value, setValue] = useState(name);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateProfileAction({ name: value });
      if (!result.ok) return setError(result.error);
      setError(undefined);
      toast.success("Profile updated.");
    });
  };
  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-4">
      <Field label="Full name" error={error}>
        {(p) => <Input {...p} value={value} maxLength={120} autoComplete="name" className="h-11" onChange={(e) => setValue(e.target.value)} />}
      </Field>
      <Field label="Email" hint="Contact support to change your sign-in email.">
        {(p) => <Input {...p} value={email} readOnly disabled className="h-11" />}
      </Field>
      <Button type="submit" className="h-10" disabled={pending || value.trim() === name}>
        {pending ? <Loader2 className="animate-spin" /> : null} Save Profile
      </Button>
    </form>
  );
}

export function PasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await changePasswordAction({ currentPassword: current, newPassword: next });
      if (!result.ok) return setError(result.error);
      setError(undefined);
      setCurrent("");
      setNext("");
      toast.success(hasPassword ? "Password changed." : "Password set. You can now log in with email.");
    });
  };
  return (
    <form onSubmit={submit} noValidate className="max-w-md space-y-4">
      {error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {hasPassword ? (
        <Field label="Current password">
          {(p) => <Input {...p} type="password" autoComplete="current-password" value={current} className="h-11" onChange={(e) => setCurrent(e.target.value)} />}
        </Field>
      ) : null}
      <Field label="New password" hint="At least 8 characters, with a letter and a number.">
        {(p) => <Input {...p} type="password" autoComplete="new-password" value={next} className="h-11" onChange={(e) => setNext(e.target.value)} />}
      </Field>
      <Button type="submit" className="h-10" disabled={pending || !next}>
        {pending ? <Loader2 className="animate-spin" /> : null} {hasPassword ? "Change Password" : "Set Password"}
      </Button>
    </form>
  );
}

export function DeleteAccount({ email }: { email: string }) {
  const [confirm, setConfirm] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="h-10">
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes your account, all resumes and public links. This can&apos;t be undone. Type{" "}
            <strong className="text-foreground">{email}</strong> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input aria-label="Confirm email" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" autoComplete="off" />
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10">Keep Account</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 bg-destructive text-white hover:bg-destructive/90"
            disabled={pending || confirm.trim().toLowerCase() !== email.toLowerCase()}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await deleteAccountAction(confirm);
                if (result && !result.ok) toast.error(result.error);
              });
            }}
          >
            {pending ? <Loader2 className="animate-spin" /> : null} Delete Account
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
