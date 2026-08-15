import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteConfig();

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: site.url ? absoluteSiteUrl(site.url, "/sitemap.xml") : undefined,
  };
}
