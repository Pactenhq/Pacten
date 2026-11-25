"use client";

import { useState, useEffect } from "react";
import { Skeleton, GridCardsSkeleton } from "@/components/ui/Skeleton";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import {
  MarketplaceHero,
  ResultCount,
  Pagination,
} from "@/components/marketplace/MarketplaceHero";
import { CampaignCard } from "@/components/marketplace/Cards";
import { FilterPanel, type CampaignFilters } from "@/components/marketplace/Filters";
import { api } from "@/lib/api";

// 
// Filter drawer content matches "Filter campagns" (411:58388).
export default function CampaignsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Start EMPTY: rows come only from the real API.
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [clearKey, setClearKey] = useState(0);
  const handleClearSearch = () => {
    setSearchQuery("");
    setClearKey((k) => k + 1);
    setPage(1);
  };
  const [activeFilters, setActiveFilters] = useState<CampaignFilters>({
    type: "All",
    budget: null,
    country: "",
    city: "",
    language: "",
    skill: "",
    industry: "",
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  // Filter options come from the standardized dataset endpoint —
  // never from the loaded rows, whose free-text values included
  // fictional entries. Cities are fetched per-country inside the
  // filter panel.
  const [datasetOptions, setDatasetOptions] = useState<{
    countries: { code: string; name: string }[];
    languages: string[];
    skills: string[];
    industries: string[];
  } | null>(null);
  useEffect(() => {
    api.datasets().then(setDatasetOptions).catch(() => {});
  }, []);

  // Arriving from the home-page hero search (?q=...) — start filtered.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? params.get("search");
    if (q) {
      setSearchQuery(q);
      setPage(1);
      return;
    }
    const p = parseInt(params.get("page") ?? "", 10);
    if (!Number.isNaN(p) && p > 1) setPage(p);
  }, []);

  useEffect(() => {
    api
      .campaigns()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Map API shape to card shape, fallback to mock when empty.
          const mapped = data.map((c: any) => ({
            ...c,
            id: c.id,
            title: c.title,
            brand: c.brand?.displayName ?? "Business",
            description: c.description,
            budget: c.budget ?? "",
            niches: c.niches ?? [],
          }));
          setCampaigns(mapped);
          setAllCampaigns(mapped);
        }
      })
      .catch(() => {
        // API unavailable — keep mock data
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const countryOptions = (datasetOptions?.countries ?? []).map((c) => c.name);
  const cityOptions: string[] = [];
  const languageOptions = datasetOptions?.languages ?? [];
  const industryOptions = datasetOptions?.industries ?? [];
  const skillOptions = datasetOptions?.skills ?? [];

  const handleFilterChange = (filters: CampaignFilters) => {
    setActiveFilters(filters);
    setPage(1);
  };

  // Parse a free-text budget ("$500–$1,000", "$800", "£500 – £1,000")
  // into a [min, max] dollar range; null when no numbers are present.
  const budgetRange = (b: unknown): [number, number] | null => {
    const nums = (String(b ?? "").match(/[\d,]+(?:\.\d+)?/g) ?? [])
      .map((s) => parseFloat(s.replace(/,/g, "")))
      .filter((n) => !Number.isNaN(n));
    if (nums.length === 0) return null;
    return [Math.min(...nums), Math.max(...nums)];
  };

  // Apply both search query and filters to the campaign list
  useEffect(() => {
    let result = allCampaigns;
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((c: any) =>
        [c.title, c.brand, c.description, c.budget, ...(c.niches ?? [])]
          .filter(Boolean)
          .some((f: any) => String(f).toLowerCase().includes(q))
      );
    }
    if (activeFilters.type && activeFilters.type !== "All") {
      result = result.filter((c: any) =>
        String(c.type ?? "").toLowerCase() === activeFilters.type.toLowerCase()
      );
    }
    if (activeFilters.country) {
      result = result.filter((c: any) =>
        String(c.country ?? "").toLowerCase() === activeFilters.country.toLowerCase()
      );
    }
    if (activeFilters.city) {
      result = result.filter((c: any) =>
        String(c.city ?? "").toLowerCase() === activeFilters.city.toLowerCase()
      );
    }
    if (activeFilters.language) {
      result = result.filter((c: any) =>
        String(c.language ?? "").toLowerCase() === activeFilters.language.toLowerCase()
      );
    }
    if (activeFilters.industry) {
      result = result.filter((c: any) =>
        String(c.industry ?? "").toLowerCase() === activeFilters.industry.toLowerCase()
      );
    }
    if (activeFilters.skill) {
      result = result.filter((c: any) =>
        Array.isArray(c.skills) &&
        c.skills.some(
          (s: string) =>
            String(s).toLowerCase() === activeFilters.skill.toLowerCase()
        )
      );
    }
    if (activeFilters.budget) {
      const [lo, hi] = activeFilters.budget;
      result = result.filter((c: any) => {
        const r = budgetRange(c.budget);
        // Budgets without parseable numbers are kept, not hidden.
        return r === null ? true : r[1] >= lo && r[0] <= hi;
      });
    }
    setCampaigns(result);
  }, [searchQuery, activeFilters, allCampaigns]);

  const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
  const pagedCampaigns = campaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (!loading && page > totalPages) setPage(totalPages);
  }, [totalPages, loading]);
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <MarketplaceHero
          eyebrow="Campaigns & Opportunities"
          titleBlue="Discover creator campaigns"
          titleDark="and business collaborations."
          subtitle="Discover business campaigns, creative projects, and long-term collaborations."
          placeholder="Search by job title, skills, business or keyword..."
          onSearch={handleSearch}
          defaultQuery={searchQuery}
          clearSignal={clearKey}
        />
        <div className="mt-10">
          {loading ? (
            <div className="mx-auto max-w-[1380px] px-6 lg:px-12">
              <Skeleton className="h-[13px] w-44" />
            </div>
          ) : (
            <ResultCount
              count={`Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`}
            />
          )}
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card">
                <FilterPanel kind="campaigns" countryOptions={countryOptions} cityOptions={cityOptions} languageOptions={languageOptions} skillOptions={skillOptions} industryOptions={industryOptions} onFilterChange={handleFilterChange} onClearSearch={handleClearSearch} />
              </div>
            </aside>
            <div className="min-w-0 flex-1">
              <div className="mb-5 lg:hidden">
                <Button
                  variant="outline"
                  onClick={() => setDrawerOpen(true)}
                  className="w-full"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M4 7h10M18 7h2M4 17h4M12 17h8M4 12h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <circle cx="16" cy="7" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="10" cy="17" r="2.2" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  Filters
                </Button>
              </div>
              {loading ? (
                <GridCardsSkeleton count={4} className="grid gap-5 md:grid-cols-2" />
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {pagedCampaigns.map((j) => (
                    <CampaignCard key={j.id} job={j} />
                  ))}
                </div>
              )}
              {!loading && pagedCampaigns.length === 0 && (
                <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-12 text-center shadow-card">
                  <p className="text-lg font-bold text-ink-900 dark:text-ink-50">
                    No campaigns match your search or filters
                  </p>
                  <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
                    Try a different keyword, or clear the filters in the
                    Filters panel.
                  </p>
                </div>
              )}
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filters"
      >
        <FilterPanel kind="campaigns" countryOptions={countryOptions} cityOptions={cityOptions} languageOptions={languageOptions} skillOptions={skillOptions} industryOptions={industryOptions} onFilterChange={handleFilterChange} onClearSearch={handleClearSearch} />
      </Drawer>
    </>
  );
}
