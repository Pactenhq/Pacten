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
  PlatformTabs,
} from "@/components/marketplace/MarketplaceHero";
import { CreatorCard } from "@/components/marketplace/Cards";
import { FilterPanel, type CreatorFilters } from "@/components/marketplace/Filters";
import { useMarketplaceCreators } from "@/components/marketplace/useMarketplace";

// 
// Hero copy, result count, card data and filter sections come from the
// cached layout page. The filter panel renders inline on desktop and as
// a slide-over drawer on mobile (mobile Filters button).
function FilterButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mb-5 lg:hidden">
      <Button variant="outline" onClick={onClick} className="w-full">
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
  );
}

export default function CreatorsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const allCreators = useMarketplaceCreators();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [filters, setFilters] = useState<CreatorFilters>({
    category: "All",
    followers: null,
    price: null,
    verifiedOnly: false,
    availableNow: false,
  });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const filtered = allCreators.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      const hay = [c.name, ...(c.niches ?? []), ...(c.platforms ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (activeTab !== "All") {
      const plats = (c.platforms ?? []).map((p: string) => p.toLowerCase());
      if (!plats.some((p: string) => p.includes(activeTab.toLowerCase()))) return false;
    }
    if (filters.category !== "All") {
      const niches = (c.niches ?? []).map((n: string) => n.toLowerCase());
      if (!niches.includes(filters.category.toLowerCase())) return false;
    }
    // Range/boolean filters only exclude items that actually carry data;
    // items without the field pass through so the panel never empties the
    // list just because a profile hasn't filled that field in yet.
    if (filters.followers && c.followersCount != null) {
      const [lo, hi] = filters.followers;
      if (c.followersCount < lo || c.followersCount > hi) return false;
    }
    if (filters.price && c.rateValue != null) {
      const [lo, hi] = filters.price;
      if (c.rateValue < lo || c.rateValue > hi) return false;
    }
    if (filters.verifiedOnly && c.isVerified === false) return false;
    if (filters.availableNow && c.availableNow === false) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };
  const handleTab = (t: string) => {
    setActiveTab(t);
    setPage(1);
  };
  const handleFilter = (f: CreatorFilters) => {
    setFilters(f);
    setPage(1);
  };

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <MarketplaceHero
          eyebrow="10,000+ Verified Creators"
          titleBlue="Find the perfect creator"
          titleDark="for your next campaign."
          subtitle="Browse verified TikTok, Instagram, YouTube, Twitch, LinkedIn and UGC creators."
          placeholder="Search creators, niches or platforms..."
          onSearch={handleSearch}
        />
        <PlatformTabs
          tabs={["All", "TikTok", "Instagram", "YouTube", "Twitch", "LinkedIn"]}
          active={activeTab}
          onTabChange={handleTab}
        />
        <div className="mt-10">
          <ResultCount
            count={`Showing ${filtered.length} creators`}
            quickFilters={["Top Rated", "Verified", "Available Now"]}
          />
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <FilterPanel kind="creators" onCreatorFilterChange={handleFilter} />
              </div>
            </aside>
            <div className="min-w-0 flex-1">
              <FilterButton onClick={() => setDrawerOpen(true)} />
              <Stagger className="grid grid-cols-2 gap-4 sm:gap-5 xl:grid-cols-3" from="scale" stagger={0.08}>
                {paged.map((c) => (
                  <CreatorCard key={c.id} creator={c} />
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
        <FilterPanel kind="creators" onCreatorFilterChange={handleFilter} />
      </Drawer>
    </>
  );
}
