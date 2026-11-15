"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  EmptyState,
  SectionCard,
  StatCard,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { brandNav, creatorNav, dashboardUser } from "@/lib/mock";
import { dashboardPathForRole } from "@/lib/api";

// ---------------------------------------------------------------------------
// Performance Analytics — DESIGN-ONLY (Figma "Performance Analytics").
// Frames: "mob Analytics creator dashboard" + "Analytics creator dashboard"
// (creator), "mob Analytics brand dashboard" + "Analytics brand dashboard"
// (brand). Figma has NO analytics screen for professional or admin, so
// those roles are redirected to their own dashboard below.
// ---------------------------------------------------------------------------
// DESIGN-ONLY means: NO API calls on this page, NO backend endpoint, NO
// schema change. Every number below is the Figma frame's own placeholder
// (0 / 0% / £0) — never a real metric and never an invented realistic
// value. There is no impressions / engagement / conversion data source in
// MVP, so the sections render Figma's empty states. Real-data wiring
// happens later, when an analytics data source exists.
// ---------------------------------------------------------------------------

const selectClassName =
  "rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-[14px] font-medium text-ink-900 dark:text-ink-50 outline-none focus:border-brand";

const RANGES = ["7 days", "30 days", "90 days", "All time"] as const;

function AnalyticsFilters({
  range,
  onRange,
}: {
  range: string;
  onRange: (r: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex items-center gap-2 text-[14px] font-semibold text-ink-500 dark:text-ink-300">
        Filter by client
        {/* Design-only: no client data source yet, so "All clients" is the
            only option. The real client list is wired here once a client data source exists. */}
        <select aria-label="Filter by client" className={selectClassName} defaultValue="all">
          <option value="all">All clients</option>
        </select>
      </label>
      <div
        className="flex flex-wrap rounded-xl border border-ink-200 dark:border-ink-700 p-1"
        role="group"
        aria-label="Date range"
      >
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onRange(r)}
            aria-pressed={range === r}
            className={
              range === r
                ? "rounded-lg bg-brand px-3 py-1.5 text-[13px] font-bold text-white"
                : "rounded-lg px-3 py-1.5 text-[13px] font-semibold text-ink-600 dark:text-ink-200 hover:text-ink-900 dark:hover:text-ink-50"
            }
          >
            {r}
          </button>
        ))}
      </div>
    </div>
  );
}

function EarningsSummary() {
  const [period, setPeriod] = useState("Last 30 days");
  // Figma placeholder: every bar is £0 (no earnings data source in MVP).
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <SectionCard
      title="Earnings Summary"
      action={
        <select
          aria-label="Earnings period"
          className={selectClassName}
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>All time</option>
        </select>
      }
    >
      <p className="text-[30px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
        £0
      </p>
      <p className="mt-0.5 text-[13px] text-ink-400 dark:text-ink-300">vs last month</p>
      {/* Design-only bar chart: all bars are £0 placeholders (Figma). */}
      <div
        className="mt-6 flex h-36 items-end gap-2"
        role="img"
        aria-label="Earnings bar chart — no earnings data yet"
      >
        {months.map((m) => (
          <div key={m} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[11px] font-semibold text-ink-400 dark:text-ink-300">£0</span>
            <div className="h-[2px] w-full rounded-full bg-brand/40" />
            <span className="text-[11px] text-ink-400 dark:text-ink-300">{m}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-ink-500 dark:text-ink-300">
        No earnings yet — earnings from completed campaigns will appear here
        once analytics data is connected.
      </p>
    </SectionCard>
  );
}

function CampaignPerformance() {
  // Brand-only detail card (Figma "Analytics brand dashboard").
  // Design-only: no campaign data source, so "All campaigns" is the only
  // option and every metric is the Figma placeholder (£0 / 0).
  return (
    <SectionCard
      title="Campaign Performance"
      action={
        <select aria-label="Select campaign" className={selectClassName} defaultValue="all">
          <option value="all">All campaigns</option>
        </select>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { value: "£0", label: "Avg. per Creator" },
          { value: "0", label: "Creators" },
          { value: "£0", label: "Total Revenue" },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-[26px] font-extrabold text-ink-900 dark:text-ink-50">{m.value}</p>
            <p className="mt-1 text-[13px] font-semibold text-ink-500 dark:text-ink-300">
              {m.label}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[14px] text-ink-500 dark:text-ink-300">
        No campaigns yet — campaign performance will appear here once
        analytics data is connected.
      </p>
    </SectionCard>
  );
}

function ContentPerformance() {
  const [exportNote, setExportNote] = useState(false);
  return (
    <SectionCard
      title="Content Performance"
      action={
        <Button
          size="md"
          variant="outline"
          onClick={() => setExportNote(true)}
        >
          Export
        </Button>
      }
    >
      {/* Column structure from the Figma frame; no rows yet — no data
          source in MVP, so the Figma empty state renders instead. */}
      <div className="mb-4 hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-ink-100 dark:border-ink-800 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-400 dark:text-ink-300 sm:grid">
        <span>Campaign</span>
        <span>Dates</span>
        <span>Impressions</span>
        <span>Engagement</span>
        <span className="text-right">Revenue</span>
      </div>
      <EmptyState
        title="No performance data yet"
        body="Content performance will appear here once analytics data is connected."
      />
      {exportNote && (
        <p className="mt-4 text-[14px] font-medium text-ink-700 dark:text-ink-200">
          Export will be available once real analytics data is connected.
        </p>
      )}
    </SectionCard>
  );
}

function CompletedCampaigns() {
  return (
    <SectionCard title="Completed Campaigns">
      <EmptyState
        title="No campaigns yet"
        body="Completed campaigns will appear here once analytics data is connected."
      />
    </SectionCard>
  );
}

function TopPerformingCreators() {
  return (
    <SectionCard title="Top Performing Creators">
      {/* Column structure from the Figma frame; no rows yet — no data
          source in MVP, so the Figma empty state renders instead. */}
      <div className="mb-4 hidden grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 border-b border-ink-100 dark:border-ink-800 pb-3 text-[12px] font-bold uppercase tracking-wide text-ink-400 dark:text-ink-300 sm:grid">
        <span>Creator</span>
        <span>Impressions</span>
        <span>Followers</span>
        <span>Eng. Rate</span>
        <span className="text-right">Revenue</span>
      </div>
      <EmptyState
        title="No top-performing creators yet"
        body="Top-performing creators will appear here once analytics data is connected."
      />
    </SectionCard>
  );
}

function RecentCampaignActivity() {
  return (
    <SectionCard title="Recent Campaign Activity">
      <EmptyState
        title="No recent campaign activity"
        body="Recent campaign activity will appear here once analytics data is connected."
      />
    </SectionCard>
  );
}

function PerformanceSummary({ items }: { items: { value: string; label: string }[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-[19px] font-bold text-ink-900 dark:text-ink-50">
        Performance Summary
      </h2>
      <ul className="mt-5 divide-y divide-ink-100 dark:divide-ink-800">
        {items.map((m) => (
          <li
            key={m.label}
            className="flex items-center justify-between py-3 text-[14px]"
          >
            <span className="font-semibold text-ink-500 dark:text-ink-300">{m.label}</span>
            <span className="font-extrabold text-ink-900 dark:text-ink-50">{m.value}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function AnalyticsDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [range, setRange] = useState<string>("30 days");
  // "2 Reports" is a visual design element only (Figma brand frame) — it
  // links NOWHERE and there is no /dashboard/analytics/reports route.
  const [reportsNote, setReportsNote] = useState(false);
  const role = user?.role;

  // Figma has no analytics screen for professional or admin — send those
  // roles back to their own dashboard instead of showing a screen that
  // was never designed for them.
  useEffect(() => {
    if (loading) return;
    if (user && role && role !== "brand" && role !== "creator") {
      router.replace(dashboardPathForRole(role));
    }
  }, [user, loading, role, router]);

  if (loading || !user || (role !== "brand" && role !== "creator")) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 dark:border-ink-700 border-t-brand" />
      </div>
    );
  }

  const isBrand = role === "brand";
  const nav = isBrand ? brandNav : creatorNav;

  // Figma placeholder stat cards (0 / 0% / £0 — never real metrics).
  const statCards = isBrand
    ? [
        { value: "£0", label: "Total Revenue", delta: "0%", icon: "moneybag", sub: "vs last month" },
        { value: "0", label: "Active Campaigns", delta: "0%", icon: "megaphone", sub: "vs last month" },
        { value: "0", label: "Total Impressions", delta: "0%", icon: "eye", sub: "vs last month" },
        { value: "0%", label: "Avg. Engagement Rate", delta: "0%", icon: "percent", sub: "vs last month" },
      ]
    : [
        { value: "£0", label: "Total Earnings", delta: "0%", icon: "moneybag", sub: "vs last month" },
        { value: "0", label: "Total Conversions", delta: "0%", icon: "target", sub: "vs last month" },
        { value: "0", label: "Total Impressions", delta: "0%", icon: "eye", sub: "vs last month" },
        { value: "0", label: "Total Engagements", delta: "0%", icon: "people", sub: "vs last month" },
      ];

  // Figma placeholder summary metrics (desktop "Performance Summary" card).
  // Same six metrics on both the creator and brand frames.
  const summaryItems = [
    { value: "0", label: "Total Campaigns" },
    { value: "0", label: "Completed Campaigns" },
    { value: "0", label: "Total Creators Hired" },
    { value: "£0", label: "Avg. Campaign Value" },
    { value: "0", label: "Total Impressions" },
    { value: "0", label: "Total Conversions" },
  ];

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <WelcomeHeader
          title="Performance Analytics"
          subtitle={
            isBrand
              ? "Track campaign results, creator performance, and revenue across all clients."
              : "Track your content performance, earnings, and brand collaborations."
          }
          action={
            isBrand ? (
              <Button
                size="md"
                variant="outline"
                onClick={() => setReportsNote(true)}
              >
                2 Reports
              </Button>
            ) : undefined
          }
        />

        {reportsNote && (
          <p className="text-[14px] font-medium text-ink-700 dark:text-ink-200">
            Campaign Reports will be available once real analytics data is connected.
          </p>
        )}

        <AnalyticsFilters range={range} onRange={setRange} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {isBrand ? <CampaignPerformance /> : <EarningsSummary />}

        <ContentPerformance />

        <div className="grid gap-8 lg:grid-cols-2">
          <CompletedCampaigns />
          <TopPerformingCreators />
        </div>

        <RecentCampaignActivity />

        <PerformanceSummary items={summaryItems} />
      </div>
    </DashboardShell>
  );
}
