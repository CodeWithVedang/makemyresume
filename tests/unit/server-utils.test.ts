import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("pdfFilename", () => {
  it("builds a clean filename from the person's name without ids", async () => {
    const { pdfFilename } = await import("@/server/pdf");
    expect(pdfFilename("Vedang Shelatkar", "x")).toBe("Vedang_Shelatkar_Resume.pdf");
    expect(pdfFilename("José Álvarez-Núñez", "x")).toBe("Jose_Alvarez_Nunez_Resume.pdf");
    expect(pdfFilename("", "Frontend Resume")).toBe("Frontend_Resume_Resume.pdf");
    expect(pdfFilename("../../etc/passwd", "")).toBe("etc_passwd_Resume.pdf");
  });
});

describe("print tokens", () => {
  beforeAll(() => {
    process.env.AUTH_SECRET = "test-secret-for-print-tokens";
  });

  it("verifies a fresh token only for its own resume", async () => {
    const { createPrintToken, verifyPrintToken } = await import("@/server/print-token");
    const token = createPrintToken("resume-a");
    expect(verifyPrintToken("resume-a", token)).toBe(true);
    expect(verifyPrintToken("resume-b", token)).toBe(false);
    expect(verifyPrintToken("resume-a", `${token}x`)).toBe(false);
  });

  it("rejects expired tokens", async () => {
    const { createPrintToken, verifyPrintToken } = await import("@/server/print-token");
    const token = createPrintToken("resume-a", -1);
    expect(verifyPrintToken("resume-a", token)).toBe(false);
  });
});

describe("import file validation", () => {
  it("checks extension, MIME type and magic bytes", async () => {
    const { detectFormat } = await import("@/server/import/extract-text");
    const pdf = new TextEncoder().encode("%PDF-1.7 ...");
    const zip = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0]);
    expect(detectFormat("cv.pdf", "application/pdf", pdf)).toBe("pdf");
    expect(detectFormat("cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", zip)).toBe("docx");
    expect(() => detectFormat("cv.pdf", "application/pdf", zip)).toThrow(/valid PDF/);
    expect(() => detectFormat("cv.exe", "application/octet-stream", pdf)).toThrow(/Unsupported/);
    expect(() => detectFormat("cv.pdf", "text/html", pdf)).toThrow(/doesn't match/);
    expect(() => detectFormat("cv.txt", "text/plain", new Uint8Array([65, 0, 66]))).toThrow(/binary/);
  });
});
