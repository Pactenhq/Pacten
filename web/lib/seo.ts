import type { Metadata } from "next";

/**
 * SEO configuration — single source of truth for canonical URLs and
 * indexing. Copy here is claim-free: no user counts, no testimonials,
 * no brand logos. All wording uses only the client's own keywords.
 *
 * Indexing rule (client instruction: staging must NEVER be indexed):
 * a host is indexable ONLY when it equals the canonical production host
 * configured via NEXT_PUBLIC_SITE_URL (e.g. https://pacten.net). When
 * the variable is unset, nothing is indexable — the staging-safe
 * default. Never hardcode a host here; configure it per deployment.
 */

export function siteBaseUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  return raw || null;
}

export function canonicalHost(): string | null {
  const base = siteBaseUrl();
  if (!base) return null;
  try {
    return new URL(base).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** True only when the request host is the configured canonical host. */
export function isIndexableHost(host: string | null | undefined): boolean {
  const canonical = canonicalHost();
  if (!canonical || !host) return false;
  return host.toLowerCase().split(":")[0] === canonical;
}

/** Absolute base URL for sitemap/canonical links: configured canonical
 *  URL first, otherwise the current request host. */
export function absoluteBaseUrl(requestHost: string | null | undefined): string {
  const base = siteBaseUrl();
  if (base) return base;
  const host = (requestHost ?? "localhost:3000").toLowerCase();
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https";
  return `${protocol}://${host}`;
}

export const SEO_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/creators", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/professionals", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/campaigns", changeFrequency: "weekly" as const, priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly" as const, priority: 0.8 },
];

/** Shared metadata builder for the public marketing routes. Canonical
 *  links are emitted only when NEXT_PUBLIC_SITE_URL is configured. */
export function routeMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords: string[];
}): Metadata {
  const base = siteBaseUrl();
  return {
    title,
    description,
    keywords,
    alternates: base ? { canonical: `${base}${path}` } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      ...(base ? { url: `${base}${path}` } : {}),
    },
  };
}
