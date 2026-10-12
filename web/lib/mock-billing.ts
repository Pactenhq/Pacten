/**
 * Mock billing / subscription / notification data for the Pacten MVP static
 * frontend. All copy below is taken verbatim from the design
 * ("Untitled--Copy-", fileKey eHdTsQ2PCrvYzuG9qhvyXr) unless marked APPROX.
 * No backend yet: pages use these shapes with local mock data only.
 */

export interface ComparisonRow {
  feature: string;
  /** true renders a checkmark; otherwise the literal cell value */
  pacten: string | true;
  /** true/"check" renders a checkmark, "x" a red cross, else literal text */
  collabstr: string | true;
}

/**
 * // "Why Pacten?" comparison table.
 * Feature names verbatim. Pacten column: check or literal value.
 * Collabstr column: check, "Limited", or "x" (renders a red cross).
 */
export const pricingComparison: ComparisonRow[] = [
  { feature: "Free Plan", pacten: true, collabstr: "check" },
  { feature: "Lowest Creator Commission", pacten: "2.5%", collabstr: "15%" },
  { feature: "AI Campaign Briefs", pacten: true, collabstr: "x" },
  { feature: "AI Creator Matching", pacten: true, collabstr: "x" },
  { feature: "AI Pricing Suggestions", pacten: true, collabstr: "x" },
  { feature: "AI Profile Optimisation", pacten: true, collabstr: "x" },
  { feature: "Creator Teams", pacten: true, collabstr: "x" },
  { feature: "Hire Creative Professionals", pacten: true, collabstr: "x" },
  { feature: "Unlimited Messaging", pacten: true, collabstr: "check" },
  { feature: "Portfolio Hosting", pacten: true, collabstr: "check" },
  { feature: "Advanced Analytics", pacten: true, collabstr: "Limited" },
  { feature: "Referral Rewards", pacten: true, collabstr: "x" },
];

export interface RateTier {
  label: string;
  price: string;
  blurb: string;
}

/**
 * Creator Rate Calculator result cards.
 * "Recommended Price" blurb is partially obscured in the design; the visible
 * text is "Market rate for your..." — completed conservatively.
 */
export const rateCalculatorTiers: RateTier[] = [
  {
    label: "Minimum Price",
    price: "$0",
    blurb: "Floor rate \u2014 suitable for micro-creators or bundled deals",
  },
  {
    label: "Recommended Price",
    price: "$0",
    blurb: "Market rate for your audience and content type",
  },
  {
    label: "Premium Price",
    price: "$0",
    blurb: "For high-demand niches",
  },
];

export interface Faq {
  q: string;
  a: string;
}

/**
 * Pricing FAQ.
 * the frame. Answers are grounded in  pricing copy.
 */
export const pricingFaqs: Faq[] = [
  {
    q: "Can I cancel anytime?",
    a: "Start for free and scale as you grow. No hidden fees. Cancel anytime.",
  },
  {
    q: "Is there a free trial?",
    a: "Creators and professionals join free. Brands can start free and upgrade as they grow.",
  },
  {
    q: "What is the free plan and how do paid plans apply?",
    a: "Creators and professionals join free. Brands can start free and upgrade as they grow. Pacten only succeeds when our community succeeds.",
  },
  {
    q: "Are there hidden fees?",
    a: "No hidden fees. Pacten only succeeds when our community succeeds.",
  },
];

/** Subscription plan details */
export const subscriptionPlan = {
  tag: "10% commission",
  name: "Pro",
  price: "$19/mo",
  blurb:
    "For businesses and agencies looking to find top talent and run multiple campaigns.",
  features: [
    "Priority search access",
    "More active campaigns",
    "Campaign analytics",
    "AI Campaign Assistant",
  ],
  billingCycle: "Monthly",
  nextBillingDate: "Oct 24, 2026",
  amount: "$19",
  card: {
    brand: "Mastercard",
    last4: "4242",
    expiry: "04/2028",
    isDefault: true,
  },
};

export interface BillingRow {
  plan: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

/** Billing history */
export const billingHistory: BillingRow[] = [
  { plan: "Pro", date: "Apr 12, 2026", amount: "$19", status: "Paid" },
];

export type NotificationIcon = "check" | "chat" | "user" | "star" | "wrench";

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: NotificationIcon;
}

export interface NotificationGroup {
  label: string;
  items: NotificationItem[];
}

/**
 * Notification items. Rows whose copy was not
 * recoverable from cache are omitted rather than invented.
 */
export const notificationGroups: NotificationGroup[] = [
  {
    label: "Today",
    items: [
      {
        id: "n1",
        title: "Campaign accepted",
        body: "Status updated to Accepted",
        time: "2 hours ago",
        icon: "check",
      },
      {
        id: "n2",
        title: "Message received",
        body: "New message from Sophie Carter",
        time: "2 hours ago",
        icon: "chat",
      },
      {
        id: "n3",
        title: "Creator assigned",
        body: "Sophie Carter was added to this campaign",
        time: "2 hours ago",
        icon: "user",
      },
      {
        id: "n4",
        title: "Job application shortlisted",
        body: "You've been shortlisted for a product review role.",
        time: "2 hours ago",
        icon: "star",
      },
    ],
  },
  {
    label: "Yesterday",
    items: [
      {
        id: "n5",
        title: "Campaign accepted",
        body: "Status updated to Accepted",
        time: "Yesterday",
        icon: "check",
      },
      {
        id: "n6",
        title: "Application status update",
        body: "Your application to the Travel Creator Program moved to review.",
        time: "Yesterday",
        icon: "check",
      },
      {
        id: "n7",
        title: "Message received",
        body: "New message from Sophie Carter",
        time: "Yesterday",
        icon: "chat",
      },
      {
        id: "n8",
        title: "Creator assigned",
        body: "Sophie Carter was added to this campaign",
        time: "Yesterday",
        icon: "user",
      },
    ],
  },
  {
    label: "Last Week",
    items: [
      {
        id: "n9",
        title: "Campaign accepted",
        body: "Status updated to Accepted",
        time: "Mon",
        icon: "check",
      },
      {
        id: "n10",
        title: "Campaign accepted",
        body: "Status updated to Accepted",
        time: "Mon",
        icon: "check",
      },
      {
        id: "n11",
        title: "Platform maintenance scheduled",
        body: "CreatorHub will undergo brief maintenance on Sunday 2\u20134 AM.",
        time: "Mon",
        icon: "wrench",
      },
    ],
  },
];

/** Notification preview items */
export const notificationPreview: NotificationItem[] = [
  {
    id: "n1",
    title: "Campaign accepted",
    body: "Status updated to Accepted",
    time: "2 h ago",
    icon: "check",
  },
  {
    id: "n2",
    title: "Message received",
    body: "New message from Sophie Carter",
    time: "2 h ago",
    icon: "chat",
  },
  {
    id: "n3",
    title: "Creator assigned",
    body: "Sophie Carter was added to this campaign",
    time: "2 h ago",
    icon: "user",
  },
];
