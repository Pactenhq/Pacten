"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  brandContractStats,
  contractRows,
  contractStats,
  contractTabs,
  contractTemplates,
  type ContractStat,
  type ContractStatus,
} from "@/lib/mock-messages";

// Contract Centre list pages, rebuilt from the design frames:
// - Brand "Contract" (394:50351): "Contract Centre" heading, four summary
//   cards (Total Sent / Signed / Declined / Awaiting Signature, each with its
//   own icon), "Contract Status" heading, seven status pills + search on the
//   same row, four contract rows (the design repeats the same row, one per
//   status), "Upcoming Deadlines" with "+ New Contract", and "Contract
//   Templates" with "+ New Template" (Edit / Delete actions).
// - Creator "Contract creator" (394:52430): "Contract Centre" heading +
//   subtitle, "My Contracts"/"Templates" tabs, the same four stat cards,
//   the same Contract Status block, Upcoming Deadlines, and the same
//   Contract Templates section.
// "Submitted" is the corrected spelling.

type Tab = ContractStatus | "All";

const badgeStyles: Record<ContractStatus, string> = {
  Draft: "bg-[#fff0b2] text-[#8e6c15]",
  "Awaiting Signature": "bg-[#fff0b2] text-[#8e6c15]",
  Completed: "bg-[#e7f9dd] text-[#488a44]",
  Expired: "bg-[#ffe4e4] text-[#d00404]",
  Cancelled: "bg-ink-100 text-ink-700",
  Signed: "bg-[#e7f9dd] text-[#488a44]",
};

function StatusBadge({ status }: { status: ContractStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold",
        badgeStyles[status]
      )}
    >
      {status}
    </span>
  );
}

function StatIcon({ label }: { label: string }) {
  // Distinct icons per stat card,  "Contract" frames:
  // envelope (Total Sent), check-circle (Signed), x-circle (Declined),
  // clock (Awaiting Signature) — each in a light-blue rounded square.
  const paths: Record<string, ReactNode> = {
    "Total Sent": (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="m3.5 7 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    Signed: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    Declined: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="m9.5 9.5 5 5m0-5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    "Awaiting Signature": (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };
  const icon = paths[label] ?? (
    <>
      <path d="M7 3h7l4 4v14H7V3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v4h4M10 12h5M10 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      {icon}
    </svg>
  );
}

function StatCards({ stats }: { stats: ContractStat[] }) {
  return (
    <div className={cn("grid gap-4", stats.length === 2 ? "grid-cols-2" : "grid-cols-2 xl:grid-cols-4")}>
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-ink-100 bg-white p-5">
          <span
            aria-hidden
            className="flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-brand-50 text-brand"
          >
            <StatIcon label={s.label} />
          </span>
          <p className="mt-4 text-[28px] font-extrabold text-ink-900">{s.value}</p>
          <p className="text-[15px] font-bold text-ink-900">{s.label}</p>
          <p className="text-sm text-ink-500">{s.description}</p>
          <p className="mt-2 inline-flex items-center rounded-full bg-success-bg px-2.5 py-0.5 text-[13px] font-semibold text-success">
            {s.delta}
          </p>
        </div>
      ))}
    </div>
  );
}

function ContractRowCard({ row }: { row: (typeof contractRows)[number] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-ink-100 bg-white px-6 py-5">
      <p className="min-w-[240px] flex-1 text-[15px] font-bold text-ink-900">{row.title}</p>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500">Client Name</p>
        <p className="text-sm font-bold text-ink-900">{row.client}</p>
      </div>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500">{row.submittedLabel}</p>
        <p className="text-sm font-bold text-ink-900">{row.submittedDate}</p>
      </div>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500">Deadline</p>
        <p className="text-sm font-bold text-ink-900">{row.deadlineDate}</p>
      </div>
      <StatusBadge status={row.status} />
    </div>
  );
}

function ContractStatusBlock() {
  const [tab, setTab] = useState<Tab>("All");
  const rows = tab === "All" ? contractRows : contractRows.filter((r) => r.status === tab);

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900">Contract Status</h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap gap-2.5">
          {(["All", ...contractTabs] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors",
                tab === t
                  ? "bg-brand text-white"
                  : "border border-brand/60 bg-white text-brand hover:bg-brand-50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex h-[50px] w-full max-w-[280px] shrink-0 items-center gap-2 rounded-xl border border-ink-200 bg-white px-4">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search contracts"
            className="w-full bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-500"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-900">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-2xl border border-ink-100 bg-white py-10 text-center text-[15px] text-ink-500">
          No contracts in this state yet.
        </p>
      ) : (
        rows.map((r) => <ContractRowCard key={r.id} row={r} />)
      )}
    </section>
  );
}

function UpcomingDeadlines() {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900">Upcoming Deadlines</h2>
        <Button size="lg">+ New Contract</Button>
      </div>
      {contractRows.map((r) => (
        <ContractRowCard key={`deadline-${r.id}`} row={r} />
      ))}
    </section>
  );
}

export function ContractCentre({ variant }: { variant: "brand" | "creator" }) {
  const [centreTab, setCentreTab] = useState<"contracts" | "templates">("contracts");

  return (
    <div className="flex flex-col gap-8">
      {variant === "brand" && (
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900">Contract Centre</h1>
        </div>
      )}
      {variant === "creator" && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900">Contract Centre</h1>
            <p className="mt-1 text-[15px] text-ink-500">
              Manage, send and track your contracts all in one place.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              size="md"
              variant={centreTab === "contracts" ? "primary" : "outline"}
              onClick={() => setCentreTab("contracts")}
            >
              My Contracts
            </Button>
            <Button
              size="md"
              variant={centreTab === "templates" ? "primary" : "outline"}
              onClick={() => setCentreTab("templates")}
            >
              Templates
            </Button>
          </div>
        </div>
      )}

      <StatCards stats={variant === "brand" ? brandContractStats : contractStats} />

      <ContractStatusBlock />

      <UpcomingDeadlines />

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900">Contract Templates</h2>
          <Button size="md">+ New Template</Button>
        </div>
        {contractTemplates.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white px-6 py-5"
          >
            <p className="min-w-[200px] flex-1 text-[15px] font-bold text-ink-900">{t.name}</p>
            <p className="w-[120px] text-sm text-ink-500">{t.updated}</p>
            <div className="flex gap-3">
              <Button size="md">Edit</Button>
              <Button size="md" variant="danger-outline">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
