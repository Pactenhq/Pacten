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
