"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { notFound, useParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { MessagePanel } from "@/components/campaigns/MessagePanel";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import {
  manageNav,
  campaignDetails,
  campaignMessages,
  manageHeader,
  manageInfoCards,
  campaignActionsMenu,
  campaignQuickActions,
  campaignStatusSteps,
  campaignMeta,
  campaignAttachments,
  budgetPayment,
  keyDates,
  assignedCreator,
  manageDeliverables,
  deliverableSummary,
  activityFeedStats,
  activityFeedFilters,
  activityFeedEntries,
} from "@/lib/mock-campaigns";
import { dashboardUser } from "@/lib/mock";

// desktop + "mob Management" (335:6697)
// mobile — the brand campaign management workspace. Header with Approve /
// Reject, info cards, quick actions, the "Campaign Actions" menu, tabs
// (Recent Updates / Files & Attachments / Budget & Payment / Deadlines &
// Key Dates), assigned creator/professionals, deliverables, messages and
// the activity feed. All copy verbatim from the frame.
function InfoIcon({ icon }: { icon: string }) {
  const paths: Record<string, React.ReactNode> = {
    clock: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    gift: (
      <>
        <rect x="4" y="8" width="16" height="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 12v8h12v-8M12 8v12M12 8s-4.5 0-5.5-2C5.7 4.5 7 3 8.5 3.5 10 4 12 8 12 8Zm0 0s4.5 0 5.5-2c.8-1.5-.5-3-2-2.5C14 4 12 8 12 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    wallet: (
      <path d="M4 7h16v11H4zM4 7l2-3h12l2 3M16 12h2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
    card: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
      </>
    ),
    note: (
      <path d="M6 3h8l4 4v14H6V3zM14 3v4h4M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  };
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      {paths[icon]}
    </svg>
  );
}

const tabs = ["Recent Updates", "Files & Attachments", "Budget & Payment", "Deadlines & Key Dates"] as const;

export default function ManageCampaignPage() {
  // Single mock campaign; the [id] segment is kept for the route shape.
  if (!campaignDetails["summer-glow"]) notFound();
  const { id } = useParams() as { id: string };
  const [tab, setTab] = useState<(typeof tabs)[number]>("Recent Updates");
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const setCampaignStatus = async (status: string) => {
    setStatusMsg("");
    try {
      await api.updateCampaign(id, { status });
      setStatusMsg(`Campaign ${status}.`);
    } catch {
      setStatusMsg("Could not update — try again.");
    }
  };

  return (
    <DashboardShell
      nav={manageNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-6">
        <p className="text-[13px] font-medium text-ink-400">Management</p>

        {/* Header */}
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900">
                  {manageHeader.title}
                </h1>
                <Tag tone="warning">{manageHeader.status}</Tag>
              </div>
              <p className="mt-2 text-[14px] text-ink-500">
                Submitted: {manageHeader.submitted} <span className="mx-1">|</span> Deadline: Nov 31, 2026
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setCampaignStatus("open")}>Approve</Button>
              <Button variant="outline" onClick={() => setCampaignStatus("closed")}>
                Reject
              </Button>
            </div>
            {statusMsg && (
              <p className="mt-2 text-[14px] font-medium text-brand">{statusMsg}</p>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manageInfoCards.map((c) => (
              <div key={c.label} className="flex items-center gap-4 rounded-xl border border-ink-100 p-4">
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand">
                  <InfoIcon icon={c.icon} />
                </span>
                <div>
                  <p className="text-[15px] font-bold text-brand">{c.label}</p>
                  <p className="mt-0.5 text-[14px] font-medium text-ink-900">{c.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[18px] font-bold text-ink-900">Quick Actions</h2>
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setMenuOpen((o) => !o)}>
                Campaign Actions
              </Button>
              {menuOpen && (
                <ul className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-ink-100 bg-white py-2 shadow-lg">
                  {campaignActionsMenu.map((item) => (
                    <li key={item}>
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="block w-full cursor-pointer px-4 py-2 text-left text-[14px] text-ink-700 hover:bg-ink-50"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {campaignQuickActions.map((a) => (
              <Button key={a} variant="outline" size="sm">
                {a}
              </Button>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Card className="p-6">
          <div className="flex gap-2 border-b border-ink-100">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "cursor-pointer px-4 pb-3 text-[15px] font-semibold transition-colors",
                  tab === t
                    ? "border-b-2 border-brand text-brand"
                    : "text-ink-500 hover:text-ink-900"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Recent Updates" && (
            <ol className="mt-5 flex flex-col gap-0">
              {campaignStatusSteps.map((s, i) => (
                <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < campaignStatusSteps.length - 1 && (
                    <span aria-hidden className="absolute top-6 left-[11px] h-[calc(100%-24px)] w-0.5 bg-ink-100" />
                  )}
                  <span
                    aria-hidden
                    className={
                      "z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full " +
                      (s.state === "done"
                        ? "bg-success text-white"
                        : s.state === "current"
                          ? "bg-brand text-white"
                          : "bg-ink-100 text-ink-400")
                    }
                  >
                    {s.state === "done" ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m5 13 4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </span>
                  <div>
                    <p className="text-[15px] font-bold text-ink-900">{s.label}</p>
                    <p className="text-[13px] text-ink-500">{s.detail}</p>
                  </div>
                </li>
              ))}
              <div className="mt-5 grid gap-3 border-t border-ink-100 pt-5 text-[14px] sm:grid-cols-3">
                <p className="text-ink-500">
                  Accepted Date: <span className="font-semibold text-ink-900">Jan 5, 2025</span>
                </p>
                <p className="text-ink-500">
                  Declined Date: <span className="font-semibold text-ink-900">{campaignMeta.declinedDate}</span>
                </p>
                <p className="text-ink-500">
                  Payment Status: <span className="font-semibold text-ink-900">{campaignMeta.paymentStatus}</span>
                </p>
              </div>
            </ol>
          )}

          {tab === "Files & Attachments" && (
            <ul className="mt-5 flex flex-col gap-3">
              {campaignAttachments.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-ink-100 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span aria-hidden className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 3h8l4 4v14H6V3zM14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-ink-900">{f.name}</p>
                      <p className="text-[12px] text-ink-400">{f.size} • {f.date}</p>
                    </div>
                  </div>
                  <button className="cursor-pointer text-[13px] font-semibold text-brand hover:underline">
                    Download
                  </button>
                </li>
              ))}
            </ul>
          )}

          {tab === "Budget & Payment" && (
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-4">
                <Tag tone="warning">{budgetPayment.status}</Tag>
                <p className="text-[28px] font-extrabold text-ink-900">{budgetPayment.amount}</p>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${budgetPayment.progress}%` }} />
              </div>
              <p className="mt-2 text-[14px] font-semibold text-ink-700">
                {budgetPayment.progress}% Progress
              </p>
              <div className="mt-4 flex gap-8 text-[14px]">
                <p className="text-ink-500">
                  <span className="font-bold text-ink-900">{budgetPayment.totalTasks}</span> Total Tasks
                </p>
                <p className="text-ink-500">
                  <span className="font-bold text-ink-900">{budgetPayment.completedTasks}</span> Completed
                </p>
              </div>
            </div>
          )}

          {tab === "Deadlines & Key Dates" && (
            <ul className="mt-5 flex flex-col gap-3">
              {keyDates.map((d) => (
                <li key={d.label} className="flex items-center justify-between text-[14px]">
                  <span className="text-ink-500">{d.label}</span>
                  <span className="font-semibold text-ink-900">{d.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Assigned creator */}
          <Card className="p-6">
            <h2 className="text-[18px] font-bold text-ink-900">Assigned Creator</h2>
            <div className="mt-4 flex items-center gap-4">
              <span aria-hidden className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-base font-bold text-brand">
                {assignedCreator.initials}
              </span>
              <div>
                <p className="text-[16px] font-bold text-ink-900">{assignedCreator.name}</p>
                <p className="text-[13px] text-ink-500">{assignedCreator.location}</p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-[14px] sm:grid-cols-4">
              <div><dt className="text-[12px] text-ink-400">Followers</dt><dd className="font-bold text-ink-900">{assignedCreator.followers}</dd></div>
              <div><dt className="text-[12px] text-ink-400">Avg. Engagement</dt><dd className="font-bold text-ink-900">{assignedCreator.engagement}</dd></div>
              <div><dt className="text-[12px] text-ink-400">Reviews</dt><dd className="font-bold text-ink-900">{assignedCreator.reviews}</dd></div>
              <div><dt className="text-[12px] text-ink-400">Rating</dt><dd className="font-bold text-ink-900">{assignedCreator.rating}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {assignedCreator.chips.map((chip) => (
                <span key={chip} className="rounded-full bg-ink-100 px-3 py-1 text-[13px] font-medium text-ink-700">
                  {chip}
                </span>
              ))}
            </div>
          </Card>

          {/* Assigned professionals (empty state, verbatim) */}
          <Card className="p-6">
            <h2 className="text-[18px] font-bold text-ink-900">Assigned Professionals</h2>
            <p className="mt-4 text-[14px] text-ink-500">
              No professionals assigned to this campaign yet.
            </p>
            <div className="mt-4">
              <Button variant="outline">Add Professional</Button>
            </div>
          </Card>
        </div>

        {/* Deliverables */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[18px] font-bold text-ink-900">Deliverables</h2>
              <p className="mt-0.5 text-[14px] text-ink-500">
                {deliverableSummary.total} Deliverables · Overall Progress {deliverableSummary.overallProgress}%
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tag tone="danger">{deliverableSummary.overdue} Overdue</Tag>
              <Tag tone="warning">{deliverableSummary.upcoming} Upcoming</Tag>
              <Tag tone="neutral">{deliverableSummary.completed} Completed</Tag>
              <Tag tone="neutral">{deliverableSummary.blocked} Blocked</Tag>
              <Tag tone="danger">{deliverableSummary.late} Late</Tag>
            </div>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-brand" style={{ width: `${deliverableSummary.overallProgress}%` }} />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex h-11 flex-1 items-center rounded-xl border border-ink-300 px-4 text-[14px] text-ink-400">
              Search deliverables...
            </label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="h-11">Filter</Button>
              <Button variant="outline" size="sm" className="h-11">Sort</Button>
              <Button variant="outline" size="sm" className="h-11">Add Professional</Button>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {manageDeliverables.map((d) => (
              <div key={d.title} className="rounded-xl border border-ink-100 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[15px] font-bold text-ink-900">{d.title}</p>
                  <Tag tone={d.priority === "High" ? "danger" : "warning"} className="h-7 px-2.5 text-xs">{d.priority}</Tag>
                </div>
                <p className="mt-1 text-[13px] font-semibold text-ink-500">{d.status}</p>
                <p className="mt-2 text-[14px] text-ink-700">{d.description}</p>
                <p className="mt-2 text-[13px] text-ink-500">Owner: {d.owner} · Due: {d.due}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${d.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-ink-400">
                  <span>{d.progress}%</span>
                  <span>{d.files} files • {d.comments} comments</span>
                </div>
                <button className="mt-3 cursor-pointer text-[13px] font-semibold text-brand hover:underline">
                  View →
                </button>
              </div>
            ))}
          </div>
        </Card>

        <MessagePanel
          initialMessages={campaignMessages}
          creatorName="Jane Smith"
          creatorHandle="@janesmith"
        />

        {/* Activity feed */}
        <Card className="p-6">
          <h2 className="text-[18px] font-bold text-ink-900">Activity Feed</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {activityFeedStats.map((s) => (
              <div key={s.label} className="rounded-xl bg-ink-50 p-4 text-center">
                <p className="text-[24px] font-extrabold text-ink-900">{s.value}</p>
                <p className="mt-0.5 text-[13px] text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {activityFeedFilters.map((f, i) => (
              <button
                key={f}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-[13px] font-semibold",
                  i === 0
                    ? "border-brand bg-brand text-white"
                    : "border-ink-200 text-ink-600 hover:border-brand hover:text-brand"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {activityFeedEntries.map((e) => (
            <div key={e.title} className="mt-5">
              <p className="text-[13px] font-bold text-ink-400 uppercase">{e.date}</p>
              <div className="mt-2 flex gap-3">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <div>
                  <p className="text-[15px] font-bold text-ink-900">{e.title}</p>
                  <p className="text-[14px] text-ink-500">{e.detail}</p>
                  <p className="mt-0.5 text-[12px] text-ink-400">{e.time}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </DashboardShell>
  );
}
