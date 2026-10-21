"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M8 1.5 9.6 6.1 14.5 7.5 9.6 8.9 8 13.5 6.4 8.9 1.5 7.5 6.4 6.1 8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M13 1.5 13.7 3.3 15.5 4 13.7 4.7 13 6.5 12.3 4.7 10.5 4 12.3 3.3 13 1.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Marketplace hero — from the design marketplace frames ("Marketplace
// Creator" 278:4057, "Marketplace professional" 401:55119, "Marketplace
// campaign" 408:56995): sparkle pill, two-color headline (blue first
// line, dark second line), subcopy, search panel with the Search button
// inside the input on the right.
export function MarketplaceHero({
  eyebrow,
  titleBlue,
  titleDark,
  subtitle,
  placeholder,
  onSearch,
  defaultQuery,
}: {
  eyebrow: string;
  titleBlue: string;
  titleDark: string;
  subtitle: string;
  placeholder: string;
  onSearch?: (query: string) => void;
  defaultQuery?: string;
}) {
  const [query, setQuery] = useState(defaultQuery ?? "");
  // Keep the box in sync when the page's term arrives from the URL (?q=...).
  useEffect(() => {
    if (defaultQuery) setQuery(defaultQuery);
  }, [defaultQuery]);
  const submit = () => onSearch?.(query);
  return (
    <section className="mx-auto max-w-[1380px] px-6 pt-12 text-center lg:px-12 lg:pt-16">
      <div className="flex justify-center">
        <span className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-50 px-4 text-sm font-semibold text-brand">
          <SparkleIcon />
          {eyebrow}
        </span>
      </div>
      <h1 className="mx-auto mt-6 max-w-[900px] break-words text-[28px] font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-[64px] lg:leading-[1.05]">
        <span className="text-gradient-blue block">{titleBlue}</span>
        <span className="block text-ink-900">{titleDark}</span>
      </h1>
      <p className="mx-auto mt-5 max-w-[640px] text-lg text-ink-600">{subtitle}</p>
      <div className="mx-auto mt-8 max-w-[820px] rounded-2xl border border-ink-100 bg-white p-2 shadow-[0_2px_16px_rgba(16,24,40,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="h-[52px] w-full bg-transparent px-4 text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            aria-label={placeholder}
          />
          <Button
            onClick={submit}
            className="inline-flex h-[52px] w-full shrink-0 items-center justify-center gap-2 !rounded-xl px-6 sm:w-auto"
          >
            Search
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M8.25 14.25a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM16.5 16.5l-3.9-3.9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ResultCount({
  count,
  quickFilters,
}: {
  count: string;
  quickFilters?: string[];
}) {
  return (
    <div className="mx-auto max-w-[1380px] px-6 lg:px-12">
      <p className="text-[13px] text-ink-500">{count}</p>
      {quickFilters && quickFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
          <span className="text-sm font-bold text-ink-900">Quick Filters:</span>
          {quickFilters.map((f) => (
            <label
              key={f}
              className="flex cursor-pointer items-center gap-2 text-[15px] text-ink-700"
            >
              <input
                type="checkbox"
                className="h-[18px] w-[18px] cursor-pointer rounded border-ink-300 accent-[#0c29ab]"
              />
              {f}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export function Pagination({
  page = 1,
  totalPages = 4,
  onPageChange,
}: {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange?.(p)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
            p === page
              ? "border-brand bg-white font-semibold text-brand"
              : "border-ink-200 bg-white text-ink-700 hover:border-brand hover:text-brand"
          )}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange?.(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-700 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </nav>
  );
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  All: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="9.5" y="1.5" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="1.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  ),
  TikTok: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/icons/tiktok-black.svg" alt="TikTok" width={16} height={16} aria-hidden />
  ),
  Instagram: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/icons/instagram-black.svg" alt="Instagram" width={16} height={16} aria-hidden />
  ),
  YouTube: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/icons/youtube-black.svg" alt="YouTube" width={16} height={16} aria-hidden />
  ),
  Twitch: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/icons/twitch-black.svg" alt="Twitch" width={16} height={16} aria-hidden />
  ),
  LinkedIn: (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/assets/icons/linkedin-black.svg" alt="LinkedIn" width={16} height={16} aria-hidden />
  ),
};

export function PlatformTabs({
  tabs,
  active,
  onTabChange,
}: {
  tabs: string[];
  active?: string;
  onTabChange?: (tab: string) => void;
}) {
  const current = active ?? tabs[0];
  return (
    <div className="mx-auto mt-8 flex max-w-[1380px] flex-wrap items-center gap-2 px-6 lg:px-12">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onTabChange?.(t)}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
            t === current
              ? "border-brand bg-white font-semibold text-brand"
              : "border-ink-200 bg-white text-ink-700 hover:border-brand hover:text-brand"
          )}
        >
          {PLATFORM_ICONS[t] ?? PLATFORM_ICONS.All}
          {t === "TikTok" ? "Tik Tok" : t}
        </button>
      ))}
    </div>
  );
}
