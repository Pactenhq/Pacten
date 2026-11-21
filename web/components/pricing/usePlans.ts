"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export type PlanRole = "brand" | "creator" | "professional";

export type Plan = {
  id: string;
  role: string;
  code: string;
  name: string;
  tier: string;
  priceCentsMonthly: number;
  currency: string;
  benefits: string[];
};

const cacheKey = (role: string) => `pacten:plans:${role}`;

function readCached(role: string): Plan[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(role));
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Plan[]) : null;
  } catch {
    return null;
  }
}

// Plans load from the API (source of truth for prices and benefits), but
// the API can take ~60s to wake up after idle. The last-known plans for
// the role are rendered instantly from sessionStorage while a background
// refresh re-validates them, so a cold start never shows a spinner.
export function usePlans(role: PlanRole) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const cached = readCached(role);
    setPlans(cached ?? []);
    setLoading(!cached);
    api
      .subscriptionPlans(role)
      .then((data) => {
        if (!alive || !Array.isArray(data)) return;
        setPlans(data as Plan[]);
        try {
          sessionStorage.setItem(cacheKey(role), JSON.stringify(data));
        } catch {
          // Storage full or unavailable: the fresh fetch still renders.
        }
      })
      .catch(() => {
        // Offline / API down: keep whatever the cache had.
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [role]);

  return { plans, loading };
}
