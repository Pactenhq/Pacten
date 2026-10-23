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
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setSearchQuery(q);
      setPage(1);
    }
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
  };

  const handleFilterChange = (filters: CampaignFilters) => {
    setActiveFilters(filters);
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
    setPage(1);
  }, [searchQuery, activeFilters, allCampaigns]);

  const totalPages = Math.max(1, Math.ceil(campaigns.length / PAGE_SIZE));
  const pagedCampaigns = campaigns.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <MarketplaceHero
          eyebrow="1,000+ Active Opportunities"
          titleBlue="Find your next opportunity."
          titleDark="Work on projects you love."
          subtitle="Discover brand campaigns, creative projects, and long-term collaborations."
          placeholder="Search by job title, skills, brand or keyword..."
          onSearch={handleSearch}
          defaultQuery={searchQuery}
        />
        <div className="mt-10">
          <ResultCount
            count={`Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}`}
          />
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <FilterPanel kind="campaigns" onFilterChange={handleFilterChange} />
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
                <div className="rounded-2xl border border-ink-100 bg-white p-12 text-center shadow-card">
                  <p className="text-lg font-bold text-ink-900">
                    No campaigns match your search or filters
                  </p>
                  <p className="mt-2 text-[15px] text-ink-500">
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
        <FilterPanel kind="campaigns" onFilterChange={handleFilterChange} />
      </Drawer>
    </>
  );
}
