import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { CampaignTabs } from "@/components/campaigns/CampaignTabs";
import { Button } from "@/components/ui/Button";
import { campaignNav } from "@/lib/mock-campaigns";
import { dashboardUser } from "@/lib/mock";

// desktop + "mob My Campaigns"
// (319:12357) mobile. Title + subtitle, a "New Campaign" CTA, and the
// "Campaigns tab status" tab switcher (Requests / Active / Completed).
export default function MyCampaignsPage() {
  return (
    <DashboardShell
      nav={campaignNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeHeader
            title="My Campaigns"
            subtitle="Track requests, active campaigns and completed collaborations."
          />
          <Link href="/dashboard/campaigns/new">
            <Button size="lg">+ Create Campaign</Button>
          </Link>
        </div>

        <CampaignTabs />
      </div>
    </DashboardShell>
  );
}
