import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata({
  title: "Creator Campaigns & Brand Collaborations | Pacten",
  description:
    "Discover creator campaigns, brand collaborations and influencer partnerships on the Pacten influencer marketplace.",
  path: "/campaigns",
  keywords: [
    "creator campaigns",
    "brand collaborations",
    "influencer partnerships",
    "influencer marketplace",
    "hire content creators",
    "influencer marketing",
  ],
});

export default function CampaignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
