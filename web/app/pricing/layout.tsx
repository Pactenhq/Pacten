import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata({
  title: "Pricing for Businesses, Creators & Professionals | Pacten",
  description:
    "Pacten pricing plans for businesses, content creators and social media professionals. Start free and scale with creator campaigns and business collaborations.",
  path: "/pricing",
  keywords: [
    "influencer marketplace",
    "influencer marketing",
    "business collaborations",
    "creator campaigns",
    "hire content creators",
    "social media professionals",
  ],
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
