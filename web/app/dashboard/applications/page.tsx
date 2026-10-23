"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard, WelcomeHeader } from "@/components/dashboard/widgets";
import { CreatorApplicationsTable } from "@/components/campaigns/ApplicationTables";
import { Button } from "@/components/ui/Button";
import { creatorNav, dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";

// desktop +
// "mob Applications creator and prof dashboard" (357:18896) mobile:
// "My Applications" — track job applications and their progress.
// Stat cards, filters and the identical "Social Media Creator" rows,
// all copy verbatim.
const statCards = [
  { value: "0", label: "Total Applications", delta: "vs. last month +0% ↗" },
  { value: "0", label: "Under Review", delta: "vs. last month +0% ↗" },
  { value: "0", label: "Interviews", delta: "vs. last month +0% ↗" },
  { value: "0", label: "Offers", delta: "vs. last month +0% ↗" },
];

export default function CreatorApplicationsPage() {
  // Start EMPTY (the page previously seeded mock application rows and
  // kept them whenever the API returned an empty list, contradicting
  // the zeroed stat cards above them).
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState(statCards);

  useEffect(() => {
    api
      .myApplications()
      .then((data) => {
        if (Array.isArray(data)) {
          setRows(
            data.map((a: any) => ({
              company: a.campaign?.brand?.displayName ?? "Brand",
              jobTitle: a.campaign?.title ?? "",
              initials: "CA",
              jobType: "Contract",
              location: "Remote",
              status:
                a.status === "pending"
                  ? "Under Review"
                  : a.status === "accepted"
                    ? "Shortlisted"
                    : a.status === "rejected"
                      ? "Rejected"
                      : a.status,
              dateApplied: new Date(a.createdAt).toLocaleDateString(),
              id: a.id,
              campaignId: a.campaign?.id,
            })) as any
          );
          const total = data.length;
          const underReview = data.filter(
            (a: any) => a.status === "pending" || a.status === "under_review"
          ).length;
          const offers = data.filter(
            (a: any) => a.status === "accepted"
          ).length;
          setStats([
            { value: String(total), label: "Total Applications", delta: "vs. last month +0% ↗" },
            { value: String(underReview), label: "Under Review", delta: "vs. last month +0% ↗" },
            { value: "0", label: "Interviews", delta: "vs. last month +0% ↗" },
            { value: String(offers), label: "Offers", delta: "vs. last month +0% ↗" },
          ]);
        }
      })
      .catch(() => {
        // API unavailable — keep the (empty) real state
      });
  }, []);
  return (
    <DashboardShell
      nav={creatorNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
      topButtonLabel="Find Campaigns"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeHeader
            title="My Applications"
            subtitle="Track your campaign applications and their progress."
          />
          <Link href="/campaigns">
            <Button size="lg">Browse Campaigns</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <CreatorApplicationsTable rows={rows} />
      </div>
    </DashboardShell>
  );
}
