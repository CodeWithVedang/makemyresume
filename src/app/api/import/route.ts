import { NextResponse } from "next/server";

import { parseResumeText } from "@/lib/import/parse-resume";
import { detectFormat, extractText, ImportError, MAX_IMPORT_BYTES } from "@/server/import/extract-text";
import { rateLimit } from "@/server/rate-limit";
import { getCurrentUser } from "@/server/session";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Parses an uploaded resume and returns structured, editable data.
 * Nothing is saved here: the user reviews the result and saves explicitly.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });

  if (!rateLimit(`import:${user.id}`, 15, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many imports. Please wait a few minutes." }, { status: 429 });
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_IMPORT_BYTES + 64 * 1024) {
    return NextResponse.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });
  }

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    file = value instanceof File ? value : null;
  } catch {
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 400 });
  }
  if (!file) return NextResponse.json({ error: "Choose a file to import." }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "This file is empty." }, { status: 400 });
  if (file.size > MAX_IMPORT_BYTES) return NextResponse.json({ error: "Files must be 10 MB or smaller." }, { status: 413 });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = detectFormat(file.name, file.type, bytes);
    const text = await extractText(format, bytes);
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim().slice(0, 80);
    const result = parseResumeText(text, baseName ? `${baseName} (imported)` : "Imported Resume");
    return NextResponse.json({ format, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ImportError) return NextResponse.json({ error: error.userMessage }, { status: 422 });
    console.error("[import] failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "We couldn't read this file. Please try another one." }, { status: 500 });
  }
}
