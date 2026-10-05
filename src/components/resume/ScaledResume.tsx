"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { PAGE_SIZES } from "@/lib/resume/page";
import type { ResumeContent } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";
import { ResumeRenderer } from "@/templates/ResumeRenderer";

/**
 * Renders a full-size resume page scaled to fit its container width.
 * `clip` limits the height to one page (thumbnails); otherwise the full
 * document height is shown with page-break guides.
 */
export function ScaledResume({
  content,
  clip = false,
  showPageGuides = false,
  lazy = false,
  className,
}: {
  content: ResumeContent;
  clip?: boolean;
  showPageGuides?: boolean;
  /** Render the page only once it nears the viewport (galleries with many thumbnails). */
  lazy?: boolean;
  className?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(!lazy);

  useEffect(() => {
    const o = outer.current;
    if (visible || !o) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(o);
    return () => io.disconnect();
  }, [visible]);
  const inner = useRef<HTMLDivElement>(null);
  const page = PAGE_SIZES[content.settings.pageSize];
  const [scale, setScale] = useState(0);
  const [height, setHeight] = useState<number>(page.heightPx);

  useLayoutEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      setScale(o.clientWidth / page.widthPx);
      setHeight(i.scrollHeight);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [page.widthPx, visible]);

  const docHeight = clip ? page.heightPx : Math.max(height, page.heightPx);
  const pages = Math.max(1, Math.ceil(docHeight / page.heightPx - 0.02));

  return (
    <div
      ref={outer}
      className={cn("relative w-full overflow-hidden bg-white", className)}
      style={{ height: scale ? docHeight * scale : undefined, aspectRatio: scale ? undefined : `${page.widthPx} / ${page.heightPx}` }}
    >
      {visible ? null : <div aria-hidden="true" className="absolute inset-0 animate-pulse bg-muted/60" />}
      <div
        ref={inner}
        className="absolute top-0 left-0 origin-top-left"
        style={{ width: page.widthPx, transform: `scale(${scale || 0.0001})`, visibility: scale ? "visible" : "hidden" }}
      >
        {visible ? <ResumeRenderer content={content} /> : null}
      </div>
      {showPageGuides && !clip
        ? Array.from({ length: pages - 1 }, (_, n) => (
            <div
              key={n}
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 border-t border-dashed border-highlight/70"
              style={{ top: (n + 1) * page.heightPx * scale }}
            >
              <span className="absolute right-2 -translate-y-1/2 rounded bg-highlight-soft px-1.5 text-[10px] font-medium text-foreground">
                Page {n + 2}
              </span>
            </div>
          ))
        : null}
    </div>
  );
}
