import type { MetadataRoute } from "next";
import { getProjects, getSiteConfig } from "@/lib/content";
import { absoluteSiteUrl } from "@/lib/base-path";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfig();
  if (!site.url) return [];

  return [
    { url: absoluteSiteUrl(site.url), changeFrequency: "monthly", priority: 1 },
    { url: absoluteSiteUrl(site.url, "/about"), changeFrequency: "yearly", priority: 0.5 },
    ...getProjects().map((project) => ({
      url: absoluteSiteUrl(site.url, `/projects/${project.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
