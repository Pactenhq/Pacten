"use client";

import { useState, useEffect } from "react";
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
  // Start EMPTY: the page previously seeded itself with mock demo
  // campaigns and only replaced them when the API returned rows, so
  // fake demo cards flashed (and lingered when the API was empty).
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  // FINAL fix (Nov 12): "Clear all" must also clear the hero box's
  // DRAFT value (see MarketplaceHero clearSignal). The parent term
  // alone cannot signal the clear — it may already be "".
  const [clearKey, setClearKey] = useState(0);
  const handleClearSearch = () => {
    setSearchQuery("");
    setClearKey((k) => k + 1);
    setPage(1);
  };
  const [activeFilters, setActiveFilters] = useState<CampaignFilters>({
    type: "All",
    timelines: [],
    locations: [],
    budget: null,
    verifiedOnly: false,
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;

  // Arriving from the home-page hero search (?q=...) — start filtered.
  // FINAL fix (Nov 12): ?page= also initialises the page on load
  // (same defect class as /creators?page=2 rendering page 1). A
  // search term wins and resets to page 1; a bare ?page= keeps it.
  useEffect(() => {
    // Follow-up fix (Nov 12): ?search= also populates the box — the
    // browser-verified defect was /creators?search=... leaving the
    // box empty. ?q= (hero search) still wins when both are present.
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
          // _live marks rows posted by registered brand accounts (the
          // "Verified" filter keeps only these).
          const mapped = data.map((c: any) => ({
            ...c,
            _live: true,
            id: c.id,
            title: c.title,
            brand: c.brand?.displayName ?? "Brand",
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
    if (activeFilters.timelines.length > 0) {
      result = result.filter((c: any) =>
        activeFilters.timelines.some((t) =>
          String(c.timeline ?? "").toLowerCase().includes(t.toLowerCase().split(" ")[0])
        )
      );
    }
    if (activeFilters.locations.length > 0) {
      result = result.filter((c: any) =>
        activeFilters.locations.some((l) =>
          String(c.location ?? "").toLowerCase().includes(l.toLowerCase())
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
    if (activeFilters.verifiedOnly) {
      result = result.filter((c: any) => c._live === true);
    }
    setCampaigns(result);
    // FINAL fix (Nov 12): this effect used to reset the page on EVERY
    // run — including the initial data load, which clobbered a ?page=
    // deep link back to 1. The page now resets only on explicit user
    // actions (handleSearch / handleFilterChange / handleClearSearch
    // below), never when the list itself loads.
  }, [searchQuery, activeFilters, allCampaigns]);

  const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
  const pagedCampaigns = campaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // FINAL fix (Nov 12): a ?page= past the last page (or a page that
  // shrinks away when filters change) must clamp to the last page
  // instead of rendering an empty list — but ONLY once the list has
  // loaded. On first render totalPages is 1 (empty list), so an
  // unguarded clamp would clobber ?page=2 before the list loads.
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
          titleDark="and brand collaborations."
          subtitle="Discover brand campaigns, creative projects, and long-term collaborations."
          placeholder="Search by job title, skills, brand or keyword..."
          onSearch={handleSearch}
          defaultQuery={searchQuery}
          clearSignal={clearKey}
        />
        <div className="mt-10">
          <ResultCount
            // While the fetch is still in flight the list is empty, NOT
            // loaded-empty: showing "Showing 0 campaigns" during a slow
            // fetch reads as "no campaigns exist" (this is what made the
            // first campaign look missing on slow staging). Say loading
            // until the fetch resolves; the !loading empty-state below
            // already handles the truly-empty case.
            count={
              loading
                ? "Loading campaigns…"
                : `Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`
            }
          />
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-card">
                <FilterPanel kind="campaigns" onFilterChange={handleFilterChange} onClearSearch={handleClearSearch} />
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
              <div className="grid gap-5 md:grid-cols-2">
                {pagedCampaigns.map((j) => (
                  <CampaignCard key={j.id} job={j} />
                ))}
              </div>
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
        <FilterPanel kind="campaigns" onFilterChange={handleFilterChange} onClearSearch={handleClearSearch} />
      </Drawer>
    </>
  );
}
