import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AIAssistant,
  CampaignCard,
  PerformanceInsights,
  RequestsTable,
  SectionCard,
  StatCard,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import {
  aiAssistantQuestions,
  aiRecommendations,
  brandActiveCampaigns,
  brandCompletedCampaigns,
  brandNav,
  brandRecentRequests,
  brandStats,
  dashboardUser,
} from "@/lib/mock";

// desktop + "mob Brand dashboard"
// (344:11945) mobile. Welcome header with "+ Create Campaign", three stat
// cards, Recent Requests table, Active/Completed campaign rows, AI Business
// Assistant and AI Performance Insights. All copy is ,
// Corrected typo: "Campaign".

export default function BrandDashboardPage() {
  return (
    <DashboardShell
      nav={brandNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <WelcomeHeader
          title="Welcome back"
          subtitle="Manage your campaigns and creator relationships."
          action={
            <Link href="/dashboard/campaigns/new">
              <Button size="lg">+ Create Campaign</Button>
            </Link>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {brandStats.map((s, i) => (
            <StatCard
              key={s.label}
              {...s}
              mobileLabel={i === 1 ? "Pending Requests" : undefined}
            />
          ))}
        </div>

        <SectionCard title="Recent Requests">
          <RequestsTable rows={brandRecentRequests} />
        </SectionCard>

        <SectionCard title="Active Campaigns" className="border-0 bg-transparent p-0 shadow-none">
          <div className="flex flex-col gap-4">
            {brandActiveCampaigns.map((c, i) => (
              <CampaignCard key={`${c.title}-${i}`} campaign={c} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Completed Campaigns" className="border-0 bg-transparent p-0 shadow-none">
          <div className="flex flex-col gap-4">
            {brandCompletedCampaigns.map((c, i) => (
              <CampaignCard key={`${c.title}-${i}`} campaign={c} />
            ))}
          </div>
        </SectionCard>

        <AIAssistant questions={aiAssistantQuestions} />
        <PerformanceInsights recommendations={aiRecommendations} />
      </div>
    </DashboardShell>
  );
}
