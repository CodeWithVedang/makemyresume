import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/config";
import { GUIDES } from "@/lib/content/guides";

/** Marketing pages and guides. Public resumes are discoverable via their own links, not listed here. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  const pages = [
    { path: "", priority: 1 },
    { path: "/templates", priority: 0.9 },
    { path: "/pricing", priority: 0.8 },
    { path: "/features", priority: 0.7 },
    { path: "/guides", priority: 0.7 },
    { path: "/about", priority: 0.4 },
  ];
  return [
    ...pages.map((p) => ({ url: `${base}${p.path}`, changeFrequency: "weekly" as const, priority: p.priority })),
    ...GUIDES.map((g) => ({
      url: `${base}/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
