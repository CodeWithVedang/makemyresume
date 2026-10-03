"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { ImportResult } from "@/lib/import/parse-resume";
import { cn } from "@/lib/utils";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = ".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain";

type Phase = "idle" | "uploading" | "reading" | "error";

const READING_STEPS = ["Reading your document…", "Extracting information…", "Preparing your resume…"];

function validate(file: File): string | null {
  const ext = file.name.toLowerCase().split(".").pop();
  if (!ext || !["pdf", "docx", "txt"].includes(ext)) {
    return ext === "doc" ? "Older .doc files aren't supported. Save it as .docx or PDF and try again." : "Upload a PDF, DOCX or TXT file.";
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_BYTES) return "Files must be 10 MB or smaller.";
  return null;
}

/** Upload with real progress (XHR), then staged status while the server reads the file. */
export function ImportUploader({ onParsed }: { onParsed: (result: ImportResult & { format: string }) => void }) {
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    if (phase !== "reading") return;
    const t = window.setInterval(() => setStep((s) => Math.min(s + 1, READING_STEPS.length - 1)), 900);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => () => xhrRef.current?.abort(), []);

  const upload = (file: File) => {
    const problem = validate(file);
    setFileName(file.name);
    if (problem) {
      setError(problem);
      setPhase("error");
      return;
    }
    setError(null);
    setProgress(0);
    setStep(0);
    setPhase("uploading");

    const body = new FormData();
    body.append("file", file);
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "/api/import");
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.upload.onload = () => setPhase("reading");
    xhr.onload = () => {
      const data = xhr.response as (ImportResult & { format: string }) | { error?: string } | null;
      if (xhr.status >= 200 && xhr.status < 300 && data && "content" in data) {
        onParsed(data);
      } else {
        setError((data && "error" in data && data.error) || "Resume upload failed. Please try again.");
        setPhase("error");
      }
    };
    xhr.onerror = () => {
      setError(navigator.onLine ? "Resume upload failed. Please try again." : "You're offline. Connect to the internet to import a resume.");
      setPhase("error");
    };
    xhr.send(body);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const busy = phase === "uploading" || phase === "reading";

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={busy ? (e) => e.preventDefault() : onDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-brand bg-secondary" : "border-border bg-card",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
        <AnimatePresence mode="wait" initial={false}>
          {busy ? (
            <motion.div
              key="busy"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              className="w-full max-w-xs"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="mx-auto size-8 animate-spin text-brand" aria-hidden="true" />
              <p className="mt-4 font-medium">{phase === "uploading" ? "Uploading…" : READING_STEPS[step]}</p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{fileName}</p>
              <Progress value={phase === "uploading" ? progress : 100} className="mt-4" aria-label="Upload progress" />
            </motion.div>
          ) : (
            <motion.div key="idle" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-brand">
                <UploadCloud className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-medium">Drop your resume here</p>
              <p className="mt-1 text-sm text-muted-foreground">PDF, DOCX or TXT · up to 10 MB</p>
              <Button type="button" className="mt-5 h-11 px-5" onClick={() => inputRef.current?.click()}>
                <FileText /> Import Existing Resume
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === "error" && error ? (
        <div role="alert" className="mt-4 flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Resume upload failed</p>
            <p>{error}</p>
          </div>
        </div>
      ) : null}

      <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
        {[
          "Your file is read on our server and not stored.",
          "We only reorganize text from your file — nothing is written for you.",
          "You'll review and correct every field before saving.",
        ].map((t) => (
          <li key={t} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}
