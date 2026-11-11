import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { isIndexableHost, siteBaseUrl } from "@/lib/seo";

/**
 * robots.txt — host-aware. Only the configured canonical production
 * host (NEXT_PUBLIC_SITE_URL) is crawlable. Every other host —
 * including all staging/preview deployments — gets a full disallow,
 * so staging is never indexed. When NEXT_PUBLIC_SITE_URL is unset,
 * nothing is crawlable (staging-safe default).
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host");
  if (!isIndexableHost(host)) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteBaseUrl()}/sitemap.xml`,
  };
}
