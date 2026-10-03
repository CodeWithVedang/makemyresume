"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { ResumeContent } from "@/lib/resume/schema";
import { saveResumeAction } from "@/server/actions/resume";

import type { FieldErrors } from "./EditorContext";

export type SaveStatus = "saved" | "dirty" | "saving" | "error" | "offline" | "invalid" | "conflict";

const DEBOUNCE_MS = 900;
const RETRY_MS = [3000, 8000, 20000, 45000];

export type LocalDraft = { content: ResumeContent; baseRevision: number; savedAt: string };

export const draftKey = (resumeId: string) => `resume-draft:${resumeId}`;

export function readDraft(resumeId: string): LocalDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey(resumeId));
    return raw ? (JSON.parse(raw) as LocalDraft) : null;
  } catch {
    return null;
  }
}

function writeDraft(resumeId: string, draft: LocalDraft) {
  try {
    window.localStorage.setItem(draftKey(resumeId), JSON.stringify(draft));
  } catch {
    // Storage full or blocked: server autosave still works.
  }
}

export function clearDraft(resumeId: string) {
  try {
    window.localStorage.removeItem(draftKey(resumeId));
  } catch {
    // ignore
  }
}

/**
 * Debounced server persistence with a local safety net:
 * - every change is mirrored to localStorage immediately,
 * - one request in flight at a time; later edits queue behind it,
 * - offline / failed saves retry with backoff and on reconnect,
 * - a revision number prevents an old tab from overwriting newer work.
 */
export function useAutosave({
  resumeId,
  content,
  errors,
  initialRevision,
}: {
  resumeId: string;
  content: ResumeContent;
  errors: FieldErrors;
  initialRevision: number;
}) {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [message, setMessage] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const revision = useRef(initialRevision);
  const savedJson = useRef(JSON.stringify(content));
  const latest = useRef(content);
  const latestErrors = useRef(errors);
  const inFlight = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const retries = useRef(0);
  const conflicted = useRef(false);
  // Indirection so retries scheduled inside flush always call the latest flush.
  const flushRef = useRef<() => Promise<void>>(async () => {});
  const schedule = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flushRef.current(), delay);
  };

  useLayoutEffect(() => {
    latest.current = content;
    latestErrors.current = errors;
  }, [content, errors]);

  const flush = useCallback(async () => {
    window.clearTimeout(timer.current);
    if (conflicted.current) return;
    const json = JSON.stringify(latest.current);
    if (json === savedJson.current) {
      setStatus("saved");
      return;
    }
    if (inFlight.current) return; // the in-flight save reschedules when done
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }
    if (Object.keys(latestErrors.current).length > 0) {
      setStatus("invalid");
      setMessage("Fix the highlighted fields to save. Your changes are kept on this device.");
      return;
    }

    inFlight.current = true;
    setStatus("saving");
    const sent = latest.current;
    const result = await saveResumeAction(resumeId, sent, revision.current).catch(() => null);
    inFlight.current = false;

    if (result?.ok) {
      retries.current = 0;
      revision.current = result.data.revision;
      savedJson.current = JSON.stringify(sent);
      setLastSavedAt(new Date(result.data.updatedAt));
      setMessage(null);
      if (JSON.stringify(latest.current) === savedJson.current) {
        clearDraft(resumeId);
        setStatus("saved");
      } else {
        writeDraft(resumeId, { content: latest.current, baseRevision: revision.current, savedAt: new Date().toISOString() });
        setStatus("dirty");
        schedule(DEBOUNCE_MS);
      }
      return;
    }

    if (result && !result.ok) {
      if (result.code === "stale") {
        conflicted.current = true;
        setStatus("conflict");
        setMessage(result.error);
        return;
      }
      if (result.code === "invalid" || result.code === "limit") {
        setStatus("invalid");
        setMessage(result.error);
        return;
      }
      if (result.code === "unauthorized" || result.code === "not_found") {
        setStatus("error");
        setMessage(result.error);
        return;
      }
    }

    // Network or server failure: keep the draft and retry with backoff.
    setStatus(navigator.onLine ? "error" : "offline");
    setMessage(result && !result.ok ? result.error : "Save failed. We'll retry automatically.");
    const delay = RETRY_MS[Math.min(retries.current, RETRY_MS.length - 1)];
    retries.current += 1;
    schedule(delay);
  }, [resumeId]);

  useLayoutEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  // Mirror every change locally and debounce the server save.
  useEffect(() => {
    const json = JSON.stringify(content);
    if (json === savedJson.current) return;
    writeDraft(resumeId, { content, baseRevision: revision.current, savedAt: new Date().toISOString() });
    if (!inFlight.current && !conflicted.current) setStatus(navigator.onLine ? "dirty" : "offline");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), DEBOUNCE_MS);
  }, [content, resumeId, flush]);

  useEffect(() => {
    const onOnline = () => void flush();
    const onOffline = () => {
      if (JSON.stringify(latest.current) !== savedJson.current) setStatus("offline");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.clearTimeout(timer.current);
    };
  }, [flush]);

  // Warn before leaving with unsaved work.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (JSON.stringify(latest.current) !== savedJson.current) {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  return { status, message, lastSavedAt, saveNow: flush, revision };
}
