"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AvailabilityCalendar,
  CampaignCard,
  EmptyState,
  ProfileCompleteness,
  QuickActions,
  RequestRowCard,
  SectionCard,
  ServicesCard,
  StatCard,
  TrustScore,
  VisibilityBoost,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import {
  creatorNav,
  creatorStatCards,
  dashboardUser,
  trustScoreBreakdown,
  trustScoreEmptyBreakdown,
} from "@/lib/mock";

// + "Creator dashboard empty"
// (418:69025); mobile refs 366:26121 / 418:69686. The empty state is the
// same layout with zeroed values, reached here via ?empty=1.

const activeCampaign = {
  title: "New Product Launch",
  handle: "Brand",
  budget: "0£",
  status: "Active" as const,
  deadline: "Nov 2, 2026",
  submitted: "Sep 2, 2026",
};

const completedCampaign = {
  title: "New Product Launch",
  handle: "Brand",
  budget: "0£",
  status: "Completed" as const,
  deadline: "Nov 2, 2025",
  submitted: "Sep 2, 2025",
};

function CreatorDashboardContent() {
  const params = useSearchParams();
  const empty = params.get("empty") === "1";

  return (
    <DashboardShell
      nav={creatorNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <WelcomeHeader
          title="Welcome back"
          subtitle="Manage your campaigns and creator relationships."
        />

        <ProfileCompleteness pct={empty ? 0 : 65} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {creatorStatCards.map((s) => (
            <StatCard key={s.label} {...s} sub="vs. last month" />
          ))}
        </div>

        <section>
          <h2 className="text-[22px] font-extrabold text-ink-900">
            Recent Requests
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {empty ? (
              <EmptyState
                title="No requests yet."
                body="Collaboration requests from brands will appear here when you receive them."
              />
            ) : (
              [0, 1].map((i) => (
                <RequestRowCard
                  key={i}
                  name="Brand"
                  location="London"
                  budget="0£"
                  status="Active"
                  date="Nov 2, 2026"
                />
              ))
            )}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <ServicesCard />
          <QuickActions
            buttons={[
              "View Public Profile",
              "Edit Creator Profile",
              "Add Service",
              "Upload Portfolio",
            ]}
          />
        </div>

        <SectionCard
          title="Active Campaigns"
          className="border-0 bg-transparent p-0 shadow-none"
        >
          {empty ? (
            <EmptyState
              title="No campaigns yet."
              body="Collaboration requests from brands will appear here when you receive them."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <CampaignCard key={i} campaign={activeCampaign} />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Review Your Brand Partners"
          className="border-0 bg-transparent p-0 shadow-none"
        >
          {empty ? (
            <EmptyState
              title="No brand partners to review yet."
              body="Complete a campaign with a brand to leave a review and share your experience."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <CampaignCard key={i} campaign={completedCampaign} />
              ))}
            </div>
          )}
        </SectionCard>

        <AvailabilityCalendar />

        <TrustScore
          score={empty ? 0 : 123}
          tier="Strong"
          breakdown={empty ? trustScoreEmptyBreakdown : trustScoreBreakdown}
        />

        <VisibilityBoost />
      </div>
    </DashboardShell>
  );
}

export default function CreatorDashboardPage() {
  return (
    <Suspense
      fallback={
        <Card className="p-10 text-center text-ink-500">Loading dashboard…</Card>
      }
    >
      <CreatorDashboardContent />
    </Suspense>
  );
}
