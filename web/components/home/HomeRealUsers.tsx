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
