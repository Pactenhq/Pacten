"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { MessagePanel } from "@/components/campaigns/MessagePanel";
import { campaignNavFor } from "@/lib/mock-campaigns";
import { dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";

// desktop + "mob Details Campaigns"
// (302:13800) mobile. Campaign Details card, Notes,
// Deliverables list, and the Messages panel.
// Data comes from the real API only; an unknown id or an unreachable
// API shows "Campaign not found". The Messages panel has no campaign
// message backend, so it starts empty — never a fabricated thread.
export default function CampaignDetailsPage() {
  const { id } = useParams() as { id: string };
  const [detail, setDetail] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .campaignDetail(id)
      .then((data) => {
        if (cancelled) return;
        if (data && data.id) {
          const deliverables = Array.isArray(data.deliverables)
            ? data.deliverables
            : String(data.deliverables ?? "")
                .split(/\n|,/)
                .map((s: string) => s.trim())
                .filter(Boolean);
          setDetail({
            description: data.description ?? "",
            notes: data.notes ?? "",
            deliverables,
          });
        }
        // No usable API data: leave detail unset so the not-found
        // state renders. Never show a fabricated campaign.
      })
      .catch(() => {
        if (cancelled) return;
        // API unavailable — leave detail unset (not-found state).
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!detail) {
    return (
      <DashboardShell
        nav={campaignNavFor(id)}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        {loaded ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-lg font-medium text-ink-900 dark:text-ink-50">Campaign not found</p>
            <p className="text-[15px] text-ink-500 dark:text-ink-300">
              This campaign does not exist, or it could not be loaded.
            </p>
            <Link href="/dashboard/campaigns" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
              Back to campaigns
            </Link>
          </div>
        ) : (
          <p className="text-ink-500 dark:text-ink-300">Loading campaign...</p>
        )}
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={campaignNavFor(id)}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
            Campaign Details
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
            {detail.description}
          </p>
          <div className="mt-5 rounded-xl bg-ink-50 dark:bg-ink-900 p-4">
            <p className="text-[14px] font-bold text-ink-900 dark:text-ink-50">Notes</p>
            <p className="mt-1 text-[14px] text-ink-700 dark:text-ink-200">{detail.notes}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[20px] font-bold text-brand dark:text-brand-200">Deliverables</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {detail.deliverables.map((d: string) => (
              <li
                key={d}
                className="flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full bg-brand"
                />
                <span className="text-[15px] font-medium text-ink-900 dark:text-ink-50">{d}</span>
              </li>
            ))}
          </ul>
        </Card>

        <MessagePanel initialMessages={[]} />
      </div>
    </DashboardShell>
  );
}
