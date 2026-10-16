"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Stagger } from "@/components/ui/Reveal";
import {
  MarketplaceHero,
  ResultCount,
  Pagination,
} from "@/components/marketplace/MarketplaceHero";
import { ProfessionalCard } from "@/components/marketplace/Cards";
import {
  FilterPanel,
  type ProfessionalFilters,
} from "@/components/marketplace/Filters";
import { useMarketplaceProfessionals } from "@/components/marketplace/useMarketplace";

// Years-of-experience buckets for the "Experience Level" check group.
function expBucket(years: number | null): "Entry" | "Mid" | "Expert" | null {
  if (years == null) return null;
  if (years < 2) return "Entry";
  if (years < 5) return "Mid";
  return "Expert";
}

// "Editors" pill should match a "Video Editor" role: compare the singular form.
function categoryMatches(pill: string, p: { role?: string; category?: string; skillsList?: string[] }) {
  const singular = pill.toLowerCase().replace(/s$/, "");
  const hay = [p.role, p.category, ...(p.skillsList ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(singular);
}

// Filter drawer content matches "Filter professional" (407:56824).
export default function ProfessionalsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const allProfessionals = useMarketplaceProfessionals();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<ProfessionalFilters>({
    category: "All",
    hourlyRate: null,
    verifiedOnly: false,
    availableNow: false,
    openToProjects: false,
    experience: [],
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const filtered = allProfessionals.filter((p) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const hay = [p.name, p.role, p.category, ...(p.skillsList ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.category !== "All" && !categoryMatches(filters.category, p)) {
      return false;
    }
    // Range/boolean filters only exclude items that actually carry data;
    // items without the field pass through so the panel never empties the
    // list just because a profile hasn't filled that field in yet.
    if (filters.hourlyRate && p.hourlyRateValue != null) {
      const [lo, hi] = filters.hourlyRate;
      if (p.hourlyRateValue < lo || p.hourlyRateValue > hi) return false;
    }
    if (filters.verifiedOnly && p.isVerified === false) return false;
    if (filters.availableNow && p.availableNow === false) return false;
    if (filters.openToProjects && p.openToProjects === false) return false;
    if (filters.experience.length > 0) {
      const bucket = expBucket(p.yearsExp);
      if (bucket == null || !filters.experience.includes(bucket)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };
  const handleFilter = (f: ProfessionalFilters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <MarketplaceHero
          eyebrow="10,000+ Verified Professionals"
          titleBlue="Find the right professional"
          titleDark="for your next project."
          subtitle="Work with vetted editors, designers, strategists, copywriters and more."
          placeholder="Search professionals, skills or services..."
          onSearch={handleSearch}
        />
        <div className="mt-10">
          <ResultCount
            count={`Showing ${filtered.length} professionals`}
            quickFilters={["Top Rated", "Verified", "Available Now"]}
          />
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <FilterPanel kind="professionals" onProfessionalFilterChange={handleFilter} />
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
              <Stagger className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3" from="scale" stagger={0.08}>
                {paged.map((p) => (
                  <ProfessionalCard key={p.id} professional={p} />
                ))}
              </Stagger>
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
        <FilterPanel kind="professionals" onProfessionalFilterChange={handleFilter} />
      </Drawer>
    </>
  );
}
