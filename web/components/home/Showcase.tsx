"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  CreatorCard,
  ProfessionalCard,
} from "@/components/marketplace/Cards";
import {
  useMarketplaceCreators,
  useMarketplaceProfessionals,
} from "@/components/marketplace/useMarketplace";

// Homepage showcase (Nov 2026, REDESIGN Nov 12 — user order, supersedes
// the Nov 11 headed rails): real creator + professional profiles from
// the API, newest first — no hardcoded names, counts or ratings. The
// cards render DIRECTLY below the hero search bar, exactly like Figma:
// NO section headings ("Newest creators/professionals" removed) and NO
// Browse-all links. Only the first 4 cards per rail render here (4 on
// desktop, fewer on smaller screens via the responsive grid); the rest
// live on /creators and /professionals, reached from the hero search
// tabs and the nav. Cards are the same CreatorCard / ProfessionalCard
// the marketplace pages use, so they link to the same profile pages.
// There is no public brand/business profile page, so the showcase
// covers creators + professionals only.

const SHOWCASE_LIMIT = 4;

/**
 * The marketplace hooks start as an empty list while the API loads, so
 * an empty list alone cannot tell "still loading" from "no profiles".
 * Wait a short grace period before showing the empty state, so a
 * populated homepage never flashes "No profiles yet" on first paint.
 */
function useSettled(ms = 2500): boolean {
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSettled(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return settled;
}

function CreatorsShowcase() {
  const creators = useMarketplaceCreators({
    sort: "createdAt:desc",
    limit: SHOWCASE_LIMIT,
  });
  const settled = useSettled();
  return (
    <section
      data-testid="home-showcase-creators"
      className="mx-auto max-w-[1380px] px-6 pb-4 pt-8 lg:px-12"
    >
      {creators.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      ) : settled ? (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-10 text-center shadow-card">
          <p className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            No creator profiles yet — be the first to join
          </p>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] text-ink-500 dark:text-ink-300">
            Join as a creator and your profile will show up here.
          </p>
          <Link href="/signup/creator" className="mt-6 inline-block">
            <Button size="lg">Join as a Creator</Button>
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function ProfessionalsShowcase() {
  const professionals = useMarketplaceProfessionals({
    sort: "createdAt:desc",
    limit: SHOWCASE_LIMIT,
  });
  const settled = useSettled();
  return (
    <section
      data-testid="home-showcase-professionals"
      className="mx-auto max-w-[1380px] px-6 pb-16 pt-4 lg:px-12"
    >
      {professionals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {professionals.map((p) => (
            <ProfessionalCard key={p.id} professional={p} />
          ))}
        </div>
      ) : settled ? (
        <div className="rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-10 text-center shadow-card">
          <p className="text-lg font-semibold text-ink-900 dark:text-ink-50">
            No professional profiles yet — be the first to join
          </p>
          <p className="mx-auto mt-2 max-w-[420px] text-[15px] text-ink-500 dark:text-ink-300">
            Join as a professional and your profile will show up here.
          </p>
          <Link href="/signup/professional" className="mt-6 inline-block">
            <Button size="lg">Join as a Professional</Button>
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function HomeShowcase() {
  return (
    <>
      <CreatorsShowcase />
      <ProfessionalsShowcase />
    </>
  );
}
