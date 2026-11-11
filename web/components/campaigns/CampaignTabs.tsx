"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { myCampaignPills } from "@/lib/mock-campaigns";
import { api } from "@/lib/api";

// Rebuilt from the  (319:12842) verbatim:
// "My Campaigns" heading, subtitle, "+ Create Campaign", filter pills
// All / Pending / Accepted / Completed / Declined / Cancelled, and the
// campaign rows: icon, "New Product Launch" / "@sophie.c", Budget /
// Status / Deadline / Submitted columns and a kebab menu. Statuses are
// had a "Deciilned" typo — corrected to "Declined".
const pillToStatus: Record<string, string[]> = {
  All: [],
  Pending: ["Pending"],
  Accepted: ["Accepted"],
  Completed: ["Completed"],
  Declined: ["Declined"],
  Cancelled: [],
};

function StatusIcon({ status }: { status: string }) {
  const isPending = status === "Pending";
  const isDeclined = status === "Declined";
  return (
    <span
      aria-hidden
      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200"
    >
      {isPending ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : isDeclined ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="m9 9 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          <path d="m8.5 12.2 2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export function CampaignTabs() {
  const [pill, setPill] = useState("All");
  // Start EMPTY: rows come only from the real API. The list previously
  // initialised with fabricated showcase campaigns, so a brand with no
  // campaigns saw fake rows ("New Product Launch / @sophie.c").
  const [rows, setRows] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .myCampaigns()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((c: any) => ({
              title: c.title,
              handle: `@${c.brand?.email?.split("@")[0] ?? "brand"}`,
              budget: c.budget ?? "—",
              status:
                c.status === "open"
                  ? "Pending"
                  : c.status === "completed"
                    ? "Completed"
                    : c.status === "closed"
                      ? "Declined"
                      : "Pending",
              deadline: c.deadline ?? "—",
              submitted: new Date(c.createdAt).toLocaleDateString(),
              id: c.id,
              rawStatus: c.status,
            }))
          );
        }
      })
      .catch(() => {
        // API unavailable or not logged in — keep the list empty.
        // Never show fabricated campaigns.
      });
  }, []);

  const closeCampaign = async (id: string) => {
    setClosingId(id);
    try {
      await api.updateCampaign(id, { status: "closed" });
      setRows((rs) =>
        rs.map((r: any) =>
          r.id === id ? { ...r, status: "Declined", rawStatus: "closed" } : r
        )
      );
    } catch {
      // keep the row unchanged on failure
    } finally {
      setClosingId(null);
      setOpenMenu(null);
    }
  };

  const allowed = pillToStatus[pill] ?? [];
  const filtered = allowed.length
    ? rows.filter((r) => allowed.includes(r.status))
    : rows;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {myCampaignPills.map((p) => (
          <button
            key={p}
            onClick={() => setPill(p)}
            className={cn(
              "cursor-pointer rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors",
              pill === p
                ? "border-brand bg-brand text-white"
                : "border-brand-300 bg-white dark:bg-ink-900 text-brand dark:text-brand-200 hover:border-brand"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="mt-6 hidden grid-cols-[1fr_90px_110px_130px_130px_40px] items-center gap-4 px-6 text-[13px] font-medium text-ink-500 dark:text-ink-300 md:grid">
        <span />
        <span>Budget</span>
        <span>Status</span>
        <span>Deadline</span>
        <span>Submitted</span>
        <span />
      </div>

      <div className="mt-2 flex flex-col gap-4">
        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-[15px] text-ink-500 dark:text-ink-300">
              No campaigns yet. When you create a campaign, it will appear here.
            </p>
          </Card>
        )}
        {filtered.map((c, i) => (
          <Card key={c.status + i} className="p-5">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 md:grid-cols-[1fr_90px_110px_130px_130px_40px]">
              {/* min-w-0 chain: without it the title cell refuses to
                  shrink below its longest word and the fixed columns
                  push past the viewport on tablet widths. */}
              <div className="flex min-w-0 items-center gap-4">
                <StatusIcon status={c.status} />
                <div className="min-w-0">
                  <p className="break-words text-[16px] font-bold text-ink-900 dark:text-ink-50">{c.title}</p>
                  <p className="mt-0.5 truncate text-[14px] text-ink-500 dark:text-ink-300">{c.handle}</p>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Budget</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{c.budget}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Status</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{c.status}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Deadline</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{c.deadline}</p>
              </div>
              <div className="hidden md:block">
                <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">Submitted</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink-900 dark:text-ink-50">{c.submitted}</p>
              </div>
              <div className="relative justify-self-end">
                <button
                  aria-label="Campaign options"
                  aria-haspopup="menu"
                  aria-expanded={openMenu === i}
                  onClick={() => setOpenMenu(openMenu === i ? null : i)}
                  className="cursor-pointer rounded-lg p-2 text-ink-400 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/5 hover:text-ink-700 dark:hover:text-ink-200"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <circle cx="12" cy="5" r="1.8" />
                    <circle cx="12" cy="12" r="1.8" />
                    <circle cx="12" cy="19" r="1.8" />
                  </svg>
                </button>
                {openMenu === i && (
                  <div
                    role="menu"
                    className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 shadow-lg"
                  >
                    {c.rawStatus && c.rawStatus !== "closed" && c.id ? (
                      <button
                        role="menuitem"
                        disabled={closingId === c.id}
                        onClick={() => c.id && closeCampaign(c.id)}
                        className="block w-full px-4 py-2.5 text-left text-[14px] font-medium text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5 disabled:opacity-50"
                      >
                        {closingId === c.id ? "Closing…" : "Close campaign"}
                      </button>
                    ) : (
                      <span className="block px-4 py-2.5 text-[13px] text-ink-400 dark:text-ink-300">
                        No actions available
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="col-span-2 flex flex-wrap gap-x-6 gap-y-1 text-[13px] md:hidden">
                <span className="text-ink-500 dark:text-ink-300">
                  Budget <span className="font-bold text-ink-900 dark:text-ink-50">{c.budget}</span>
                </span>
                <span className="text-ink-500 dark:text-ink-300">
                  Status <span className="font-bold text-ink-900 dark:text-ink-50">{c.status}</span>
                </span>
                <span className="text-ink-500 dark:text-ink-300">
                  Deadline <span className="font-bold text-ink-900 dark:text-ink-50">{c.deadline}</span>
                </span>
                <span className="text-ink-500 dark:text-ink-300">
                  Submitted <span className="font-bold text-ink-900 dark:text-ink-50">{c.submitted}</span>
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
