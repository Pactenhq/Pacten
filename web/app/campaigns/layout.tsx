import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata({
  title: "Creator Campaigns & Business Collaborations | Pacten",
  description:
    "Discover creator campaigns, business collaborations and influencer partnerships on the Pacten influencer marketplace.",
  path: "/campaigns",
  keywords: [
    "creator campaigns",
    "business collaborations",
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
