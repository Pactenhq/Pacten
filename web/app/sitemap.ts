import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SEO_ROUTES, absoluteBaseUrl } from "@/lib/seo";

/**
 * sitemap.xml — static public routes only (home, creators,
 * professionals, campaigns, pricing). Detail pages are intentionally
 * excluded: they are account/content pages, not marketing landing
 * pages. URLs use the configured canonical base when set, otherwise
 * the current request host. Crawling itself is gated by robots.txt
 * (non-canonical hosts are fully disallowed there).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host");
  const base = absoluteBaseUrl(host);
  return SEO_ROUTES.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
