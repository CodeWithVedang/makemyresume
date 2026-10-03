import "server-only";

import type { Browser } from "playwright-core";

/**
 * HTML -> PDF via headless Chromium. The browser renders the same template
 * components and CSS as the live preview, so output matches what users see.
 * Chromium is launched lazily and reused across requests.
 */

let browserPromise: Promise<Browser> | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserPromise) {
    const browser = await browserPromise.catch(() => null);
    if (browser?.isConnected()) return browser;
  }
  const { chromium } = await import("playwright-core");
  // Serverless (Vercel/AWS Lambda): use the bundled @sparticuz/chromium build.
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const serverless = (await import("@sparticuz/chromium")).default;
    browserPromise = chromium.launch({
      headless: true,
      executablePath: await serverless.executablePath(),
      args: serverless.args,
    });
    return browserPromise;
  }
  browserPromise = chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || undefined,
    args: ["--disable-dev-shm-usage", "--font-render-hinting=none"],
  });
  return browserPromise;
}

export async function renderPdf(url: string): Promise<Buffer> {
  const browser = await getBrowser();
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    if (!response || !response.ok()) throw new Error(`Print view returned ${response?.status() ?? "no response"}`);
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true, tagged: true, outline: false });
    return Buffer.from(pdf);
  } finally {
    await context.close();
  }
}

/** "Vedang Shelatkar" -> "Vedang_Shelatkar_Resume.pdf". Never includes database ids. */
export function pdfFilename(fullName: string, title: string): string {
  const base = (fullName.trim() || title.trim() || "My")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  return `${base || "My"}_Resume.pdf`;
}
