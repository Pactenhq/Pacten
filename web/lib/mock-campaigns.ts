/* ------------------------------------------------------------------ */
/* Campaigns + Applications mock data — copy    */
/* layout page (fileKey eHdTsQ2PCrvYzuG9qhvyXr): "My Campaigns"         */
/* 319:12842, "Details Campaigns" 292:12953, "Campaign Request"         */
/* 339:8857, "Management" 416:64240, "Applications brand dashboard"     */
/* 352:16430, "Applications CREATOR and prof dashboard" 357:18550.      */
/* ------------------------------------------------------------------ */

import type { DashboardNavItem } from "./mock";

/** Campaign sub-navigation, exactly as  campaign frames. */
export const campaignNav: DashboardNavItem[] = [
  { label: "My Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
  { label: "Affiliate", href: "#", icon: "gift" },
  { label: "Details", href: "/dashboard/campaigns/summer-glow", icon: "file" },
  {
    label: "Management",
    href: "/dashboard/campaigns/summer-glow/manage",
    icon: "briefcase",
  },
  { label: "Reporting", href: "#", icon: "chart" },
];

/** Management workspace sidebar: no Reporting item (416:64240). */
export const manageNav: DashboardNavItem[] = [
  { label: "My Campaigns", href: "/dashboard/campaigns", icon: "megaphone" },
  { label: "Affiliate", href: "#", icon: "gift" },
  { label: "Details", href: "/dashboard/campaigns/summer-glow", icon: "file" },
  {
    label: "Management",
    href: "/dashboard/campaigns/summer-glow/manage",
    icon: "briefcase",
  },
];

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
export const myCampaignRows: MyCampaignRow[] = [
  { title: "New Product Launch", handle: "@sophie.c", budget: "$0", status: "Pending", deadline: "Nov 2, 2026", submitted: "Sep 2, 2026" },
  { title: "New Product Launch", handle: "@sophie.c", budget: "$0", status: "Accepted", deadline: "Nov 2, 2026", submitted: "Sep 2, 2026" },
  { title: "New Product Launch", handle: "@sophie.c", budget: "$0", status: "Completed", deadline: "Nov 2, 2026", submitted: "Sep 2, 2026" },
  { title: "New Product Launch", handle: "@sophie.c", budget: "$0", status: "Declined", deadline: "Nov 2, 2026", submitted: "Sep 2, 2026" },
  { title: "New Product Launch", handle: "@sophie.c", budget: "$0", status: "Declined", deadline: "Nov 2, 2026", submitted: "Sep 2, 2026" },
];

export const myCampaignPills = ["All", "Pending", "Accepted", "Completed", "Declined", "Cancelled"];

export interface CampaignListItem {
  title: string;
  handle: string;
  budget: string;
  status: string;
  deadline: string;
  submitted: string;
}

export const campaignRequests: CampaignListItem[] = [
  {
    title: "Hydrating Serum Launch",
    handle: "@sophie.c",
    budget: "$0",
    status: "Pending",
    deadline: "Nov 3, 2026",
    submitted: "Sep 1, 2026",
  },
  {
    title: "Autumn Skincare Edit",
    handle: "@janesmith",
    budget: "$0",
    status: "Pending",
    deadline: "Nov 10, 2026",
    submitted: "Aug 30, 2026",
  },
];

export interface CampaignDetail {
  slug: string;
  title: string;
  description: string;
  notes: string;
  deliverables: string[];
}

export const campaignDetails: Record<string, CampaignDetail> = {
  "summer-glow": {
    slug: "summer-glow",
    title: "Summer Glow Campaign",
    description:
      "We\u2019re looking for creators to showcase our Hydrating Serum in a natural, authentic way. Focus on skincare routine, real results, and lifestyle integration.",
    notes:
      "Please highlight the key benefits: hydration, glowing skin, and suitable for all skin types.",
    deliverables: [
      "1 Instagram Reel (30\u201360s)",
      "3 Instagram Stories",
      "High-quality photos (5\u201310)",
    ],
  },
};

export interface CampaignMessage {
  from: string;
  body: string;
  time: string;
  mine?: boolean;
}

export const campaignMessages: CampaignMessage[] = [
  {
    from: "Sophie Carter",
    body: "Hey! I\u2019m interested in this campaign...",
    time: "10:24 AM",
  },
];

/* ------------------------- Management workspace ------------------------- */

export interface ManageHeader {
  title: string;
  submitted: string;
  deadline: string;
  status: string;
  creatorType: string;
  creatorHandle: string;
}

export const manageHeader: ManageHeader = {
  title: "Summer Glow Campaign",
  submitted: "Sep 1, 2026",
  deadline: "Nov 3, 2026",
  status: "Pending",
  creatorType: "Lifestyle, Beauty",
  creatorHandle: "@janesmith",
};

export interface StatusStep {
  label: string;
  detail: string;
  state: "done" | "current" | "todo";
}

export const campaignStatusSteps: StatusStep[] = [
  { label: "Campaign Created", detail: "Jan 5, 2025, 2:30 PM", state: "done" },
  { label: "Accepted", detail: "Accepted Date: Jan 5, 2025", state: "done" },
  {
    label: "Content Submitted",
    detail: "Jan 12, 2025, 4:18 PM",
    state: "current",
  },
  { label: "Last Updated", detail: "Jan 15, 2025, 9:20 AM", state: "todo" },
];

export const campaignMeta = {
  declinedDate: "\u2014",
  paymentStatus: "Pending",
};

/** Info cards under the Management header, verbatim (416:64240). */
export const manageInfoCards = [
  { icon: "clock", label: "Deadline", value: "Nov 3, 2026" },
  { icon: "gift", label: "Creator Type", value: "Lifestyle, Beauty" },
  { icon: "user", label: "Creator", value: "@janesmith" },
  { icon: "wallet", label: "Budget", value: "\u00a30" },
  { icon: "card", label: "Payment Status", value: "Pending" },
  { icon: "note", label: "Notes", value: "Please highlight the key benefits" },
];

/** "Campaign Actions" dropdown menu, verbatim. */
export const campaignActionsMenu = [
  "View Task",
  "Edit Task",
  "Assign Task",
  "Add Subtask",
  "Change Status",
  "Duplicate Task",
  "Delete Task",
];

/** Quick action outline buttons on the Management frame, verbatim. */
export const campaignQuickActions = [
  "Link Messages",
  "Notify Team",
  "Send Invoice",
  "Update Status",
  "Invite Members",
  "Assign Team",
  "Mark as Active",
  "Archive Campaign",
  "Link Jobs",
  "Link Services",
];

/** Activity Feed stats + filters, verbatim (416:64240). */
export const activityFeedStats = [
  { value: "24", label: "Campaign Events" },
  { value: "8", label: "Messages" },
  { value: "6", label: "Task Updates" },
  { value: "3", label: "Payments" },
];
export const activityFeedFilters = [
  "All", "Messages", "Files", "Approvals", "Deadline Changes",
  "Task Updates", "Payments", "Contract",
];
export const activityFeedEntries = [
  {
    date: "Today",
    title: "Campaign accepted",
    detail: "Campaign status updated to Accepted",
    time: "2 hours ago",
  },
];

export interface UpdateItem {
  title: string;
  detail: string;
  time: string;
}

export const recentUpdates: UpdateItem[] = [
  {
    title: "Campaign accepted",
    detail: "Status updated to Accepted",
    time: "2 hours ago",
  },
  {
    title: "Message received",
    detail: "New message from Sophie Carter",
    time: "5 hours ago",
  },
  {
    title: "Creator assigned",
    detail: "Sophie Carter was added to this campaign",
    time: "1 day ago",
  },
];

export interface AttachmentItem {
  name: string;
  size: string;
  date: string;
}

export const campaignAttachments: AttachmentItem[] = [
  { name: "Campaign Brief.pdf", size: "2.4 MB", date: "Jan 5" },
  { name: "Product Images", size: "2.4 MB", date: "Jan 5" },
];

/** Payment Status card, verbatim from the Management frame (416:64240). */
export const budgetPayment = {
  status: "Pending",
  amount: "$150",
  progress: 75,
  totalTasks: 5,
  completedTasks: 4,
};

export const keyDates = [
  { label: "Submission Deadline", value: "Nov 3, 2026" },
  { label: "Campaign Start", value: "Nov 3, 2026" },
  { label: "Payment Due", value: "Nov 30, 2026" },
];

export const assignedCreator = {
  name: "Jane S.",
  location: "London, UK",
  followers: "123K",
  engagement: "4.8%",
  reviews: "123",
  rating: "4.9",
  initials: "JS",
  chips: ["Fashion", "Beauty", "Lifestyle"],
};

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

export const manageDeliverables: DeliverableItem[] = [
  {
    title: "Instagram Reel \u2013 Product Launch",
    priority: "High",
    status: "In Progress",
    description:
      "30-second product showcase reel featuring the new summer collection.",
    owner: "Sarah M.",
    due: "Jul 28",
    progress: 65,
    files: 3,
    comments: 5,
  },
  {
    title: "TikTok Dance Challenge",
    priority: "High",
    status: "Overdue",
    description:
      "15-second trending dance challenge video promoting the brand\u2019s summer vibe.",
    owner: "James T.",
    due: "Nov 2, 2026",
    progress: 25,
    files: 2,
    comments: 1,
  },
  {
    title: "YouTube Review Video",
    priority: "Medium",
    status: "Upcoming",
    description:
      "In-depth product review covering features and final verdict.",
    owner: "Sarah M.",
    due: "Nov 5, 2026",
    progress: 0,
    files: 1,
    comments: 2,
  },
];

export const deliverableSummary = {
  total: 5,
  overallProgress: 33,
  overdue: 1,
  upcoming: 1,
  completed: 0,
  blocked: 0,
  late: 1,
};

export interface SimpleTask {
  title: string;
  detail: string;
}

export const upcomingTasks: SimpleTask[] = [
  { title: "Submit deliverables by deadline", detail: "Due Jul 28" },
  { title: "Confirm payment with brand", detail: "Due Aug 5" },
  { title: "Review campaign deliverables", detail: "In progress" },
  { title: "Send final report to brand", detail: "Pending" },
];

export const upcomingDeliverables: SimpleTask[] = [
  { title: "Content draft due", detail: "Jul 18" },
  { title: "Final video submission", detail: "Jul 22" },
  { title: "Publish post \u2014 Instagram", detail: "Jul 30" },
  { title: "Q3 Brand Push", detail: "Jul 15 \u00b7 Active" },
];

export const deadlinesMeetings: SimpleTask[] = [
  { title: "Campaign Deadline", detail: "Aug 1" },
  { title: "Creator Sync Call", detail: "Jul 25, 2pm" },
];

export const contentPublishDates: SimpleTask[] = [
  { title: "Instagram Story", detail: "Jul 20" },
  { title: "YouTube Short", detail: "Jul 24" },
  { title: "Twitter Thread", detail: "Jul 28" },
  { title: "LinkedIn Post", detail: "Aug 2" },
];

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

export const taskBoard: KanbanColumn[] = [
  {
    title: "To Do",
    count: 4,
    tasks: [
      { title: "Write Instagram caption copy", meta: "2 subtasks", assignee: "JD" },
      { title: "Plan content calendar", meta: "Aug 5 \u00b7 1 subtasks" },
    ],
  },
  {
    title: "In Progress",
    count: 2,
    tasks: [
      {
        title: "Shoot product photos",
        meta: "Jul 25",
        progress: 50,
        assignee: "MB",
        tag: "Urgent",
      },
    ],
  },
  {
    title: "Awaiting Review",
    count: 1,
    tasks: [{ title: "Edit promo video", meta: "3 subtasks", progress: 80 }],
  },
  {
    title: "Completed",
    count: 3,
    tasks: [{ title: "Submit final draft", meta: "Done Jul 18" }],
  },
];

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

export const brandApplications: BrandApplicationRow[] = [
  {
    name: "Jane Smith",
    handle: "@janesmith",
    campaign: "Summer Collection",
    brand: "Blush & Co.",
    appliedDate: "Aug 28, 2025",
    appliedAgo: "2 days ago",
    status: "Under Review",
  },
];

export interface CreatorApplicationRow {
  company: string;
  initials: string;
  jobTitle: string;
  jobType: string;
  location: string;
  status: string;
  campaignId?: string;
}

export const creatorApplications: CreatorApplicationRow[] = [
  {
    company: "Company",
    initials: "SC",
    jobTitle: "Social Media Creator",
    jobType: "Part-time",
    location: "Remote",
    status: "Under Review",
  },
  {
    company: "Company",
    initials: "SC",
    jobTitle: "Social Media Creator",
    jobType: "Part-time",
    location: "Remote",
    status: "Under Review",
  },
  {
    company: "Company",
    initials: "SC",
    jobTitle: "Social Media Creator",
    jobType: "Part-time",
    location: "Remote",
    status: "Under Review",
  },
  {
    company: "Company",
    initials: "SC",
    jobTitle: "Social Media Creator",
    jobType: "Part-time",
    location: "Remote",
    status: "Under Review",
  },
  {
    company: "Company",
    initials: "SC",
    jobTitle: "Social Media Creator",
    jobType: "Part-time",
    location: "Remote",
    status: "Under Review",
  },
];
