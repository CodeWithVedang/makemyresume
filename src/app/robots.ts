import type { MetadataRoute } from "next";

import { appUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/r/"],
        disallow: ["/dashboard", "/resume/", "/settings", "/onboarding", "/api/", "/print/"],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
