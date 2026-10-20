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

export const howItWorksSteps: Step[] = [
  {
    index: "01",
    title: "Post Your Brief",
    description:
      "Describe your campaign goals, budget, and the type of creator you're looking for.",
  },
  {
    index: "02",
    title: "Match with Creators",
    description:
      "Browse verified creator profiles or let our smart matching surface the best fits.",
  },
  {
    index: "03",
    title: "Launch & Measure",
    description:
      "Collaborate, approve content, and track real-time campaign performance.",
  },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "Pacten helped us find the perfect UGC creators in under 24 hours. ROI was incredible.",
    name: "Sarah K.",
    role: "Head of Marketing at Flink",
    avatar: "/assets/home/avatar-sarah.jpg",
  },
  {
    quote:
      "The matching algorithm is scary good. We doubled our engagement within the first campaign.",
    name: "Tom R.",
    role: "Growth Lead at Kota",
    avatar: "/assets/home/avatar-tom.jpg",
  },
  {
    quote:
      "Pacten made it incredibly easy to find creators who were the right fit for our brand.",
    name: "Emily R.",
    role: "Brand Partnerships Manager at Nova",
    avatar: "/assets/home/avatar-emily.jpg",
  },
];

export const platformStats = [
  { value: "50K+", label: "Verified Creators" },
  { value: "10K+", label: "Campaigns Launched" },
  { value: "98%", label: "Satisfaction Rate" },
];

export interface Professional {
  id: string;
  name: string;
  handle: string;
  specialty: string;
  badge?: string;
}

export const featuredProfessionals: Professional[] = [
  {
    id: "p1",
    name: "Alex Morgan",
    handle: "@alexmorgan",
    specialty: "Content Creator specializing in lifestyle, travel & wellness.",
    badge: "TOP CREATOR",
  },
  {
    id: "p2",
    name: "Sophie Bennett",
    handle: "@sophie.creates",
    specialty: "UGC Content Creator",
  },
  {
    id: "p3",
    name: "Jordan Lee",
    handle: "@jordanlee",
    specialty: "Video Editor",
  },
  {
    id: "p4",
    name: "Ava Morgan",
    handle: "@ava.morgan",
    specialty: "Graphic Designer",
  },
];

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
export const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0/mo",
    commission: "15% commission",
    badge: "Free Forever",
    icon: "gift",
    features: ["Browse creators", "Browse professionals", "Brand profile"],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$19/mo",
    commission: "10% commission",
    icon: "gift",
    features: [
      "Priority search access",
      "More active campaigns",
      "Campaign analytics",
      "AI Campaign Assistant",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Elite",
    price: "$79/mo",
    badge: "Best Value",
    icon: "diamond",
    featurePrefix: "Everything in Pro, plus:",
    features: [
      "Team workspaces",
      "Multiple user accounts",
      "Premium search placement",
      "Advanced reporting",
      "Advanced analytics",
    ],
    cta: "Go Elite",
    highlighted: true,
  },
  {
    name: "Plus",
    price: "$39/mo",
    commission: "5% commission",
    badge: "Most Popular",
    icon: "briefcase",
    featurePrefix: "Everything in Pro, plus:",
    features: [
      "Unlimited campaigns",
      "AI Brand Matching",
      "AI Pricing Advisor",
      "AI Outreach Writer",
      "Advanced analytics",
    ],
    cta: "Go Plus",
  },
];

export const trustedBrands = ["Flink", "Kota", "Nova", "Sephora", "Glossier"];

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

export const marketplaceCreators: CreatorCardData[] = [
  { id: "c1", name: "Theresa Webb", followers: "12.4K followers", rating: "4.9★", niches: ["Fashion", "Beauty"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-theresa-webb.jpg" },
  { id: "c2", name: "Maya Chen", followers: "89.2K followers", rating: "4.9★", niches: ["Fashion", "Beauty"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-maya-chen.jpg" },
  { id: "c3", name: "Kristin Watson", followers: "34.7K followers", rating: "4.8★", niches: ["Fashion"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-kristin-watson.jpg" },
  { id: "c4", name: "Alex Rivera", followers: "62.8K followers", rating: "4.9★", niches: ["Fitness"], platforms: ["Instagram", "YouTube", "TikTok"], photo: "/assets/marketplace/creator-alex-rivera.jpg" },
  { id: "c5", name: "Ralph Edwards", followers: "229.3K followers", rating: "4.9★", niches: ["Fitness"], platforms: ["Instagram", "YouTube", "TikTok"], photo: "/assets/marketplace/creator-ralph-edwards.jpg" },
  { id: "c6", name: "Emily Carter", followers: "28.9K followers", rating: "4.9★", niches: ["Fitness"], platforms: ["Instagram", "YouTube", "TikTok"], photo: "/assets/marketplace/creator-emily-carter.jpg" },
  { id: "c7", name: "Ava Morgan", followers: "15.6K followers", rating: "4.9★", niches: ["Business"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-ava-morgan.jpg" },
  { id: "c8", name: "Noah Bennett", followers: "35.2K followers", rating: "4.9★", niches: ["Business"], platforms: ["Instagram", "YouTube", "TikTok"], photo: "/assets/marketplace/creator-noah-bennett.jpg" },
  { id: "c9", name: "Mason Brooks", followers: "121.1K followers", rating: "4.9★", niches: ["Business"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-mason-brooks.jpg" },
  { id: "c10", name: "Chloe Davis", followers: "75.6K followers", rating: "4.9★", niches: ["Lifestyle"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-chloe-davis.jpg" },
  { id: "c11", name: "Mia Anderson", followers: "325.8K followers", rating: "4.9★", niches: ["Lifestyle"], platforms: ["Instagram", "YouTube", "TikTok"], photo: "/assets/marketplace/creator-mia-anderson.jpg" },
  { id: "c12", name: "Grace Bennett", followers: "234.9K followers", rating: "4.9★", niches: ["Lifestyle"], platforms: ["Instagram", "TikTok"], photo: "/assets/marketplace/creator-grace-bennett.jpg" },
];

export interface ProfessionalCardData {
  id: string;
  name: string;
  role: string;
  experience: string;
  rating: string;
  category: string;
  photo: string;
}

export const marketplaceProfessionals: ProfessionalCardData[] = [
  { id: "pf1", name: "Sarah Collins", role: "Video Editor", experience: "5+ years", rating: "4.9★", category: "Editors", photo: "/assets/home/pro-1.jpg" },
  { id: "pf2", name: "Jenny Wilson", role: "Video Editor", experience: "7+ years", rating: "4.9★", category: "Editors", photo: "/assets/home/pro-2.jpg" },
  { id: "pf3", name: "Avery Reed", role: "Video Editor", experience: "2+ years", rating: "4.8★", category: "Editors", photo: "/assets/home/pro-3.jpg" },
  { id: "pf4", name: "Dylan Foster", role: "Copywriter", experience: "15+ years", rating: "4.9★", category: "Copywriters", photo: "/assets/marketplace/pro-dylan-foster.jpg" },
  { id: "pf5", name: "Ella Richardson", role: "Copywriter", experience: "5+ years", rating: "4.9★", category: "Copywriters", photo: "/assets/marketplace/pro-ella-richardson.jpg" },
  { id: "pf6", name: "Carter Sullivan", role: "Copywriter", experience: "7+ years", rating: "4.8★", category: "Copywriters", photo: "/assets/marketplace/pro-carter-sullivan.jpg" },
  { id: "pf7", name: "Scarlett Evans", role: "Designer", experience: "10+ years", rating: "4.9★", category: "Designers", photo: "/assets/marketplace/pro-scarlett-evans.jpg" },
  { id: "pf8", name: "Natalie Brooks", role: "Designer", experience: "5+ years", rating: "4.8★", category: "Designers", photo: "/assets/marketplace/pro-natalie-brooks.jpg" },
  { id: "pf9", name: "Nathan Collins", role: "Designer", experience: "13+ years", rating: "4.9★", category: "Designers", photo: "/assets/marketplace/pro-nathan-collins.jpg" },
];

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

export const campaignListings: CampaignListing[] = [
  {
    id: "j1",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "j2",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "j3",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "j4",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "j5",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
  {
    id: "j6",
    title: "Social Media Creator",
    brand: "Glow & Co.",
    description:
      "We're looking for 5 UGC creators to produce authentic short-form videos for our upcoming skincare launch.",
    budget: "$500–$1,000",
    timeline: "2–4 weeks",
    type: "UGC Content",
    location: "Remote",
    postedAt: "2 days ago",
    platforms: ["Instagram", "TikTok"],
  },
];

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

export const profileReviews: Review[] = [
  {
    quote:
      "Amazing to work with! Beautiful content, professional and super responsive.",
    name: "Emma R.",
    time: "2 weeks ago",
  },
  {
    quote:
      "Amazing to work with! Beautiful content, professional and super responsive.",
    name: "Emma R.",
    time: "2 weeks ago",
  },
  {
    quote:
      "Amazing to work with! Beautiful content, professional and super responsive.",
    name: "Emma R.",
    time: "2 weeks ago",
  },
];

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

export const creatorProfile = {
  name: "Jenny Wilson",
  handle: "@sophie.creates",
  headline: "Content Creator specializing in lifestyle, travel & wellness.",
  tags: ["Lifestyle", "Travel & Wellness"],
  priceLabel: "Starting from £0",
  photo: "/assets/marketplace/avatar-jenny-wilson.jpg",
  stats: [
    { value: "248K", label: "Total Followers", icon: "users" },
    { value: "0.00%", label: "Avg Engagement", icon: "heart" },
    { value: "1.2M", label: "Avg Views", icon: "eye" },
    { value: "86", label: "Completed Campaigns", icon: "check" },
  ] as ProfileStat[],
  about:
    "Hi! I’m Sophie — a passionate content creator focused on lifestyle, travel and wellness. I love creating authentic stories that inspire people, share meaningful experiences and bring brands to life.",
  location: "London, UK",
  website: "sophieadams.com",
  platforms: [
    {
      platform: "TikTok",
      handle: "@sophie.creates",
      stats: [
        { value: "85K", label: "Followers" },
        { value: "1.4M", label: "Avg Views" },
        { value: "7.8%", label: "Engagement" },
      ],
    },
    {
      platform: "Instagram",
      handle: "@sophie.creates",
      stats: [
        { value: "120K", label: "Followers" },
        { value: "320K", label: "Avg Views" },
        { value: "6.2%", label: "Engagement" },
      ],
    },
  ] as PlatformStat[],
  services: [
    {
      title: "Sponsored Post",
      description: "Instagram feed post with authentic product showcase",
      price: "£0",
    },
    {
      title: "Instagram Reels",
      description: "High-quality, engaging short-form video",
      price: "£0",
    },
    {
      title: "TikTok Video",
      description: "Creative 15–60s video with trend integration",
      price: "£0",
    },
    {
      title: "UGC Content Package",
      description: "Set of 5–10 professionally edited photos/videos",
      price: "£0",
    },
  ] as Service[],
};

export const professionalProfile = {
  name: "Alex Morgan",
  handle: "@alexmorgan",
  headline:
    "Experienced digital designer helping businesses turn ideas into clear, engaging, and high-converting digital experiences.",
  tags: ["UI/UX Designer", "Web Designer"],
  priceLabel: "Starting from £75/hour",
  photo: "/assets/marketplace/avatar-alex-morgan.jpg",
  stats: [
    { value: "42", label: "Completed Projects", icon: "check" },
    { value: "4.9/5", label: "Average Rating", icon: "heart" },
    { value: "<24 hrs", label: "Response Time", icon: "eye" },
    { value: "8+", label: "Years Experience", icon: "users" },
  ] as ProfileStat[],
  about:
    "I’m a multidisciplinary digital designer specializing in UI/UX, websites, and digital products. I help businesses create modern, user-friendly experiences that look great and deliver real results.",
  location: "London, UK",
  website: "alexmorgan.design",
  availability: [
    { label: "Status:", value: "Available" },
    { label: "Hourly Rate:", value: "£75/hour" },
    { label: "Project Rate From:", value: "£500" },
    { label: "Response Time:", value: "Within 24 hours" },
  ],
  services: [
    {
      title: "UI/UX Design",
      description: "User-focused interfaces and digital experiences",
      price: "From £500",
    },
    {
      title: "Website Design",
      description: "Modern, responsive websites designed around your business goals",
      price: "From £750",
    },
    {
      title: "Landing Page Design",
      description:
        "High-converting landing pages for products, services, and campaigns",
      price: "From £500",
    },
    {
      title: "Digital Product Design",
      description: "Web apps and product experiences from concept to final UI",
      price: "From £1,000",
    },
  ] as Service[],
};

export const brandProfile = {
  name: "Glow & Co.",
  handle: "@glowandco",
  headline:
    "Glow & Co. is a modern skincare brand creating simple",
  tags: ["Beauty", "Skincare", "Wellness"],
  stats: [
    { value: "42", label: "Completed Campaigns", icon: "check" },
    { value: "£0,000+", label: "Monthly Budget", icon: "users" },
    { value: "23", label: "Active Campaigns", icon: "eye" },
    { value: "4.9/5", label: "Average Rating", icon: "heart" },
  ] as ProfileStat[],
  about:
    "Glow & Co. is a modern skincare brand creating simple, effective products designed to make everyday skincare feel effortless. We collaborate with talented creators and professionals to bring our products to new audiences.",
  location: "London, UK",
  website: "glowandco.com",
  recentCampaigns: [
    { title: "New Product Launch", status: "Active", deadline: "Nov 2026" },
    { title: "Summer Glow Campaign", status: "Completed", deadline: "Jun 2026" },
    { title: "UGC Skincare Campaign", status: "Completed", deadline: "Apr 2026" },
  ],
  openJobs: [
    {
      title: "Skincare Creator Campaign",
      description:
        "Looking for beauty & lifestyle creators to showcase our new skincare collection.",
      budget: "£500–£2,000",
    },
    {
      title: "UGC Content Creator",
      description:
        "Looking for creators to produce authentic short-form video content for paid social.",
      budget: "£500–£2,000",
    },
    {
      title: "Beauty Photographer",
      description:
        "Professional product and lifestyle photography for our upcoming campaign.",
      budget: "£500–£2,000",
    },
  ],
  hiringActivity: [
    { value: "3", label: "Open Positions" },
    { value: "2", label: "Successful Campaigns" },
    { value: "Coming soon", label: "Repeat Hire Rate" },
    { value: "3", label: "Avg Response Time" },
    { value: "2", label: "Creator Reviews" },
    { value: "5★", label: "Avg Rating" },
  ] as ProfileStat[],
};

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
  { label: "My Campaigns", href: "/campaigns", icon: "megaphone" },
  { label: "Applications", href: "/dashboard/applications", icon: "file" },
  { label: "Messages", href: "/dashboard/messages", icon: "chat" },
  { label: "Analytics", href: "#", icon: "chart" },
  { label: "Referral", href: "/dashboard/referrals", icon: "gift" },
  { label: "Contract", href: "/dashboard/contracts", icon: "doc" },
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

/** Brand sidebar: base items plus the brand-only "Employer" entry. */
export const brandNav: DashboardNavItem[] = withDashboardHome("/dashboard/brand", [
  dashboardNavBase[0],
  { label: "Applications", href: "/dashboard/applications/received", icon: "file" },
  { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
  dashboardNavBase[2],
  dashboardNavBase[3],
  dashboardNavBase[4],
  { label: "Employer", href: "#", icon: "briefcase" },
  dashboardNavBase[5],
  dashboardNavBase[6],
  dashboardNavBase[7],
]);

/** Creator / Professional sidebar (no "Employer" entry in the design). */
export const creatorNav: DashboardNavItem[] = withDashboardHome(
  "/dashboard/creator",
  [
    ...dashboardNavBase.slice(0, 2),
    { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
    ...dashboardNavBase.slice(2),
  ],
);
export const professionalNav: DashboardNavItem[] = withDashboardHome(
  "/dashboard/professional",
  [
    ...dashboardNavBase.slice(0, 2),
    { label: "Opportunities", href: "/dashboard/opportunities", icon: "briefcase" },
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

export const brandStats: StatCardData[] = [
  { value: "12", label: "Active Campaigns", delta: "+20% ↗", icon: "gift" },
  { value: "8", label: "Profile Views", delta: "+12% ↗", icon: "eye" },
  { value: "24", label: "Completed Campaigns", delta: "+40% ↗", icon: "check" },
];

/** Mobile variant of the second brand stat card . */
export const brandStatsMobile: StatCardData[] = [
  { value: "12", label: "Active Campaigns", delta: "+20% ↗" },
  { value: "8", label: "Pending Requests", delta: "+12% ↗" },
  { value: "24", label: "Completed Campaigns", delta: "+40% ↗" },
];

export interface RequestRow {
  name: string;
  handle: string;
  campaign: string;
  status: "Active" | "Submitted" | "Completed";
  date: string;
}

export const brandRecentRequests: RequestRow[] = [
  {
    name: "Jane Smith",
    handle: "@janesmith",
    campaign: "Summer Collection",
    status: "Active",
    date: "Nov 2, 2026",
  },
  {
    name: "Jane Smith",
    handle: "@janesmith",
    campaign: "Summer Collection",
    status: "Active",
    date: "Nov 2, 2026",
  },
];

export interface DashboardCampaign {
  title: string;
  handle: string;
  budget: string;
  status: "Active" | "Completed";
  deadline: string;
  submitted: string;
}

export const brandActiveCampaigns: DashboardCampaign[] = [
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Active",
    deadline: "Nov 2, 2026",
    submitted: "Sep 2, 2026",
  },
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Active",
    deadline: "Nov 2, 2026",
    submitted: "Sep 2, 2026",
  },
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Active",
    deadline: "Nov 2, 2026",
    submitted: "Sep 2, 2026",
  },
];

export const brandCompletedCampaigns: DashboardCampaign[] = [
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Completed",
    deadline: "Nov 2, 2025",
    submitted: "Sep 2, 2025",
  },
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Completed",
    deadline: "Nov 2, 2025",
    submitted: "Sep 2, 2025",
  },
  {
    title: "New Product Launch",
    handle: "@sophie.c",
    budget: "0£",
    status: "Completed",
    deadline: "Nov 2, 2025",
    submitted: "Sep 2, 2025",
  },
];

export const aiAssistantQuestions: string[] = [
  "How should I price this?",
  "Which creators should I hire?",
  "How do I improve my profile?",
  "How much should I charge?",
  "What should my campaign include?",
];

export const aiRecommendations: { title: string; detail: string; date: string }[] = [
  {
    title: "Partner with micro-influencers",
    detail: "Higher engagement in your niche",
    date: "Jan 1",
  },
  {
    title: "Partner with micro-influencers",
    detail: "Higher engagement in your niche",
    date: "Jan 1",
  },
  {
    title: "Partner with micro-influencers",
    detail: "Higher engagement in your niche",
    date: "Jan 1",
  },
];

export interface CreatorStats {
  completeness: number;
  earnings: string;
  earningsDelta: string;
}

export const creatorStats: CreatorStats = {
  completeness: 65,
  earnings: "0",
  earningsDelta: "+0% ↗",
};

export const creatorStatCards: StatCardData[] = [
  { value: "0", label: "Total Earnings", delta: "+0% ↗", icon: "moneybag" },
  { value: "0", label: "Active Campaigns", delta: "+0% ↗", icon: "megaphone" },
  { value: "0", label: "Profile Views", delta: "+0% ↗", icon: "eye" },
  { value: "0", label: "Campaign Requests", delta: "+0% ↗", icon: "chat" },
];

export const professionalStatCards: StatCardData[] = [
  { value: "0", label: "Total Earnings", delta: "+0% ↗", icon: "moneybag" },
  { value: "0", label: "Active Services", delta: "+0% ↗", icon: "check" },
  { value: "0", label: "Profile Views", delta: "+0% ↗", icon: "eye" },
  { value: "0", label: "Hiring Requests", delta: "+0% ↗", icon: "clipboard" },
];

export interface TrustScoreBreakdown {
  label: string;
  value: string;
}

export const trustScoreBreakdown: TrustScoreBreakdown[] = [
  { label: "Profile Completion", value: "20/20" },
  { label: "Verification", value: "15/15" },
  { label: "Average Review", value: "14/20" },
  { label: "Response Rate", value: "11/15" },
  { label: "Campaign Completion", value: "11/15" },
  { label: "Repeat Brands", value: "7/10" },
  { label: "Account Age", value: "3/5" },
];

export const trustScoreEmptyBreakdown: TrustScoreBreakdown[] = [
  { label: "Profile Completion", value: "0/20" },
  { label: "Verification", value: "0/15" },
  { label: "Average Review", value: "0/20" },
  { label: "Response Rate", value: "0/15" },
  { label: "Campaign Completion", value: "0/15" },
  { label: "Repeat Brands", value: "0/10" },
  { label: "Account Age", value: "0/5" },
];

/* ------------------------- Referral dashboard ------------------------- */

export const referralInfo = {
  title: "Invite friends and earn rewards",
  subtitle:
    "Share CreatorHub with your network and get rewarded when they join.",
  linkLabel: "Your Referral Link",
  link: "https://creatorhub.io/ref/YOURCODE",
  linkHint: "Share this link to earn rewards when friends sign up.",
  codeLabel: "Your Referral Code",
  code: "YOURCODE",
  codeStatus: "Active",
  codeHint: "Friends can also use your code during signup.",
};

export const referralStats: StatCardData[] = [
  { value: "0", label: "Total Referrals", delta: "+0% ↗", icon: "people" },
  { value: "0", label: "Successful Referrals", delta: "+0% ↗", icon: "check" },
  { value: "0", label: "Lifetime Earnings", delta: "+0% ↗", icon: "moneybag" },
  { value: "0", label: "Commission Discount", delta: "+0% ↗", icon: "percent" },
  { value: "0", label: "Referral Progress", delta: "+0% ↗", icon: "target" },
];

export interface ReferralRow {
  name: string;
  joined: string;
  earnings: string;
  status: "Successful" | "Pending";
}

export const recentReferrals: ReferralRow[] = [
  { name: "Jane Smith", joined: "Jan 15, 2026", earnings: "£0", status: "Successful" },
  { name: "Jane Smith", joined: "Jan 15, 2026", earnings: "£0", status: "Pending" },
  { name: "Jane Smith", joined: "Jan 15, 2026", earnings: "£0", status: "Successful" },
];

export const referralAnalytics: { value: string; label: string; hint: string; icon: string }[] = [
  { value: "0", label: "Clicks", hint: "Total link clicks", icon: "cursor" },
  { value: "0", label: "Signups", hint: "Friends who signed up", icon: "people" },
  { value: "0", label: "Conversions", hint: "Signup-to-paid rate", icon: "chart" },
  { value: "0", label: "Revenue", hint: "Revenue from referrals", icon: "moneybag" },
];

export const rewardMilestones: { count: string; reward: string }[] = [
  { count: "1 Referral", reward: "$10 Bonus" },
  { count: "5 Referrals", reward: "$50 Bonus" },
  { count: "10 Referrals", reward: "$100 Bonus" },
  { count: "25 Referrals", reward: "VIP Status" },
];

export const leaderboard: { rank: number; name: string; referrals: number; earnings: string }[] = [
  { rank: 1, name: "Jane Smith", referrals: 42, earnings: "£0" },
  { rank: 2, name: "Jane Smith", referrals: 40, earnings: "£0" },
  { rank: 3, name: "Jane Smith", referrals: 37, earnings: "£0" },
  { rank: 4, name: "Jane Smith", referrals: 22, earnings: "£0" },
];

export const commissionHistory: { campaign: string; date: string; amount: string }[] = [
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
];

export const discountHistory: { campaign: string; date: string; amount: string }[] = [
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
  { campaign: "Creator Campaign A", date: "Jan 2025", amount: "£0" },
];

/* ------------------------------------------------------------------ */
/* Home page —  data from "destop home" (90:2).          */
/* Home-specific: do NOT reuse `pricingTiers` (that feeds /pricing).    */
/* ------------------------------------------------------------------ */

export interface HomeCreator {
  id: string;
  name: string;
  followers: string;
  rating: string;
  tags: string[];
  photo: string;
}

export const homeCreators: HomeCreator[] = [
  {
    id: "theresa-webb",
    name: "Theresa Webb",
    followers: "12.4K followers",
    rating: "4.9",
    tags: ["Fashion", "Beauty"],
    photo: "/assets/home/creator-1.jpg",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    followers: "89.2K followers",
    rating: "4.9",
    tags: ["Fashion", "Beauty"],
    photo: "/assets/home/creator-2.jpg",
  },
  {
    id: "kristin-watson",
    name: "Kristin Watson",
    followers: "34.7K followers",
    rating: "4.8",
    tags: ["Fashion"],
    photo: "/assets/home/creator-3.jpg",
  },
  {
    id: "dianne-russell",
    name: "Dianne Russell",
    followers: "21.1K followers",
    rating: "4.9",
    tags: ["Fashion", "Beauty"],
    photo: "/assets/home/creator-4.jpg",
  },
];

export interface HomeProfessional {
  id: string;
  name: string;
  experience: string;
  rating: string;
  photo: string;
}

export const homeProfessionals: HomeProfessional[] = [
  {
    id: "sarah-collins",
    name: "Sarah Collins",
    experience: "5+ years of experience",
    rating: "4.9",
    photo: "/assets/home/pro-1.jpg",
  },
  {
    id: "jenny-wilson",
    name: "Jenny Wilson",
    experience: "7+ years of experience",
    rating: "4.9",
    photo: "/assets/home/pro-2.jpg",
  },
  {
    id: "avery-reed",
    name: "Avery Reed",
    experience: "2+ years of experience",
    rating: "4.8",
    photo: "/assets/home/pro-3.jpg",
  },
  {
    id: "owen-reynolds",
    name: "Owen Reynolds",
    experience: "10+ years of experience",
    rating: "4.9",
    photo: "/assets/home/pro-4.jpg",
  },
];

export const homeTrustedLogos = [
  "HubSpot",
  "Notion",
  "Spotify",
  "Nike",
  "Shopify",
];

export interface HomePlan {
  name: string;
  price: string;
  features: string[];
  cta: string;
  filled: boolean;
  icon: "gift" | "star" | "briefcase";
  tag?: string;
}

export const homePricingPlans: HomePlan[] = [
  {
    name: "Free",
    price: "$0/mo",
    features: ["Browse creators", "Browse professionals", "Brand profile"],
    cta: "Start Free",
    filled: false,
    icon: "gift",
  },
  {
    name: "Elite",
    price: "$79/mo",
    features: [
      "Team workspaces",
      "Premium search placement",
      "Priority support",
    ],
    cta: "Go Elite",
    filled: true,
    icon: "star",
    tag: "Best Value",
  },
  {
    name: "Pro",
    price: "$19/mo",
    features: [
      "Priority search access",
      "More active campaigns",
      "AI Campaign Assistant",
    ],
    cta: "Upgrade to Pro",
    filled: false,
    icon: "briefcase",
  },
];

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

export const homeProChips = ["Editors", "Copywriters", "Designers"];
