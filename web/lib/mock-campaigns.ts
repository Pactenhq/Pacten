/* ------------------------------------------------------------------ */
/* Campaigns + Applications mock data — copy    */
/* layout page (fileKey eHdTsQ2PCrvYzuG9qhvyXr): "My Campaigns"         */
/* 319:12842, "Details Campaigns" 292:12953, "Campaign Request"         */
/* 339:8857, "Management" 416:64240, "Applications brand dashboard"     */
/* 352:16430, "Applications CREATOR and prof dashboard" 357:18550.      */
/* ------------------------------------------------------------------ */

import type { DashboardNavItem } from "./mock";

// Campaign sub-navigation. The list page has no campaign in context, so
// it only links My Campaigns; pages that know the id use the *For(id)
// builders below. Affiliate campaigns are Phase 2 and reporting has no
// data source in MVP, so neither appears in the nav.
export const campaignNav: DashboardNavItem[] = [
  { label: "My Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
];

export const manageNav: DashboardNavItem[] = [
  { label: "My Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
];

// Per-campaign nav: My Campaigns plus Details and Management for the
// campaign in context.
export function campaignNavFor(campaignId: string): DashboardNavItem[] {
  return [
    ...campaignNav,
    { label: "Details", href: `/dashboard/campaigns/${campaignId}`, icon: "file" },
    {
      label: "Management",
      href: `/dashboard/campaigns/${campaignId}/manage`,
      icon: "briefcase",
    },
  ];
}

export function manageNavFor(campaignId: string): DashboardNavItem[] {
  return campaignNavFor(campaignId);
}

export type CampaignTab = "requests" | "active" | "completed";

/* ----------------- My Campaigns list (319:12842, verbatim) ----------------- */

export interface MyCampaignRow {
  title: string;
  handle: string;
  budget: string;
  status: string;
  deadline: string;
  submitted: string;
  /** Real campaign id when the row came from the API (mock rows omit it). */
  id?: string;
  /** Raw API status ("open" | "closed" | ...) when from the API. */
  rawStatus?: string;
}

/** Five identical rows. had a "Deciilned" typo — corrected. */
export const myCampaignPills = ["All", "Open", "Completed", "Closed"];

export interface CampaignListItem {
  title: string;
  handle: string;
  budget: string;
  status: string;
  deadline: string;
  submitted: string;
}

export interface CampaignDetail {
  slug: string;
  title: string;
  description: string;
  notes: string;
  deliverables: string[];
}

export interface CampaignMessage {
  from: string;
  body: string;
  time: string;
  mine?: boolean;
}

/* ------------------------- Management workspace ------------------------- */

export interface ManageHeader {
  title: string;
  submitted: string;
  deadline: string;
  status: string;
  creatorType: string;
  creatorHandle: string;
}

export interface StatusStep {
  label: string;
  detail: string;
  state: "done" | "current" | "todo";
}

/** Info cards under the Management header, verbatim (416:64240). */
/** "Campaign Actions" dropdown menu, verbatim. */
/** Quick action outline buttons on the Management frame, verbatim. */
/** Activity Feed stats + filters, verbatim (416:64240). */
export interface UpdateItem {
  title: string;
  detail: string;
  time: string;
}

export interface AttachmentItem {
  name: string;
  size: string;
  date: string;
}

/** Payment Status card, verbatim from the Management frame (416:64240). */
export interface DeliverableItem {
  title: string;
  priority: "High" | "Medium" | "Low";
  status: "In Progress" | "Overdue" | "Upcoming";
  description: string;
  owner: string;
  due: string;
  progress: number;
  files: number;
  comments: number;
}

export interface SimpleTask {
  title: string;
  detail: string;
}

export interface KanbanTask {
  title: string;
  meta: string;
  progress?: number;
  assignee?: string;
  tag?: string;
}

export interface KanbanColumn {
  title: string;
  count: number;
  tasks: KanbanTask[];
}

/* ----------------------------- Applications ----------------------------- */

export interface BrandApplicationRow {
  name: string;
  handle: string;
  campaign: string;
  brand: string;
  appliedDate: string;
  appliedAgo: string;
  status: string;
}

export interface CreatorApplicationRow {
  company: string;
  initials: string;
  jobTitle: string;
  jobType: string;
  location: string;
  status: string;
  campaignId?: string;
}

