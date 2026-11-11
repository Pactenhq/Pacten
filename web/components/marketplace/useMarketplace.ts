"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  type CreatorCardData,
  type ProfessionalCardData,
} from "@/lib/mock";

/** "12.4K" -> 12400, "2.3M" -> 2300000, "500" -> 500, "—" -> null */
export function parseCompactCount(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s || s.startsWith("—") || s.startsWith("-")) return null;
  const m = s.match(/([\d.]+)\s*([KMBkmb])?/);
  if (!m) return null;
  const mult =
    (m[2] || "").toUpperCase() === "M"
      ? 1e6
      : (m[2] || "").toUpperCase() === "K"
        ? 1e3
        : (m[2] || "").toUpperCase() === "B"
          ? 1e9
          : 1;
  const n = parseFloat(m[1]) * mult;
  return Number.isNaN(n) ? null : n;
}

/** "$500/hr", "$500", "500" -> 500 */
export function parseMoney(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).replace(/,/g, "");
  const m = s.match(/([\d.]+)\s*([Kk])?/);
  if (!m) return null;
  const n = parseFloat(m[1]) * (m[2] ? 1e3 : 1);
  return Number.isNaN(n) ? null : n;
}

/** "5+ years" -> 5 */
export function parseYears(raw: unknown): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return raw;
  const m = String(raw).match(/([\d.]+)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  return Number.isNaN(n) ? null : n;
}

/** Card data plus the raw fields the filter panel needs. */
export interface CreatorFilterData extends CreatorCardData {
  isVerified?: boolean;
  availableNow?: boolean;
  followersCount: number | null;
  rateValue: number | null;
  languagesList: string[];
  industriesList: string[];
  skillsList: string[];
}

export interface ProfessionalFilterData extends ProfessionalCardData {
  isVerified?: boolean;
  availableNow?: boolean;
  openToProjects?: boolean;
  hourlyRateValue: number | null;
  yearsExp: number | null;
  skillsList: string[];
  languagesList: string[];
  industriesList: string[];
}

function mapCreator(p: any): CreatorFilterData {
  return {
    id: p.id,
    name: p.displayName || p.name || "Creator",
    followers:
      p.followers == null
        ? "— followers"
        : /follower/i.test(String(p.followers))
          ? String(p.followers)
          : `${p.followers} followers`,
    rating:
      p.rating != null && !String(p.rating).includes("★")
        ? `${Number(p.rating).toFixed(1)}★`
        : (p.rating ?? "New"),
    niches: p.niches?.length ? p.niches : [],
    languagesList: Array.isArray(p.languages) ? p.languages : [],
    industriesList: Array.isArray(p.industries) ? p.industries : [],
    skillsList: Array.isArray(p.skills) ? p.skills : [],
    platforms: p.platforms?.length ? p.platforms : [],
    // No stock-photo fallback: when there is no real avatar, photo is
    // empty and the card renders the initials Avatar instead.
    photo: p.avatarUrl || p.photo || "",
    isVerified: p.isVerified,
    availableNow: p.availableNow,
    followersCount: parseCompactCount(p.followers),
    rateValue: parseMoney(p.rate),
  };
}

function mapProfessional(p: any): ProfessionalFilterData {
  return {
    id: p.id,
    name: p.displayName || p.name || "Professional",
    role: p.title || p.role || "Social Media Professional",
    // yearsExperience defaults to 0 in the DB, so only a positive value
    // counts as real experience — 0 must fall through to "" ("New").
    experience:
      p.yearsExperience != null && Number(p.yearsExperience) > 0
        ? `${p.yearsExperience} years`
        : (p.experience ?? ""),
    // The rate is its own stat ("$50/hr") — never folded into the
    // experience slot, so it can never render "$50/hr of experience".
    rate: p.hourlyRate != null ? `$${p.hourlyRate}/hr` : "",
    rating:
      p.rating != null && !String(p.rating).includes("★")
        ? `${Number(p.rating).toFixed(1)}★`
        : (p.rating ?? "New"),
    category: p.skills?.[0] || p.category || "",
    // No stock-photo fallback: when there is no real avatar, photo is
    // empty and the card renders the initials Avatar instead.
    photo: p.avatarUrl || p.photo || "",
    isVerified: p.isVerified,
    availableNow: p.availableNow,
    openToProjects: p.openToProjects,
    hourlyRateValue: parseMoney(p.hourlyRate),
    yearsExp: parseYears(p.yearsExperience ?? p.experience),
    skillsList: Array.isArray(p.skills) ? p.skills : [],
    languagesList: Array.isArray(p.languages) ? p.languages : [],
    industriesList: Array.isArray(p.industries) ? p.industries : [],
  };
}

export interface MarketplaceListOptions {
  /** Opt-in API sort, e.g. "createdAt:desc" (newest first). Without it
   *  the API keeps its default order (rating DESC). */
  sort?: string;
  /** Max rows to fetch. Defaults to 100 — the exact current behavior. */
  limit?: number;
}

function buildListParams(options?: MarketplaceListOptions): string {
  const params = new URLSearchParams();
  params.set("limit", String(options?.limit ?? 100));
  if (options?.sort) params.set("sort", options.sort);
  return `?${params.toString()}`;
}

/**
 * Loads the public marketplace lists from the real API only. When the
 * API is unreachable the lists stay EMPTY — never fabricated showcase
 * people. Every item carries the raw fields the filter panel filters
 * on, so the marketplace pages can filter client-side on live data.
 */
export function useMarketplaceCreators(options?: MarketplaceListOptions): CreatorFilterData[] {
  // Start EMPTY and fill from the API. Showing the built-in showcase
  // list as a fallback made searches match fake people whose cards
  // linked to profile pages that do not exist.
  const sort = options?.sort;
  const limit = options?.limit;
  const [list, setList] = useState<CreatorFilterData[]>([]);
  useEffect(() => {
    let alive = true;
    api
      .creators(buildListParams({ sort, limit }))
      .then((rows) => {
        if (alive && Array.isArray(rows)) {
          setList(rows.map(mapCreator));
        }
      })
      .catch(() => {
        // API unreachable: keep the list empty. Never show fake people.
      });
    return () => {
      alive = false;
    };
  }, [sort, limit]);
  return list;
}

export function useMarketplaceProfessionals(options?: MarketplaceListOptions): ProfessionalFilterData[] {
  const sort = options?.sort;
  const limit = options?.limit;
  const [list, setList] = useState<ProfessionalFilterData[]>([]);
  useEffect(() => {
    let alive = true;
    api
      .professionals(buildListParams({ sort, limit }))
      .then((rows) => {
        if (alive && Array.isArray(rows)) {
          setList(rows.map(mapProfessional));
        }
      })
      .catch(() => {
        // API unreachable: keep the list empty. Never show fake people.
      });
    return () => {
      alive = false;
    };
  }, [sort, limit]);
  return list;
}
