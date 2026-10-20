"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
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
  brandNav,
  dashboardUser,
  type DashboardCampaign,
  type RequestRow,
} from "@/lib/mock";
import { api } from "@/lib/api";

// desktop + "mob Brand dashboard"
// (344:11945) mobile. Welcome header with "+ Create Campaign", three stat
// cards, Recent Requests table, Active/Completed campaign rows, AI Business
// Assistant and AI Performance Insights.
// Stat cards, requests aur campaign lists AB REAL API DATA se aate hain
// (pehle sab mock tha). "Profile Views" ki jagah "Pending Requests" hai —
// profile views ka koi data source MVP me hai hi nahi (analytics Phase 2).

function fmtDate(d: any): string {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString();
}

function personName(u: any): string {
  if (!u) return "User";
  const n = [u.firstName, u.lastName].filter(Boolean).join(" ");
  return n || u.email || "User";
}

function toCampaignCard(c: any, status: "Active" | "Completed"): DashboardCampaign {
  return {
    title: c.title ?? "Campaign",
    handle: c.brand?.email ? `@${String(c.brand.email).split("@")[0]}` : "@brand",
    budget: c.budget != null ? String(c.budget) : "—",
    status,
    deadline: fmtDate(c.deadline),
    submitted: fmtDate(c.createdAt),
  };
}

export default function BrandDashboardPage() {
  const [stats, setStats] = useState({ active: 0, pending: 0, completed: 0 });
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<DashboardCampaign[]>([]);
  const [completedCampaigns, setCompletedCampaigns] = useState<DashboardCampaign[]>([]);

  useEffect(() => {
    api
      .myCampaigns()
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        const open = data.filter((c) => c.status === "open");
        const done = data.filter((c) => c.status === "completed");
        setStats((s) => ({ ...s, active: open.length, completed: done.length }));
        setActiveCampaigns(open.map((c) => toCampaignCard(c, "Active")));
        setCompletedCampaigns(done.map((c) => toCampaignCard(c, "Completed")));
      })
      .catch(() => {});
    api
      .receivedApplications()
      .then((apps: any[]) => {
        if (!Array.isArray(apps)) return;
        const visible = apps.filter(
          (a) => !["rejected", "withdrawn"].includes(String(a.status))
        );
        setStats((s) => ({
          ...s,
          pending: visible.filter((a) =>
            ["submitted", "pending", "under_review"].includes(String(a.status))
          ).length,
        }));
        const rows: RequestRow[] = [...visible]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((a) => ({
            name: personName(a.applicant),
            handle: a.applicant?.email
              ? `@${String(a.applicant.email).split("@")[0]}`
              : "@user",
            campaign: a.campaign?.title ?? "Campaign",
            status:
              a.status === "converted_to_deal"
                ? "Completed"
                : a.status === "accepted" || a.status === "shortlisted"
                  ? "Active"
                  : "Submitted",
            date: fmtDate(a.createdAt),
          }));
        setRequests(rows);
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { value: String(stats.active), label: "Active Campaigns", delta: "", icon: "gift" },
    { value: String(stats.pending), label: "Pending Requests", delta: "", icon: "eye" },
    { value: String(stats.completed), label: "Completed Campaigns", delta: "", icon: "check" },
  ];

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
          {statCards.map((s, i) => (
            <StatCard
              key={s.label}
              {...s}
              mobileLabel={i === 1 ? "Pending Requests" : undefined}
            />
          ))}
        </div>

        <SectionCard title="Recent Requests">
          {requests.length > 0 ? (
            <RequestsTable rows={requests} />
          ) : (
            <p className="py-4 text-[14px] text-ink-500">
              No applications received yet. When creators apply to your
              campaigns, they will appear here.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Active Campaigns" className="border-0 bg-transparent p-0 shadow-none">
          {activeCampaigns.length > 0 ? (
            <div className="flex flex-col gap-4">
              {activeCampaigns.map((c, i) => (
                <CampaignCard key={`${c.title}-${i}`} campaign={c} />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-ink-500">No active campaigns yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Completed Campaigns" className="border-0 bg-transparent p-0 shadow-none">
          {completedCampaigns.length > 0 ? (
            <div className="flex flex-col gap-4">
              {completedCampaigns.map((c, i) => (
                <CampaignCard key={`${c.title}-${i}`} campaign={c} />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-ink-500">No completed campaigns yet.</p>
          )}
        </SectionCard>

        <AIAssistant questions={aiAssistantQuestions} />
        <PerformanceInsights recommendations={aiRecommendations} />
      </div>
    </DashboardShell>
  );
}
