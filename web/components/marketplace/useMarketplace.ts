"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  type CreatorCardData,
  type ProfessionalCardData,
} from "@/lib/mock";

const FALLBACK_AVATARS = [
  "/assets/marketplace/creator-theresa-webb.jpg",
  "/assets/marketplace/creator-maya-chen.jpg",
  "/assets/marketplace/creator-kristin-watson.jpg",
  "/assets/marketplace/creator-alex-rivera.jpg",
];

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

function mapCreator(p: any, i: number): CreatorFilterData {
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
    platforms: p.platforms?.length ? p.platforms : [],
    photo: p.avatarUrl || p.photo || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length],
    isVerified: p.isVerified,
    availableNow: p.availableNow,
    followersCount: parseCompactCount(p.followers),
    rateValue: parseMoney(p.rate),
  };
}

function mapProfessional(p: any, i: number): ProfessionalFilterData {
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
    photo: p.avatarUrl || p.photo || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length],
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

/**
 * Loads the public marketplace lists from the real API only. When the
 * API is unreachable the lists stay EMPTY — never fabricated showcase
 * people. Every item carries the raw fields the filter panel filters
 * on, so the marketplace pages can filter client-side on live data.
 */
export function useMarketplaceCreators(): CreatorFilterData[] {
  // Start EMPTY and fill from the API. Showing the built-in showcase
  // list as a fallback made searches match fake people whose cards
  // linked to profile pages that do not exist.
  const [list, setList] = useState<CreatorFilterData[]>([]);
  useEffect(() => {
    let alive = true;
    api
      .creators("?limit=100")
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
  }, []);
  return list;
}

export function useMarketplaceProfessionals(): ProfessionalFilterData[] {
  const [list, setList] = useState<ProfessionalFilterData[]>([]);
  useEffect(() => {
    let alive = true;
    api
      .professionals("?limit=100")
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
  }, []);
  return list;
}
