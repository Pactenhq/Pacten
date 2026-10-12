"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
  marketplaceCreators,
  marketplaceProfessionals,
  type CreatorCardData,
  type ProfessionalCardData,
} from "@/lib/mock";

const FALLBACK_AVATARS = [
  "/assets/marketplace/creator-theresa-webb.jpg",
  "/assets/marketplace/creator-maya-chen.jpg",
  "/assets/marketplace/creator-kristin-watson.jpg",
  "/assets/marketplace/creator-alex-rivera.jpg",
];

function mapCreator(p: any, i: number): CreatorCardData {
  return {
    id: p.id,
    name: p.displayName || "Creator",
    followers: p.followers ? `${p.followers} followers` : "— followers",
    rating: p.rating ? `${Number(p.rating).toFixed(1)}★` : "New",
    niches: p.niches?.length ? p.niches : [],
    platforms: p.platforms?.length ? p.platforms : [],
    photo: p.avatarUrl || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length],
  };
}

function mapProfessional(p: any, i: number): ProfessionalCardData {
  return {
    id: p.id,
    name: p.displayName || "Professional",
    role: p.title || "Social Media Professional",
    experience: p.hourlyRate ? `£${p.hourlyRate}/hr` : "",
    rating: p.rating ? `${Number(p.rating).toFixed(1)}★` : "New",
    category: p.skills?.[0] || "",
    photo: p.avatarUrl || FALLBACK_AVATARS[i % FALLBACK_AVATARS.length],
  };
}

/**
 * Loads the public marketplace lists from the real API. Falls back to the
 * built-in showcase data when the API is unreachable or returns nothing,
 * 
 */
export function useMarketplaceCreators(): CreatorCardData[] {
  const [list, setList] = useState<CreatorCardData[]>(marketplaceCreators);
  useEffect(() => {
    let alive = true;
    api
      .creators("?limit=24")
      .then((rows) => {
        if (alive && Array.isArray(rows) && rows.length > 0) {
          setList(rows.map(mapCreator));
        }
      })
      .catch(() => {
        /* keep mock fallback */
      });
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

export function useMarketplaceProfessionals(): ProfessionalCardData[] {
  const [list, setList] = useState<ProfessionalCardData[]>(
    marketplaceProfessionals
  );
  useEffect(() => {
    let alive = true;
    api
      .professionals("?limit=24")
      .then((rows) => {
        if (alive && Array.isArray(rows) && rows.length > 0) {
          setList(rows.map(mapProfessional));
        }
      })
      .catch(() => {
        /* keep mock fallback */
      });
    return () => {
      alive = false;
    };
  }, []);
  return list;
}
