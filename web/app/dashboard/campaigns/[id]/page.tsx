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
import { campaignNav, campaignDetails, campaignMessages } from "@/lib/mock-campaigns";
import { dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";

// desktop + "mob Details Campaigns"
// (302:13800) mobile. Campaign Details card, Notes,
// Deliverables list, and the Messages panel.
// Data comes from the real API with mock fallback.
export default function CampaignDetailsPage() {
  const { id } = useParams() as { id: string };
  const [detail, setDetail] = useState<any>(null);

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
        } else {
          const mock = campaignDetails[id] ?? campaignDetails["summer-glow"];
          setDetail(mock);
        }
      })
      .catch(() => {
        if (cancelled) return;
        // API unavailable — fall back to mock
        const mock = campaignDetails[id] ?? campaignDetails["summer-glow"];
        setDetail(mock);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!detail) {
    return (
      <DashboardShell
        nav={campaignNav}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        <p className="text-ink-500">Loading campaign...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      nav={campaignNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink-900">
            Campaign Details
          </h1>
          <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-700">
            {detail.description}
          </p>
          <div className="mt-5 rounded-xl bg-ink-50 p-4">
            <p className="text-[14px] font-bold text-ink-900">Notes</p>
            <p className="mt-1 text-[14px] text-ink-700">{detail.notes}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-[20px] font-bold text-brand">Deliverables</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {detail.deliverables.map((d: string) => (
              <li
                key={d}
                className="flex items-center gap-3 rounded-xl border border-ink-100 px-4 py-3"
              >
                <span
                  aria-hidden
                  className="h-3 w-3 shrink-0 rounded-full bg-brand"
                />
                <span className="text-[15px] font-medium text-ink-900">{d}</span>
              </li>
            ))}
          </ul>
        </Card>

        <MessagePanel
          initialMessages={campaignMessages}
          creatorName="Jane Smith"
          creatorHandle="@janesmith"
        />
      </div>
    </DashboardShell>
  );
}
