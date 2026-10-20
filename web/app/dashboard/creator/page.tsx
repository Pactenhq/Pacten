"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
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
import {
  creatorNav,
  dashboardUser,
  trustScoreBreakdown,
  trustScoreEmptyBreakdown,
  type DashboardCampaign,
} from "@/lib/mock";
import { api } from "@/lib/api";

// + "Creator dashboard empty"
// (418:69025); mobile refs 366:26121 / 418:69686.
// Stat cards, Recent Requests aur campaign rows AB REAL API DATA se
// aate hain (pehle sab mock tha): earnings = completed deals ke budgets,
// active campaigns = active deals, requests = received opportunities.
// "Profile Views" ka koi data source MVP me nahi (analytics Phase 2) —
// us ki jagah real Pending Requests count hai. Profile completeness
// asal profile fields se gintee hai. TrustScore / Availability /
// Services abhi design blocks hain (backend source MVP scope me nahi).

function moneyOf(v: any): number {
  if (v == null) return 0;
  const m = String(v).replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) || 0 : 0;
}

function fmtDate(d: any): string {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
}

function personName(u: any): string {
  if (!u) return "Brand";
  const n = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return n || u.email || "Brand";
}

function dealCard(d: any, status: "Active" | "Completed"): DashboardCampaign {
  return {
    title: d.title ?? "Deal",
    handle: d.brand?.email ? `@${String(d.brand.email).split("@")[0]}` : "@brand",
    budget: d.agreedBudget ?? d.budget ?? "—",
    status,
    deadline: "—",
    submitted: fmtDate(d.createdAt),
  };
}

export default function CreatorDashboardPage() {
  const [earnings, setEarnings] = useState(0);
  const [activeDeals, setActiveDeals] = useState<any[]>([]);
  const [completedDeals, setCompletedDeals] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [completeness, setCompleteness] = useState(0);

  useEffect(() => {
    api
      .deals()
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        setActiveDeals(data.filter((d) => d.status === "active"));
        const done = data.filter((d) => d.status === "completed");
        setCompletedDeals(done);
        setEarnings(done.reduce((sum, d) => sum + moneyOf(d.agreedBudget ?? d.budget), 0));
      })
      .catch(() => {});
    api
      .receivedOpportunities()
      .then((data: any[]) => {
        if (Array.isArray(data)) setOpportunities(data);
      })
      .catch(() => {});
    api
      .myProfile()
      .then((p: any) => {
        if (!p) return;
        const checks = [
          !!p.displayName,
          !!p.bio,
          !!p.avatarUrl,
          !!p.location,
          p.rate != null,
          Array.isArray(p.niches) && p.niches.length > 0,
          Array.isArray(p.platforms) && p.platforms.length > 0,
        ];
        setCompleteness(
          Math.round((checks.filter(Boolean).length / checks.length) * 100)
        );
      })
      .catch(() => {});
  }, []);

  const recentRequests = [...opportunities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
  const pendingCount = opportunities.filter((o) => o.status === "pending").length;

  const statCards = [
    { value: String(earnings), label: "Total Earnings", delta: "", icon: "moneybag" },
    { value: String(activeDeals.length), label: "Active Campaigns", delta: "", icon: "megaphone" },
    { value: String(opportunities.length), label: "Campaign Requests", delta: "", icon: "chat" },
    { value: String(pendingCount), label: "Pending Requests", delta: "", icon: "eye" },
  ];

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

        <ProfileCompleteness pct={completeness} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <section>
          <h2 className="text-[22px] font-extrabold text-ink-900">
            Recent Requests
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {recentRequests.length > 0 ? (
              recentRequests.map((o) => (
                <RequestRowCard
                  key={o.id}
                  name={personName(o.brand)}
                  location={o.brand?.email ?? ""}
                  budget={o.budget != null ? String(o.budget) : "—"}
                  status={
                    o.status === "pending"
                      ? "Pending"
                      : o.status === "accepted"
                        ? "Accepted"
                        : "Declined"
                  }
                  date={fmtDate(o.createdAt)}
                />
              ))
            ) : (
              <EmptyState
                title="No requests yet."
                body="Collaboration requests from brands will appear here when you receive them."
              />
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
          {activeDeals.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeDeals.map((d) => (
                <CampaignCard key={d.id} campaign={dealCard(d, "Active")} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No campaigns yet."
              body="Collaboration requests from brands will appear here when you receive them."
            />
          )}
        </SectionCard>

        <SectionCard
          title="Review Your Brand Partners"
          className="border-0 bg-transparent p-0 shadow-none"
        >
          {completedDeals.length > 0 ? (
            <div className="flex flex-col gap-4">
              {completedDeals.map((d) => (
                <CampaignCard key={d.id} campaign={dealCard(d, "Completed")} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No brand partners to review yet."
              body="Complete a campaign with a brand to leave a review and share your experience."
            />
          )}
        </SectionCard>

        <AvailabilityCalendar />

        <TrustScore
          score={completedDeals.length > 0 ? 123 : 0}
          tier="Strong"
          breakdown={
            completedDeals.length > 0 ? trustScoreBreakdown : trustScoreEmptyBreakdown
          }
        />

        <VisibilityBoost />
      </div>
    </DashboardShell>
  );
}
