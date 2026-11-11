"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import {
  contractTabs,
  type ContractStat,
  type ContractStatus,
} from "@/lib/mock-messages";

// The two contract options below are the REAL generation choices in the
// system (see contracts.service: template 'standard' vs 'simple').
// The tab previously listed a fabricated "Influencer Template" with
// dead Edit/Delete buttons.

// Contract Centre list pages, rebuilt from the design frames (visual design
// unchanged). M4: rows, stats, search and tabs are now driven by the real
// contracts API instead of mock data. Backend statuses map to the design's
// labels: sent -> "Awaiting Signature", accepted -> "Signed",
// declined -> "Cancelled", draft -> "Draft".

type ApiContract = {
  id: string;
  title: string;
  status: "draft" | "sent" | "accepted" | "declined";
  createdAt: string;
  brandId: string;
  creatorId: string;
  dealId: string;
  counterpartyName?: string;
  dealDeadline?: string | null;
};

type Row = {
  id: string;
  title: string;
  client: string;
  submittedLabel: string;
  submittedDate: string;
  deadlineDate: string;
  status: ContractStatus;
};

const STATUS_LABEL: Record<ApiContract["status"], ContractStatus> = {
  draft: "Draft",
  sent: "Awaiting Signature",
  accepted: "Signed",
  declined: "Cancelled",
};

type Tab = ContractStatus | "All";

const badgeStyles: Record<ContractStatus, string> = {
  Draft: "bg-[#fff0b2] text-[#8e6c15]",
  "Awaiting Signature": "bg-[#fff0b2] text-[#8e6c15]",
  Completed: "bg-[#e7f9dd] text-[#488a44]",
  Expired: "bg-[#ffe4e4] text-[#d00404]",
  Cancelled: "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200",
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
        <div key={s.label} className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5">
          <span
            aria-hidden
            className="flex h-[45px] w-[45px] items-center justify-center rounded-xl bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200"
          >
            <StatIcon label={s.label} />
          </span>
          <p className="mt-4 text-[28px] font-extrabold text-ink-900 dark:text-ink-50">{s.value}</p>
          <p className="text-[15px] font-bold text-ink-900 dark:text-ink-50">{s.label}</p>
          <p className="text-sm text-ink-500 dark:text-ink-300">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

function ContractRowCard({ row }: { row: Row }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/dashboard/contracts/${row.id}`)}
      className="flex w-full flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-5 text-left transition-colors hover:border-brand/50"
    >
      <p className="min-w-[240px] flex-1 text-[15px] font-bold text-ink-900 dark:text-ink-50">{row.title}</p>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500 dark:text-ink-300">Client Name</p>
        <p className="text-sm font-bold text-ink-900 dark:text-ink-50">{row.client}</p>
      </div>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500 dark:text-ink-300">{row.submittedLabel}</p>
        <p className="text-sm font-bold text-ink-900 dark:text-ink-50">{row.submittedDate}</p>
      </div>
      <div className="w-[110px]">
        <p className="text-[13px] text-ink-500 dark:text-ink-300">Deadline</p>
        <p className="text-sm font-bold text-ink-900 dark:text-ink-50">{row.deadlineDate}</p>
      </div>
      <StatusBadge status={row.status} />
    </button>
  );
}

function toRow(c: ApiContract): Row {
  const date = new Date(c.createdAt);
  const fmt = isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return {
    id: c.id,
    title: c.title,
    client: c.counterpartyName || "—",
    submittedLabel: "Submitted",
    submittedDate: fmt,
    deadlineDate: c.dealDeadline || "—",
    status: STATUS_LABEL[c.status] ?? "Draft",
  };
}

function ContractStatusBlock({ rows }: { rows: Row[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");

  const filtered = rows.filter((r) => {
    const tabOk = tab === "All" || r.status === tab;
    const qOk =
      query.trim() === "" ||
      r.title.toLowerCase().includes(query.trim().toLowerCase());
    return tabOk && qOk;
  });

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">Contract Status</h2>
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
                  : "border border-brand/60 bg-white dark:bg-ink-900 text-brand dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-white/10"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex h-[50px] w-full max-w-[280px] shrink-0 items-center gap-2 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4">
          <input
            type="text"
            placeholder="Search"
            aria-label="Search contracts"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[15px] text-ink-900 dark:text-ink-50 outline-none placeholder:text-ink-500 dark:placeholder:text-ink-300"
          />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-900 dark:text-ink-50">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
          No contracts in this state yet.
        </p>
      ) : (
        filtered.map((r) => <ContractRowCard key={r.id} row={r} />)
      )}
    </section>
  );
}

export function ContractCentre({ variant }: { variant: "brand" | "creator" }) {
  const [centreTab, setCentreTab] = useState<"contracts" | "templates">("contracts");
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .contracts()
      .then((data) => setContracts(Array.isArray(data) ? data : []))
      .catch(() => setContracts([]))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => contracts.map(toRow), [contracts]);

  const stats: ContractStat[] = useMemo(() => {
    const count = (s: ContractStatus) => rows.filter((r) => r.status === s).length;
    return [
      { label: "Total Sent", value: String(rows.length), description: "All contracts", delta: "" },
      { label: "Signed", value: String(count("Signed")), description: "Accepted contracts", delta: "" },
      { label: "Declined", value: String(count("Cancelled")), description: "Declined contracts", delta: "" },
      { label: "Awaiting Signature", value: String(count("Awaiting Signature")), description: "Pending signature", delta: "" },
    ];
  }, [rows]);

  return (
    <div className="flex flex-col gap-8">
      {variant === "brand" && (
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">Contract Centre</h1>
        </div>
      )}
      {variant === "creator" && (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">Contract Centre</h1>
            <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">
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

      {loading ? (
        <p className="text-[15px] text-ink-500 dark:text-ink-300">Loading contracts...</p>
      ) : (
        <>
          <StatCards stats={stats} />
          <ContractStatusBlock rows={rows} />

          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">Upcoming Deadlines</h2>
              <Link href="/dashboard/deals">
                <Button size="lg">+ New Contract</Button>
              </Link>
            </div>
            {rows.filter((r) => r.status === "Awaiting Signature").length === 0 ? (
              <p className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
                No contracts awaiting signature.
              </p>
            ) : (
              rows
                .filter((r) => r.status === "Awaiting Signature")
                .map((r) => <ContractRowCard key={`deadline-${r.id}`} row={r} />)
            )}
          </section>
        </>
      )}

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">Contract Templates</h2>
        </div>
        {[
          {
            name: "Pacten Standard Transaction Agreement",
            description:
              "The client-supplied standard agreement, completed through a guided form. Both parties review and accept before the deal becomes active.",
          },
          {
            name: "Simple Contract",
            description:
              "The simpler contract generated from the agreed deal terms, with the same two-party acceptance.",
          },
        ].map((t) => (
          <div
            key={t.name}
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-5"
          >
            <div className="min-w-[200px] flex-1">
              <p className="text-[15px] font-bold text-ink-900 dark:text-ink-50">{t.name}</p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{t.description}</p>
            </div>
            <Link href="/dashboard/deals">
              <Button size="md">Create a contract</Button>
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}
