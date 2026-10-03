import "server-only";

/**
 * Extracts plain text from an uploaded resume. Files are processed in memory
 * and never stored. Callers must validate size/type before calling.
 */

export type ImportFormat = "pdf" | "docx" | "txt";

export const MAX_IMPORT_BYTES = 10 * 1024 * 1024;
const MAX_PDF_PAGES = 20;
const MAX_TEXT_CHARS = 100_000;

export class ImportError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
  }
}

const ALLOWED_MIME: Record<ImportFormat, string[]> = {
  pdf: ["application/pdf", "application/x-pdf"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  txt: ["text/plain"],
};

/** Checks extension, declared MIME type and the file's magic bytes. */
export function detectFormat(name: string, mime: string, bytes: Uint8Array): ImportFormat {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext !== "pdf" && ext !== "docx" && ext !== "txt") {
    throw new ImportError("Unsupported file type. Upload a PDF, DOCX or TXT file.");
  }
  const format = ext as ImportFormat;
  if (mime && mime !== "application/octet-stream" && !ALLOWED_MIME[format].includes(mime)) {
    throw new ImportError("The file type doesn't match its extension. Upload a PDF, DOCX or TXT file.");
  }
  const head = Buffer.from(bytes.subarray(0, 5)).toString("latin1");
  if (format === "pdf" && head !== "%PDF-") throw new ImportError("This file isn't a valid PDF.");
  if (format === "docx" && !(bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04)) {
    throw new ImportError("This file isn't a valid Word (.docx) document.");
  }
  if (format === "txt" && bytes.subarray(0, 8192).includes(0)) throw new ImportError("This text file contains binary data.");
  return format;
}

type TextItem = { str: string; transform: number[]; hasEOL?: boolean; height?: number };

async function extractPdf(bytes: Uint8Array): Promise<string> {
  const { getDocumentProxy } = await import("unpdf");
  let pdf;
  try {
    pdf = await getDocumentProxy(bytes);
  } catch {
    throw new ImportError("We couldn't open this PDF. It may be damaged or password-protected.");
  }
  if (pdf.numPages > MAX_PDF_PAGES) throw new ImportError(`PDFs longer than ${MAX_PDF_PAGES} pages aren't supported.`);

  const pages: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const { items } = await page.getTextContent();
    // Rebuild visual lines from positioned text runs (top-to-bottom, left-to-right).
    const runs = (items as TextItem[]).filter((i) => typeof i.str === "string" && i.str.length > 0);
    const rows: Array<{ y: number; h: number; parts: Array<{ x: number; s: string }> }> = [];
    for (const run of runs) {
      const x = run.transform[4];
      const y = run.transform[5];
      const h = run.height || Math.abs(run.transform[3]) || 10;
      const row = rows.find((r) => Math.abs(r.y - y) < Math.max(2, h * 0.4));
      if (row) row.parts.push({ x, s: run.str });
      else rows.push({ y, h, parts: [{ x, s: run.str }] });
    }
    rows.sort((a, b) => b.y - a.y);
    const lines: string[] = [];
    let prev: (typeof rows)[number] | null = null;
    for (const row of rows) {
      if (prev && prev.y - row.y > Math.max(prev.h, row.h) * 1.9) lines.push("");
      lines.push(
        row.parts
          .sort((a, b) => a.x - b.x)
          .map((p) => p.s)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim(),
      );
      prev = row;
    }
    pages.push(lines.join("\n"));
  }
  await pdf.cleanup();
  return pages.join("\n\n");
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
  const mammoth = await import("mammoth");
  try {
    const { value } = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    // mammoth separates paragraphs with blank lines; keep single breaks for list items.
    return value.replace(/\n{3,}/g, "\n\n");
  } catch {
    throw new ImportError("We couldn't read this Word document. Try saving it again or export it as PDF.");
  }
}

export async function extractText(format: ImportFormat, bytes: Uint8Array): Promise<string> {
  let text: string;
  if (format === "pdf") text = await extractPdf(bytes);
  else if (format === "docx") text = await extractDocx(bytes);
  else {
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new ImportError("This text file isn't UTF-8 encoded.");
    }
  }
  text = text.slice(0, MAX_TEXT_CHARS);
  if (text.replace(/\s/g, "").length < 20) {
    throw new ImportError(
      format === "pdf"
        ? "We couldn't find any text in this PDF. Scanned documents (images) can't be read — try a DOCX or a text-based PDF."
        : "This document appears to be empty.",
    );
  }
  return text;
}
