import type { ComponentType, CSSProperties } from "react";

import { FONT_STACKS, MARGINS, PAGE_SIZES, SECTION_GAPS } from "@/lib/resume/page";
import type { ResumeContent, TemplateId } from "@/lib/resume/schema";

import "./base.css";
import { ClassicTemplate } from "./classic/Classic";
import { CompactTemplate } from "./compact/Compact";
import { CreativeTemplate } from "./creative/Creative";
import { ElegantTemplate } from "./elegant/Elegant";
import { ExecutiveTemplate } from "./executive/Executive";
import { MinimalTemplate } from "./minimal/Minimal";
import { ModernTemplate } from "./modern/Modern";
import { SidebarTemplate } from "./sidebar/Sidebar";
import { TechnicalTemplate } from "./technical/Technical";

const TEMPLATE_COMPONENTS: Record<TemplateId, ComponentType<{ content: ResumeContent }>> = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
  executive: ExecutiveTemplate,
  creative: CreativeTemplate,
  compact: CompactTemplate,
  elegant: ElegantTemplate,
  technical: TechnicalTemplate,
  sidebar: SidebarTemplate,
};

export type RenderMode = "screen" | "print";

/**
 * Single entry point for rendering a resume. The template controls layout;
 * the data passed in is never modified, so switching templates is lossless.
 */
export function ResumeRenderer({
  content,
  mode = "screen",
  className,
}: {
  content: ResumeContent;
  mode?: RenderMode;
  className?: string;
}) {
  const Template = TEMPLATE_COMPONENTS[content.templateId] ?? ClassicTemplate;
  const s = content.settings;
  const page = PAGE_SIZES[s.pageSize];
  const style = {
    "--rs-accent": s.accentColor,
    "--rs-font": FONT_STACKS[s.fontFamily].stack,
    "--rs-size": `${s.fontSize}pt`,
    "--rs-lh": String(s.lineHeight),
    "--rs-gap": SECTION_GAPS[s.sectionSpacing],
    "--rs-margin": MARGINS[s.margins],
    "--rs-page-w": page.width,
    "--rs-page-h": page.height,
  } as CSSProperties;

  return (
    <article
      className={className ? `rs-page ${className}` : "rs-page"}
      data-mode={mode}
      data-template={content.templateId}
      style={style}
      aria-label={`Resume preview${content.personalInfo.fullName ? ` for ${content.personalInfo.fullName}` : ""}`}
    >
      <Template content={content} />
    </article>
  );
}
