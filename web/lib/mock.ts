/**
 * Mock domain types for the Pacten MVP static frontend.
 * No backend yet: pages use these shapes with local mock data only.
 * Mirrors the PRD domain model (Section 8).
 */

export type Role = "brand" | "creator" | "professional";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  verified: boolean;
}

export interface Profile {
  userId: string;
  headline: string;
  bio: string;
  location?: string;
  tags?: string[];
  followerCount?: number;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  status: "draft" | "open" | "closed";
  deliverables?: string[];
}

export interface Application {
  id: string;
  campaignId: string;
  creatorId: string;
  status: "submitted" | "viewed" | "shortlisted" | "rejected" | "accepted";
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
  unread: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

/* ------------------------------------------------------------------ */
/* Home page mock content — all copy taken from the design.        */
/* ------------------------------------------------------------------ */

export interface Step {
  index: string;
  title: string;
  description: string;
}

export interface Professional {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  badge?: string;
}

export interface PricingTier {
  name: string;
  price: string;
  /** Light-blue commission chip under the price, e.g. "15% commission". */
  commission?: string;
  /** Dark pill badge at the top of the card, e.g. "Best Value". */
  badge?: string;
  /** Icon shown in the light-blue square: "gift" | "diamond" | "briefcase". */
  icon: "gift" | "diamond" | "briefcase";
  /** Label shown above the feature list, e.g. "Everything in Pro, plus:". */
  featurePrefix?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}

// 
/* ------------------------------------------------------------------ */
/* Batch 2 — profiles + marketplace.                                   */
/* All copy taken from the design (fileKey eHdTsQ2PCrvYzuG9qhvyXr, */

/* Card names, follower counts, ratings, stats, bios, services, reviews */
/* and section labels come from the cached frames; button/chip labels  */
/* inside unexpanded component instances were not present in the cache  */
/* and use standard marketplace wording (see build notes).              */
/* ------------------------------------------------------------------ */

export interface CreatorCardData {
  id: string;
  name: string;
  followers: string;
  rating: string;
  niches: string[];
  platforms: string[];
  photo: string;
}

export interface ProfessionalCardData {
  id: string;
  name: string;
  role: string;
  experience: string;
  /** Hourly rate as displayed on the card ("$50/hr"), "" when unset. */
  rate?: string;
  rating: string;
  category: string;
  photo: string;
}

export interface CampaignListing {
  id: string;
  title: string;
  brand: string;
  description: string;
  budget: string;
  timeline: string;
  type: string;
  location: string;
  postedAt: string;
  platforms: string[];
}

export interface ProfileStat {
  value: string;
  label: string;
  icon?: string;
}

export interface Review {
  quote: string;
  name: string;
  time: string;
}

export interface PlatformStat {
  platform: string;
  handle: string;
  stats: Array<{ value: string; label: string }>;
}

export interface Service {
  title: string;
  description: string;
  price?: string;
}

/* ------------------------------------------------------------------ */
/* Dashboard mock data — copy extracted from the design     */
/* (fileKey eHdTsQ2PCrvYzuG9qhvyXr): "Brand dashboard" 340:10561,      */
/* "Creator dashboard" 366:25472, "Creator dashboard empty" 418:69025, */
/* "Professional dashboard" 364:22630, "Referral dashboard" 372:32610. */
/* ------------------------------------------------------------------ */

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: string;
}

export const dashboardUser = {
  name: "Olivia Martinez",
  initials: "OM",
};

const dashboardNavBase: DashboardNavItem[] = [
  { label: "My Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
  { label: "Applications", href: "/dashboard/applications", icon: "file" },
  { label: "Messages", href: "/dashboard/messages", icon: "chat" },
  { label: "Referrals", href: "/dashboard/referrals", icon: "gift" },
  { label: "Contracts", href: "/dashboard/contracts", icon: "doc" },
  { label: "Disputes", href: "/dashboard/disputes", icon: "shield" },
  { label: "Subscription", href: "/dashboard/subscription", icon: "card" },
  { label: "Settings", href: "/dashboard/settings", icon: "gear" },
];

/** Prepends the active "My Dashboard" entry (first sidebar row,
 *  highlighted with a filled blue icon chip). */
function withDashboardHome(
  homeHref: string,
  items: DashboardNavItem[]
): DashboardNavItem[] {
  return [{ label: "My Dashboard", href: homeHref, icon: "home" }, ...items];
}

/** Brand sidebar. */
export const brandNav: DashboardNavItem[] = withDashboardHome("/dashboard/brand", [
  dashboardNavBase[0],
  { label: "Applications", href: "/dashboard/applications/received", icon: "file" },
  { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
  { label: "Deals", href: "/dashboard/deals", icon: "briefcase" },
  dashboardNavBase[2],
  dashboardNavBase[3],
  dashboardNavBase[4],
  dashboardNavBase[5],
  dashboardNavBase[6],
  dashboardNavBase[7],
]);

/** Creator / Professional sidebar. Sellers get "Browse Campaigns"
 *  (the public marketplace) instead of the brand-oriented
 *  "My Campaigns" manager entry. */
export const creatorNav: DashboardNavItem[] = withDashboardHome(
  "/dashboard/creator",
  [
    { label: "Browse Campaigns", href: "/campaigns", icon: "megaphone" },
    dashboardNavBase[1],
    { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
    { label: "Deals", href: "/dashboard/deals", icon: "briefcase" },
    ...dashboardNavBase.slice(2),
  ],
);
export const professionalNav: DashboardNavItem[] = withDashboardHome(
  "/dashboard/professional",
  [
    { label: "Browse Campaigns", href: "/campaigns", icon: "megaphone" },
    dashboardNavBase[1],
    { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
    { label: "Deals", href: "/dashboard/deals", icon: "briefcase" },
    ...dashboardNavBase.slice(2),
  ],
);
/** Referral view lives under the brand dashboard nav with Referral active. */
export const referralNav: DashboardNavItem[] = brandNav;

export interface StatCardData {
  value: string;
  label: string;
  delta: string;
  /** Icon shown in the light-blue chip above the value (dashboard stat cards). */
  icon?: string;
}

/** Mobile variant of the second brand stat card . */
export interface RequestRow {
  name: string;
  handle: string;
  campaign: string;
  // FINAL fix (Nov 12): "Accepted" is a request status — an application
  // converted to a deal is accepted, not "Completed" (nothing is
  // complete; the deal is only proposed).
  status: "Active" | "Submitted" | "Completed" | "Accepted";
  date: string;
}

export interface DashboardCampaign {
  title: string;
  handle: string;
  budget: string;
  // GAP-4: was "Active" | "Completed" — the row status now carries the
  // shared canonical campaign label ("Open" / "Completed" / "Closed").
  status: string;
  deadline: string;
  submitted: string;
}

export interface CreatorStats {
  completeness: number;
  earnings: string;
  earningsDelta: string;
}

export interface TrustScoreBreakdown {
  label: string;
  value: string;
}

/* ------------------------- Referral dashboard ------------------------- */

export interface ReferralRow {
  name: string;
  joined: string;
  earnings: string;
  status: "Successful" | "Pending";
}

/* ------------------------------------------------------------------ */
/* Home page —  data from "destop home" (90:2).          */
/* Home-specific: do NOT reuse `pricingTiers` (that feeds /pricing).    */
/* ------------------------------------------------------------------ */

export interface HomePlan {
  name: string;
  price: string;
  features: string[];
  cta: string;
  filled: boolean;
  icon: "gift" | "star" | "briefcase";
  tag?: string;
}

// Per-role home pricing cards — names/prices follow the client's FINAL
// pricing (Oct 21, 2026): every role Free $0 / Pro $29; top tier is
// "Business" ($79) for brands and "Elite" ($79) for creators/professionals.
// The transactional source of truth stays the subscription plans API.
export type HomePlanRole = "brand" | "creator" | "professional";

export const homeSearchChips = [
  "Fashion",
  "Beauty",
  "Fitness",
  "Gaming",
  "Travel",
  "Food",
  "Business",
  "Lifestyle",
];

