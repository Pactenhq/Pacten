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
}

// "Why Pacten?" table. Every row is a real MVP feature. The competitor
// column is gone: the old Collabstr values were never verified against
// any source, so the table no longer claims anything about Collabstr.
// Messaging is not unlimited on Free — free users get 5 new
// conversations a month, replies unlimited; paid plans are unlimited.
export const pricingComparison: ComparisonRow[] = [
  { feature: "Free Plan", pacten: true },
  { feature: "Lowest Creator Commission", pacten: "5% (Elite plan)" },
  { feature: "Hire Creative Professionals", pacten: true },
  {
    feature: "Messaging",
    pacten: "5 new conversations a month on Free, unlimited on paid plans",
  },
  { feature: "Referral Rewards", pacten: true },
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
    a: "Creators and professionals join free. Businesses can start free and upgrade as they grow.",
  },
  {
    q: "What is the free plan and how do paid plans apply?",
    a: "Creators and professionals join free. Businesses can start free and upgrade as they grow. Pacten only succeeds when our community succeeds.",
  },
  {
    q: "Are there hidden fees?",
    a: "No hidden fees. Pacten only succeeds when our community succeeds.",
  },
];

export interface BillingRow {
  plan: string;
  date: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

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

