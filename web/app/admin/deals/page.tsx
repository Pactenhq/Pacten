"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

const STATUSES = [
  "proposed",
  "negotiating",
  "agreed",
  "active",
  "submitted",
  "approved",
  "completed",
  "cancelled",
  "disputed",
];

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = () => {
    setLoading(true);
    api
      .adminDeals({
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      })
      .then((r) => {
        setDeals(r.deals || []);
        setTotal(r.total || 0);
      })
      .catch(() => {
        setDeals([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900">
        Deals
      </h1>
      <p className="mt-1 text-[15px] text-ink-500">
        {total} deals. Deal and payment visibility across the marketplace.
      </p>
      <Card className="mt-6 p-6">
        <div className="mb-4 flex flex-wrap gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search deal title"
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
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : deals.length === 0 ? (
          <p className="text-[14px] text-ink-500">No deals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink-100 text-[12px] uppercase text-ink-400">
                  <th className="py-3 pr-4">Title</th>
                  <th className="py-3 pr-4">Brand</th>
                  <th className="py-3 pr-4">Creator</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Budget</th>
                  <th className="py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {deals.map((d: any) => (
                  <tr key={d.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">
                      {d.title}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {d.brand?.email || "–"}
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {d.creator?.email || "–"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-ink-50 px-3 py-1 text-[12px] font-semibold capitalize text-ink-700">
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-ink-700">
                      {d.agreedBudget || "–"}
                    </td>
                    <td className="py-3 text-ink-700">
                      {new Date(d.createdAt).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
