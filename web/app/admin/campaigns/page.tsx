"use client";

import { useEffect, useState } from "react";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { api } from "@/lib/api";

const STATUSES = ["draft", "open", "closed", "completed"];

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .adminCampaigns({
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      })
      .then((r) => {
        setCampaigns(r.campaigns || []);
        setTotal(r.total || 0);
      })
      .catch(() => {
        setCampaigns([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setCampaignStatus = async (id: string, next: string) => {
    setBusy(id);
    setError("");
    try {
      await api.adminSetCampaignStatus(id, next);
      load();
    } catch {
      setError("Could not update the campaign status.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    setBusy(id);
    setError("");
    try {
      await api.adminDeleteCampaign(id);
      load();
    } catch {
      setError("Could not delete the campaign.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <WelcomeHeader
        title="Campaigns"
        subtitle={`${total} campaigns. Close abusive listings or remove them entirely.`}
      />
      <Card className="mt-6 p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search title or description"
            className="w-64 rounded-xl border border-ink-200 px-4 py-2.5 text-[14px] outline-none focus:border-brand"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-[14px]"
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button size="md" variant="outline" onClick={load}>
            Filter
          </Button>
        </div>
        {error && (
          <p className="mb-4 text-[14px] font-medium text-red-700">{error}</p>
        )}
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[14px] text-ink-500">No campaigns found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink-100 text-[12px] uppercase text-ink-400">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Brand</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Applications</th>
                  <th className="py-3 pr-4">Created</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {campaigns.map((c: any) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">
                      {c.title}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {c.brand?.email || "–"}
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={c.status}
                        disabled={busy === c.id}
                        onChange={(e) =>
                          setCampaignStatus(c.id, e.target.value)
                        }
                        className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-[14px] capitalize"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {c.applicationCount ?? 0}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3">
                      <Button
                        size="sm"
                        variant="danger-outline"
                        disabled={busy === c.id}
                        onClick={() => setPendingDelete({ id: c.id, title: c.title })}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {pendingDelete && (
        <ConfirmDialog
          title="Delete campaign"
          message={`Delete the campaign "${pendingDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          busy={busy === pendingDelete.id}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            await remove(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}
