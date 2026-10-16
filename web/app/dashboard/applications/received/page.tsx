"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard, WelcomeHeader } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { brandNav, dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";

// Brand "My Applications" — review creator applications.
// Real API with mock fallback. Accept/Reject updates status via API.
export default function BrandApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => {
    setLoading(true);
    api
      .receivedApplications()
      .then((data) => {
        if (Array.isArray(data)) setApplications(data);
      })
      .catch(() => {
        // API unavailable — show empty state
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (appId: string, status: "accepted" | "rejected") => {
    try {
      await api.updateApplicationStatus(appId, status);
      load();
    } catch {
      // Show local update on API failure
      setApplications((apps) =>
        apps.map((a) => (a.id === appId ? { ...a, status } : a))
      );
    }
  };

  const filtered = applications.filter((a: any) =>
    [a.creator?.email, a.coverLetter, a.campaign?.title]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const stats = [
    { value: String(applications.length), label: "Total Applications", delta: "" },
    {
      value: String(applications.filter((a) => a.status === "pending").length),
      label: "Pending",
      delta: "",
    },
    {
      value: String(applications.filter((a) => a.status === "accepted").length),
      label: "Accepted",
      delta: "",
    },
    {
      value: String(applications.filter((a) => a.status === "rejected").length),
      label: "Rejected",
      delta: "",
    },
  ];

  return (
    <DashboardShell
      nav={brandNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
      topButtonLabel="Post Campaign"
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeHeader
            title="My Applications"
            subtitle="Review creator applications for your jobs and find the right fit for your brand."
          />
          <Link href="/dashboard/campaigns/new">
            <Button size="lg">Post a New Job</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="border-b border-ink-100 p-6">
            <h2 className="text-[18px] font-bold text-ink-900">Applications</h2>
            <div className="mt-4">
              <label className="flex h-[50px] flex-1 items-center gap-2.5 rounded-xl border border-ink-300 px-4">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-400">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="h-full flex-1 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
                />
              </label>
            </div>
          </div>
          {loading ? (
            <p className="p-6 text-ink-500">Loading applications...</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-ink-500">
              No applications yet. Share your campaigns to receive applications.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {filtered.map((a: any) => (
                <li key={a.id} className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[15px] font-bold text-ink-900">
                        {a.creator?.email ?? "Creator"}
                      </p>
                      <p className="mt-1 text-[13px] text-ink-500">
                        {a.campaign?.title ?? "Campaign"}
                      </p>
                      {a.coverLetter && (
                        <p className="mt-2 max-w-xl text-[14px] text-ink-700">
                          {a.coverLetter}
                        </p>
                      )}
                      {a.proposedBudget && (
                        <p className="mt-1 text-[14px] font-semibold text-ink-900">
                          Proposed: {a.proposedBudget}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={
                          a.status === "accepted"
                            ? "rounded-full bg-green-100 px-3 py-1 text-[13px] font-semibold text-green-700"
                            : a.status === "rejected"
                              ? "rounded-full bg-red-100 px-3 py-1 text-[13px] font-semibold text-red-700"
                              : "rounded-full bg-amber-100 px-3 py-1 text-[13px] font-semibold text-amber-700"
                        }
                      >
                        {a.status}
                      </span>
                      {a.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(a.id, "accepted")}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(a.id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
