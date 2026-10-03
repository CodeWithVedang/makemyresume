// Renders tests/e2e/fixtures/resume.txt into a simple text-based PDF fixture.
import { readFileSync } from "node:fs";
import { chromium } from "playwright-core";

const text = readFileSync("tests/e2e/fixtures/resume.txt", "utf8");
const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = `<html><body style="font-family:Arial;font-size:11pt">${text
  .split("\n")
  .map((l) => `<div>${escape(l) || "&nbsp;"}</div>`)
  .join("")}</body></html>`;
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: "tests/e2e/fixtures/resume.pdf", format: "A4" });
await browser.close();
console.log("wrote resume.pdf");
