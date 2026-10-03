"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { resumeContentSchema, type ResumeContent } from "@/lib/resume/schema";

/**
 * Editor state: one immutable ResumeContent object plus derived validation
 * errors keyed by dotted path ("experience.2.endDate"). Section editors read
 * and write through `update`, so the preview re-renders on every change.
 */

export type FieldErrors = Record<string, string>;

type EditorContextValue = {
  content: ResumeContent;
  update: (recipe: (current: ResumeContent) => ResumeContent) => void;
  replace: (next: ResumeContent) => void;
  errors: FieldErrors;
};

const EditorContext = createContext<EditorContextValue | null>(null);

export function validateContent(content: ResumeContent): FieldErrors {
  const result = resumeContentSchema.safeParse(content);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function EditorProvider({ initial, children }: { initial: ResumeContent; children: ReactNode }) {
  const [content, setContent] = useState(initial);
  const update = useCallback((recipe: (current: ResumeContent) => ResumeContent) => setContent(recipe), []);
  const replace = useCallback((next: ResumeContent) => setContent(next), []);
  const errors = useMemo(() => validateContent(content), [content]);
  const value = useMemo(() => ({ content, update, replace, errors }), [content, update, replace, errors]);
  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside <EditorProvider>");
  return ctx;
}

/** Immutable array helpers used by list editors. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return [...list];
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
