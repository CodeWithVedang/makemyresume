"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

import { LogoMark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "install-prompt-dismissed";

/** Unobtrusive install offer, shown only where the browser supports it and never again once dismissed. */
export function InstallPrompt() {
  const reduce = useReducedMotion();
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      // storage unavailable
    }
    if (dismissed) return;
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    setEvent(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {event ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-label="Install app"
          className="fixed inset-x-3 bottom-20 z-40 mx-auto flex max-w-md items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-card md:bottom-6"
        >
          <LogoMark className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Install the app</p>
            <p className="text-xs text-muted-foreground">Open your resumes from your home screen.</p>
          </div>
          <Button
            className="h-9"
            onClick={async () => {
              await event.prompt();
              await event.userChoice.catch(() => null);
              dismiss();
            }}
          >
            <Download /> Install
          </Button>
          <Button variant="ghost" size="icon" className="size-9" aria-label="Dismiss" onClick={dismiss}>
            <X />
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
