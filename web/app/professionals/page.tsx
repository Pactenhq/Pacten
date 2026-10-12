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
import { FilterPanel } from "@/components/marketplace/Filters";
import { useMarketplaceProfessionals } from "@/components/marketplace/useMarketplace";

// 
// Filter drawer content matches "Filter professional" (407:56824).
export default function ProfessionalsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const professionals = useMarketplaceProfessionals();
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
        />
        <div className="mt-10">
          <ResultCount
            count="Showing 1,248 professional"
            quickFilters={["Top Rated", "Verified", "Available Now"]}
          />
        </div>
        <div className="mx-auto mt-8 max-w-[1380px] px-6 lg:px-12">
          <div className="flex gap-8">
            <aside className="hidden w-[300px] shrink-0 lg:block">
              <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <FilterPanel kind="professionals" />
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
                {professionals.map((p) => (
                  <ProfessionalCard key={p.id} professional={p} />
                ))}
              </Stagger>
              <Pagination />
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
        <FilterPanel kind="professionals" />
      </Drawer>
    </>
  );
}
