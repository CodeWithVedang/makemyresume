import { MARGINS, PAGE_SIZES } from "@/lib/resume/page";
import type { ResumeSettings } from "@/lib/resume/schema";

/**
 * Print rules for a resume page: physical page size and margins via @page,
 * and the on-screen page frame removed. Values come from validated enums, so
 * nothing user-controlled is interpolated into CSS.
 */
export function PrintStyles({ settings }: { settings: ResumeSettings }) {
  const page = PAGE_SIZES[settings.pageSize];
  const margin = MARGINS[settings.margins];
  const css = `
@page { size: ${page.width} ${page.height}; margin: ${margin}; }
@media print {
  html, body { background: #fff !important; }
  .rs-page { width: auto !important; min-height: 0 !important; padding: 0 !important; box-shadow: none !important; }
}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
