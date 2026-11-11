import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";

export const metadata: Metadata = routeMetadata({
  title: "Hire Social Media Professionals | Influencer Marketplace — Pacten",
  description:
    "Find social media professionals — editors, designers, strategists and copywriters — for brand collaborations and influencer marketing campaigns.",
  path: "/professionals",
  keywords: [
    "social media professionals",
    "influencer marketplace",
    "influencer marketing",
    "brand collaborations",
    "creator campaigns",
    "influencer partnerships",
  ],
});

export default function ProfessionalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
