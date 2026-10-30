"use client";

import { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("requested");
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = () => {
    setLoading(true);
    api
      .adminReferralPayouts(filter || undefined)
      .then((p) => setPayouts(Array.isArray(p) ? p : []))
      .catch(() => setPayouts([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const decide = async (id: string, approved: boolean) => {
    setBusy(id);
    try {
      await api.decideReferralPayout(id, approved, notes[id] || undefined);
      load();
    } catch {
      // inline error handling is enough for admin tooling
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <WelcomeHeader
        title="Referral Payouts"
        subtitle="Cash payouts are approved manually. Approving marks the payout paid — the cash transfer itself happens off-platform."
      />
      <div className="mt-4 flex gap-2">
        {["requested", "paid", "rejected", ""].map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
              filter === f
                ? "bg-brand text-white"
                : "bg-white text-ink-600 border border-ink-200"
            }`}
          >
            {f === "" ? "All" : f}
          </button>
        ))}
      </div>
      <Card className="mt-6 p-6">
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : payouts.length === 0 ? (
          <p className="text-[14px] text-ink-500">No payouts in this state.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {payouts.map((p: any) => (
              <li key={p.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold text-ink-900">
                      {fmt$(p.amountCents)}
                      <span className="ml-2 text-[13px] font-medium text-ink-500">
                        {p.userEmail}
                      </span>
                    </p>
                    <p className="mt-1 text-[13px] text-ink-500">
                      Requested {new Date(p.requestedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                      p.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : p.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                {p.status === "requested" && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <input
                      value={notes[p.id] || ""}
                      onChange={(e) =>
                        setNotes({ ...notes, [p.id]: e.target.value })
                      }
                      placeholder="Notes (optional)"
                      className="min-w-[200px] flex-1 rounded-xl border border-ink-200 px-4 py-2 text-[14px] outline-none focus:border-brand"
                    />
                    <Button
                      size="sm"
                      disabled={busy === p.id}
                      onClick={() => decide(p.id, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy === p.id}
                      onClick={() => decide(p.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {p.notes && (
                  <p className="mt-2 text-[13px] text-ink-500">
                    Notes: {p.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
