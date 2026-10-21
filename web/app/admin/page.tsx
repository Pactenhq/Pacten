"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .adminStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Users", value: stats?.users ?? "–", href: "/admin/users" },
    { label: "Deals", value: stats?.deals ?? "–", href: "/admin/users" },
    {
      label: "Open disputes",
      value: stats?.openDisputes ?? "–",
      href: "/admin/disputes",
    },
    {
      label: "Pending payouts",
      value: stats?.pendingPayouts ?? "–",
      href: "/admin/payouts",
    },
  ];

  return (
    <div>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900">
        Overview
      </h1>
      <p className="mt-1 text-[15px] text-ink-500">
        Marketplace at a glance.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="p-6 transition hover:shadow-md">
              <p className="text-[13px] font-semibold text-ink-500">{c.label}</p>
              <p className="mt-1 text-[32px] font-extrabold text-ink-900">
                {loading ? "…" : c.value}
              </p>
            </Card>
          </Link>
        ))}
      </div>
      {stats?.usersByRole && (
        <Card className="mt-6 p-6">
          <p className="text-[15px] font-bold text-ink-900">Users by role</p>
          <ul className="mt-3 divide-y divide-ink-100">
            {stats.usersByRole.map((r: any) => (
              <li
                key={r.role}
                className="flex items-center justify-between py-2 text-[14px]"
              >
                <span className="font-semibold capitalize text-ink-900">
                  {r.role}
                </span>
                <span className="text-ink-500">{r.count}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
