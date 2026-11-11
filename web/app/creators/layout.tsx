import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata({
  title: "Hire Content Creators | Influencer Marketplace — Pacten",
  description:
    "Browse the Pacten creator marketplace to hire content creators for influencer marketing, brand collaborations and creator campaigns.",
  path: "/creators",
  keywords: [
    "influencer marketplace",
    "hire content creators",
    "influencer marketing",
    "brand collaborations",
    "creator campaigns",
    "influencer partnerships",
  ],
});

export default function CreatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
