"use client";

import { showUpgradeToast } from "@/components/billing/upgrade-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { TemplateId } from "@/lib/resume/schema";
import { deleteResumeAction, duplicateResumeAction, renameResumeAction } from "@/server/actions/resume";
import { templates } from "@/templates/registry";

export function RenameResumeDialog({
  resumeId,
  title,
  open,
  onOpenChange,
  onRenamed,
}: {
  resumeId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRenamed: (title: string) => void;
}) {
  const [value, setValue] = useState(title);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Resume name is required.");
      return;
    }
    startTransition(async () => {
      const result = await renameResumeAction(resumeId, value);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onRenamed(result.data.title);
      onOpenChange(false);
      toast.success("Resume renamed.");
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setValue(title);
          setError(undefined);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Rename resume</DialogTitle>
            <DialogDescription>Only you see this name. It is not printed on the resume.</DialogDescription>
          </DialogHeader>
          <Field label="Resume name" error={error} className="my-5">
            {(p) => (
              <Input {...p} value={value} maxLength={100} autoFocus className="h-11" onChange={(e) => setValue(e.target.value)} />
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Save Name
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** "Use as base": deep-copies a resume under a new name and template. The source is untouched. */
export function UseAsBaseDialog({
  resumeId,
  title,
  templateId,
  open,
  onOpenChange,
}: {
  resumeId: string;
  title: string;
  templateId: TemplateId;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(`${title} — Copy`);
  const [template, setTemplate] = useState<TemplateId>(templateId);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Resume name is required.");
      return;
    }
    startTransition(async () => {
      const result = await duplicateResumeAction({ id: resumeId, title: name, templateId: template });
      if (!result.ok) {
        setError(result.error);
        if (result.code === "limit") showUpgradeToast(result.error);
        return;
      }
      toast.success("New resume created. The original is unchanged.");
      onOpenChange(false);
      router.push(`/resume/${result.data.id}/edit`);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create a new resume from this one</DialogTitle>
            <DialogDescription>
              We copy all content into a new resume. Changes to the copy won&apos;t affect &ldquo;{title}&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <Field label="New resume name" error={error}>
            {(p) => <Input {...p} value={name} maxLength={100} className="h-11" onChange={(e) => setName(e.target.value)} />}
          </Field>
          <Field label="Template">
            {(p) => (
              <select
                {...p}
                value={template}
                onChange={(e) => setTemplate(e.target.value as TemplateId)}
                className="h-11 rounded-md border border-input bg-transparent px-2.5 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none dark:bg-input/30"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {t.atsFriendly ? " (ATS friendly)" : ""}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" className="h-10" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-10" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
              Create Resume
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteResumeDialog({
  resumeId,
  title,
  open,
  onOpenChange,
  onDeleted,
}: {
  resumeId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the resume and its public link. Other resumes are not affected. This
            can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-10">Keep Resume</AlertDialogCancel>
          <AlertDialogAction
            className="h-10 bg-destructive text-white hover:bg-destructive/90"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              startTransition(async () => {
                const result = await deleteResumeAction(resumeId);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                onOpenChange(false);
                onDeleted();
                toast.success("Resume deleted.");
              });
            }}
          >
            {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            Delete Resume
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
