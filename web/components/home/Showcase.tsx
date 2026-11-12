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

// Homepage showcase (Nov 2026, REDESIGN Nov 12 — user order, supersedes
// the Nov 11 headed rails; F-1 Nov 12): real creator + professional
// profiles from the API, newest first — no hardcoded names, counts or
// ratings. The cards render DIRECTLY below the hero search bar, exactly
// like Figma: NO section headings ("Newest creators/professionals"
// removed) and NO Browse-all links. Only the first 4 cards per rail
// render here (4 on desktop, fewer on smaller screens via the
// responsive grid); the rest live on /creators and /professionals,
// reached from the hero search tabs and the nav. Cards are the same
// CreatorCard / ProfessionalCard the marketplace pages use, so they
// link to the same profile pages. There is no public brand/business
// profile page, so the showcase covers creators + professionals only.
//
// F-1 (user order): the showcase shows NOTHING while only test data
// exists. Both hooks pass excludeTest=true, so test/demo-domain owners
// (@test.com, @example.com, @pacten.demo) never appear here. When ZERO
// eligible users exist, HomeShowcase renders NOTHING — no sections, no
// empty-state boxes, no headings, no Join buttons. /creators,
// /professionals, search and for-deal do NOT pass excludeTest and are
// unchanged.

const SHOWCASE_LIMIT = 4;

function CreatorsShowcase() {
  const creators = useMarketplaceCreators({
    sort: "createdAt:desc",
    limit: SHOWCASE_LIMIT,
    excludeTest: true,
  });
  // Zero eligible creators => no section at all (not even an empty
  // state). The list starts empty while the API loads, so this also
  // means no flash of anything before the cards arrive.
  if (creators.length === 0) return null;
  return (
    <section
      data-testid="home-showcase-creators"
      className="mx-auto max-w-[1380px] px-6 pb-4 pt-8 lg:px-12"
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {creators.map((c) => (
          <CreatorCard key={c.id} creator={c} />
        ))}
      </div>
    </section>
  );
}

function ProfessionalsShowcase() {
  const professionals = useMarketplaceProfessionals({
    sort: "createdAt:desc",
    limit: SHOWCASE_LIMIT,
    excludeTest: true,
  });
  if (professionals.length === 0) return null;
  return (
    <section
      data-testid="home-showcase-professionals"
      className="mx-auto max-w-[1380px] px-6 pb-16 pt-4 lg:px-12"
    >
      <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {professionals.map((p) => (
          <ProfessionalCard key={p.id} professional={p} />
        ))}
      </div>
    </section>
  );
}

export function HomeShowcase() {
  // Follow-up fix (Nov 12, USER ORDER): the showcase is OFF on staging
  // and ON at production. The gate is the hostname — only the
  // production domain shows cards. Staging (pacten-pacten1.vercel.app,
  // pacten-theta.vercel.app), localhost and any other host render
  // NOTHING: no cards, no sections, no empty-state boxes, no headings.
  // No code change is needed at production deploy — the same build
  // turns the showcase on the moment it runs on pacten.net. Default
  // OFF until the client-side hostname check runs (SSR has no window,
  // and staging must never flash cards). The excludeTest wiring stays
  // intact underneath, so even on production only real (non-test-
  // domain) users appear. If production ever uses another domain, add
  // it to this list — one place, no other change.
  const PRODUCTION_HOSTNAMES = ["pacten.net", "www.pacten.net"];
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(PRODUCTION_HOSTNAMES.includes(window.location.hostname));
  }, []);
  if (!enabled) return null;
  return (
    <>
      <CreatorsShowcase />
      <ProfessionalsShowcase />
    </>
  );
}
