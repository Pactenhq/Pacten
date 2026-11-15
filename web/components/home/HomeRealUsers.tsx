"use client";

import { useEffect, useState } from "react";
import {
  CreatorCard,
  ProfessionalCard,
} from "@/components/marketplace/Cards";
import {
  useMarketplaceCreators,
  useMarketplaceProfessionals,
} from "@/components/marketplace/useMarketplace";

// Homepage real-user strips (Nov 2026, user order): the "Match with
// Creators" step and the "Find Best Professionals" section show REAL
// users once the site is live — the same pattern as the main showcase
// (HomeShowcase): real profiles from the API, newest first
// (sort "createdAt:desc"), capped at the FIRST 8 users per section.
// "Top users" by rating is not possible (no reviews/ratings module —
// ratings are always 0), so newest-first is the ranking: fresh signups
// signal a live marketplace and no fake "top" ranking is invented. If
// fewer than 8 real users exist, only those render — never padded with
// fake/mock profiles. excludeTest=true so test/demo-domain owners
// (@test.com, @example.com, @pacten.demo) never appear, and NO
// hardcoded names, counts or ratings anywhere. The cards are the same
// CreatorCard / ProfessionalCard the marketplace pages and the showcase
// use, so they link to the same profile pages.
//
// STAGING BEHAVIOUR (same as the showcase): the strips render NOTHING
// unless the page runs on the production hostname (pacten.net /
// www.pacten.net). On staging, localhost and any other host they render
// no section, no empty-state box, no heading — the homepage looks
// exactly as it did before this change. When ZERO eligible users exist
// they also render nothing. No code change is needed at production
// deploy — the same build turns the strips on the moment it runs on
// pacten.net.

const PRODUCTION_HOSTNAMES = ["pacten.net", "www.pacten.net"];

function useIsProductionHostname(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(PRODUCTION_HOSTNAMES.includes(window.location.hostname));
  }, []);
  return enabled;
}

/** Newest real creators, inside the "Match with Creators" step card. */
export function HomeCreatorsStrip() {
  const enabled = useIsProductionHostname();
  const creators = useMarketplaceCreators({
    sort: "createdAt:desc",
    limit: 8,
    excludeTest: true,
  });
  if (!enabled || creators.length === 0) return null;
  return (
    <div
      data-testid="home-creators-strip"
      className="mt-6 grid grid-cols-2 gap-3"
    >
      {creators.map((c) => (
        <CreatorCard key={c.id} creator={c} />
      ))}
    </div>
  );
}

/** Newest real professionals, under the "Find Best Professionals" section. */
export function HomeProfessionalsStrip() {
  const enabled = useIsProductionHostname();
  const professionals = useMarketplaceProfessionals({
    sort: "createdAt:desc",
    limit: 8,
    excludeTest: true,
  });
  if (!enabled || professionals.length === 0) return null;
  return (
    <div
      data-testid="home-professionals-strip"
      className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
    >
      {professionals.map((p) => (
        <ProfessionalCard key={p.id} professional={p} />
      ))}
    </div>
  );
}
