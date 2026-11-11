"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Reveal } from "@/components/ui/Reveal";
import {
  CreatorCard,
  ProfessionalCard,
} from "@/components/marketplace/Cards";
import {
  useMarketplaceCreators,
  useMarketplaceProfessionals,
} from "@/components/marketplace/useMarketplace";

// Homepage showcase (Nov 2026): real creator + professional profiles
// from the API, newest first — no hardcoded names, counts or ratings.
// Only the first 4 cards render here (4 on desktop, fewer on smaller
// screens via the responsive grid); the rest live on /creators and
// /professionals behind the browse-all links. Cards are the same
// CreatorCard / ProfessionalCard the marketplace pages use, so they
// link to the same profile pages. There is no public brand/business
// profile page, so the showcase covers creators + professionals only.

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

function BrowseAllLink({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId: string;
}) {
  return (
    <div className="mt-8 flex justify-center">
      <Link
        href={href}
        data-testid={testId}
        className="inline-flex items-center gap-2 text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline"
      >
        {label}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
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
      className="mx-auto max-w-[1380px] px-6 py-16 lg:px-12"
    >
      <Reveal>
        <div className="flex justify-start">
          <Tag>Creators</Tag>
        </div>
        <h2 className="mt-6 max-w-[700px] text-4xl font-extrabold tracking-tight lg:text-[52px] lg:leading-[1.1]">
          <span className="text-ink-900 dark:text-ink-50">Newest creators</span>
          <br />
          <span className="text-gradient-blue text-gradient-animated">on Pacten</span>
        </h2>
        <p className="mt-4 max-w-[640px] text-lg leading-relaxed text-ink-500 dark:text-ink-300">
          Creators who recently joined the marketplace — browse their
          profiles and start a collaboration.
        </p>
      </Reveal>
      {creators.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {creators.map((c) => (
            <CreatorCard key={c.id} creator={c} />
          ))}
        </div>
      ) : settled ? (
        <div className="mt-10 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-10 text-center shadow-card">
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
      <BrowseAllLink
        href="/creators"
        label="Browse all creators"
        testId="browse-all-creators"
      />
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
      className="mx-auto max-w-[1380px] px-6 py-16 lg:px-12"
    >
      <Reveal>
        <div className="flex justify-start">
          <Tag>Professionals</Tag>
        </div>
        <h2 className="mt-6 max-w-[700px] text-4xl font-extrabold tracking-tight lg:text-[52px] lg:leading-[1.1]">
          <span className="text-ink-900 dark:text-ink-50">Newest professionals</span>
          <br />
          <span className="text-gradient-blue text-gradient-animated">on Pacten</span>
        </h2>
        <p className="mt-4 max-w-[640px] text-lg leading-relaxed text-ink-500 dark:text-ink-300">
          Social media professionals who recently joined — find editors,
          designers, strategists and copywriters for your next campaign.
        </p>
      </Reveal>
      {professionals.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {professionals.map((p) => (
            <ProfessionalCard key={p.id} professional={p} />
          ))}
        </div>
      ) : settled ? (
        <div className="mt-10 rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-10 text-center shadow-card">
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
      <BrowseAllLink
        href="/professionals"
        label="Browse all professionals"
        testId="browse-all-professionals"
      />
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
