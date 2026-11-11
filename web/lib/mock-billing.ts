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
  { feature: "Lowest Creator Commission", pacten: "5%", collabstr: "15%" },
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

