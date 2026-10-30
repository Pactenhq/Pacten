"use client";

import { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [outcome, setOutcome] = useState<Record<string, "resolved" | "rejected">>({});
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .adminDisputes(filter || undefined)
      .then((d) => setDisputes(Array.isArray(d) ? d : []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const resolve = async (id: string) => {
    const text = (resolution[id] || "").trim();
    if (text.length < 5) {
      setMsg("Resolution notes are required (min 5 characters).");
      return;
    }
    setBusy(id);
    setMsg(null);
    try {
      await api.resolveDispute(id, outcome[id] || "resolved", text);
      setResolution({ ...resolution, [id]: "" });
      load();
    } catch (e: any) {
      setMsg(e?.message || "Could not resolve dispute.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <WelcomeHeader
        title="Disputes"
        subtitle="Review and resolve disputes filed on deals."
      />
      <div className="mt-4 flex gap-2">
        {["", "open", "under_review", "resolved", "rejected"].map((f) => (
          <button
            key={f || "all"}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-[13px] font-semibold capitalize ${
              filter === f
                ? "bg-brand text-white"
                : "bg-white text-ink-600 border border-ink-200"
            }`}
          >
            {f === "" ? "All" : f.replace(/_/g, " ")}
          </button>
        ))}
      </div>
      {msg && (
        <p className="mt-3 text-[14px] font-medium text-red-600">{msg}</p>
      )}
      <Card className="mt-6 p-6">
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : disputes.length === 0 ? (
          <p className="text-[14px] text-ink-500">No disputes in this state.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {disputes.map((d: any) => (
              <li key={d.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-bold capitalize text-ink-900">
                      {d.reason.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-500">
                      Filed {new Date(d.createdAt).toLocaleDateString()} · Deal{" "}
                      {d.dealId.slice(0, 8)}
                    </p>
                    <p className="mt-2 max-w-2xl text-[14px] text-ink-700">
                      {d.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-semibold capitalize text-ink-700">
                    {d.status.replace(/_/g, " ")}
                  </span>
                </div>
                {d.resolution && (
                  <p className="mt-2 rounded-xl bg-brand-50/60 p-3 text-[14px] text-ink-900">
                    Resolution: {d.resolution}
                  </p>
                )}
                {(d.status === "open" || d.status === "under_review") && (
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={outcome[d.id] || "resolved"}
                      onChange={(e) =>
                        setOutcome({
                          ...outcome,
                          [d.id]: e.target.value as "resolved" | "rejected",
                        })
                      }
                      className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-[14px]"
                    >
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <input
                      value={resolution[d.id] || ""}
                      onChange={(e) =>
                        setResolution({ ...resolution, [d.id]: e.target.value })
                      }
                      placeholder="Resolution notes"
                      className="min-w-[200px] flex-1 rounded-xl border border-ink-200 px-4 py-2 text-[14px] outline-none focus:border-brand"
                    />
                    <Button
                      size="sm"
                      disabled={busy === d.id}
                      onClick={() => resolve(d.id)}
                    >
                      {busy === d.id ? "Saving…" : "Resolve"}
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
