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
import { api } from "@/lib/api";
import { campaignStatusLabel } from "@/lib/campaignStatus";
import { manageNav } from "@/lib/mock-campaigns";
import { dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";

// Brand campaign management workspace. The page previously rendered a
// fully fabricated workspace for one mock campaign ("Summer Glow"):
// fake header, info cards, tabs, assigned creator, deliverables,
// activity feed and messages — while the [id] segment was ignored and
// only the Approve/Reject buttons called the real API.
//
// Now: the header, status, budget, deadline and deliverables come from
// the real campaign API, and the Applications section lists the real
// applications. There is no backend for campaign tasks, files or an
// activity feed, so those sections are gone rather than fabricated;
// the Messages panel starts empty (campaign messages have no backend —
// real messaging lives under /dashboard/messages).
export default function ManageCampaignPage() {
  const { id } = useParams() as { id: string };
  const { user, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "not-found" | "not-yours" | "signin">("loading");
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState("signin");
      return;
    }
    let cancelled = false;
    api
      .campaignDetail(id)
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.id) {
          setState("not-found");
          return;
        }
        if (user.role === "brand" && data.brandId && data.brandId !== user.id) {
          setState("not-yours");
          return;
        }
        setCampaign(data);
        setState("ready");
        if (user.role === "brand") {
          api
            .campaignApplications(id)
            .then((apps) => {
              if (!cancelled && Array.isArray(apps)) setApplications(apps);
            })
            .catch(() => {
              // Applications unavailable — the section shows its empty state.
            });
        }
      })
      .catch(() => {
        if (!cancelled) setState("not-found");
      });
    return () => {
      cancelled = true;
    };
  }, [id, authLoading, user]);

  const setCampaignStatus = async (status: string) => {
    setStatusMsg("");
    try {
      await api.updateCampaign(id, { status });
      setStatusMsg(`Campaign ${status}.`);
      setCampaign((c: any) => (c ? { ...c, status } : c));
    } catch {
      setStatusMsg("Could not update — try again.");
    }
  };

  const deliverables: string[] = Array.isArray(campaign?.deliverables)
    ? campaign.deliverables
    : String(campaign?.deliverables ?? "")
        .split(/\n|,/)
        .map((s: string) => s.trim())
        .filter(Boolean);

  return (
    <DashboardShell
      nav={manageNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-6">
        <p className="text-[13px] font-medium text-ink-400 dark:text-ink-300">Management</p>

        {state === "loading" && <p className="text-ink-500 dark:text-ink-300">Loading campaign...</p>}

        {state === "signin" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-lg font-medium text-ink-900 dark:text-ink-50">Sign in to manage this campaign</p>
            <Link href="/login" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
              Go to login
            </Link>
          </div>
        )}

        {state === "not-found" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-lg font-medium text-ink-900 dark:text-ink-50">Campaign not found</p>
            <p className="text-[15px] text-ink-500 dark:text-ink-300">
              This campaign does not exist, or it could not be loaded.
            </p>
            <Link href="/dashboard/campaigns" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
              Back to campaigns
            </Link>
          </div>
        )}

        {state === "not-yours" && (
          <div className="flex flex-col items-start gap-3">
            <p className="text-lg font-medium text-ink-900 dark:text-ink-50">This campaign is not yours.</p>
            <p className="text-[15px] text-ink-500 dark:text-ink-300">
              Only the brand that created a campaign can manage it.
            </p>
            <Link href="/dashboard/campaigns" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
              Back to campaigns
            </Link>
          </div>
        )}

        {state === "ready" && campaign && (
          <>
            {/* Header — real campaign fields only */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
                      {campaign.title}
                    </h1>
                    {/* GAP-4: same shared label as My Campaigns /
                        brand dashboard / public detail (was raw "open"). */}
                    {campaign.status ? <Tag tone="warning">{campaignStatusLabel(campaign.status)}</Tag> : null}
                  </div>
                  <p className="mt-2 text-[14px] text-ink-500 dark:text-ink-300">
                    {campaign.createdAt
                      ? `Created: ${new Date(campaign.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : ""}
                    {campaign.deadline ? `  |  Deadline: ${campaign.deadline}` : ""}
                  </p>
                  {campaign.description ? (
                    <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
                      {campaign.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setCampaignStatus("open")}>Approve</Button>
                  <Button variant="outline" onClick={() => setCampaignStatus("closed")}>
                    Reject
                  </Button>
                </div>
                {statusMsg && (
                  <p className="mt-2 text-[14px] font-medium text-brand dark:text-brand-200">{statusMsg}</p>
                )}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                  <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Budget</p>
                  <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{campaign.budget || "Not set"}</p>
                </div>
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                  <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Status</p>
                  <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{campaignStatusLabel(campaign.status)}</p>
                </div>
                <div className="rounded-xl border border-ink-100 dark:border-ink-800 p-4">
                  <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Deadline</p>
                  <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{campaign.deadline || "Not set"}</p>
                </div>
              </div>
            </Card>

            {/* Applications — real data */}
            <Card className="p-6">
              <h2 className="text-[18px] font-bold text-ink-900 dark:text-ink-50">Applications</h2>
              {applications.length === 0 ? (
                <p className="mt-4 text-[14px] text-ink-500 dark:text-ink-300">
                  No applications yet. When creators or professionals apply, they will appear here.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {applications.map((a: any) => (
                    <li key={a.id} className="rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[15px] font-bold text-ink-900 dark:text-ink-50">
                          {[a.applicant?.firstName, a.applicant?.lastName].filter(Boolean).join(" ") || "Applicant"}
                        </p>
                        {a.status ? <Tag tone="neutral">{a.status}</Tag> : null}
                      </div>
                      {a.coverLetter ? (
                        <p className="mt-1 text-[14px] text-ink-700 dark:text-ink-200">{a.coverLetter}</p>
                      ) : null}
                      {a.createdAt ? (
                        <p className="mt-1 text-[13px] text-ink-400 dark:text-ink-300">
                          {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Deliverables — real campaign field */}
            <Card className="p-6">
              <h2 className="text-[18px] font-bold text-ink-900 dark:text-ink-50">Deliverables</h2>
              {deliverables.length === 0 ? (
                <p className="mt-4 text-[14px] text-ink-500 dark:text-ink-300">
                  No deliverables listed for this campaign.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col gap-3">
                  {deliverables.map((d: string) => (
                    <li
                      key={d}
                      className="flex items-center gap-3 rounded-xl border border-ink-100 dark:border-ink-800 px-4 py-3"
                    >
                      <span aria-hidden className="h-3 w-3 shrink-0 rounded-full bg-brand" />
                      <span className="text-[15px] font-medium text-ink-900 dark:text-ink-50">{d}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <MessagePanel initialMessages={[]} />
          </>
        )}
      </div>
    </DashboardShell>
  );
}
