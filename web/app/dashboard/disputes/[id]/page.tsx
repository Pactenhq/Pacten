"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

export default function DisputeDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .disputeDetail(id)
      .then(setDispute)
      .catch(() => setDispute(null))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <Link
        href="/dashboard/disputes"
        className="text-[14px] font-semibold text-brand dark:text-brand-200 hover:underline"
      >
        ← Back to disputes
      </Link>
      <div className="mt-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          Dispute detail
        </h1>
      </div>
      <Card className="mt-6 p-6">
        {loading ? (
          <p className="text-[14px] text-ink-500 dark:text-ink-300">Loading…</p>
        ) : !dispute ? (
          <p className="text-[14px] text-ink-500 dark:text-ink-300">Dispute not found.</p>
        ) : (
          <dl className="space-y-4 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-ink-300">Reason</dt>
              <dd className="font-semibold capitalize">
                {dispute.reason.replace(/_/g, " ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-ink-300">Status</dt>
              <dd className="font-semibold capitalize">
                {dispute.status.replace(/_/g, " ")}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-500 dark:text-ink-300">Filed</dt>
              <dd className="font-semibold">
                {new Date(dispute.createdAt).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="mb-1 text-ink-500 dark:text-ink-300">Description</dt>
              <dd className="rounded-xl bg-ink-50 dark:bg-ink-900 p-4 text-ink-900 dark:text-ink-50">
                {dispute.description}
              </dd>
            </div>
            {dispute.resolution && (
              <div>
                <dt className="mb-1 text-ink-500 dark:text-ink-300">Resolution</dt>
                <dd className="rounded-xl bg-brand-50/60 dark:bg-white/10 p-4 text-ink-900 dark:text-ink-50">
                  {dispute.resolution}
                </dd>
              </div>
            )}
            <div>
              <Link
                href={`/dashboard/deals/${dispute.dealId}`}
                className="text-[14px] font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                View deal →
              </Link>
            </div>
          </dl>
        )}
      </Card>
    </DashboardShell>
  );
}
