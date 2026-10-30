"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  SectionCard,
  StatCard,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
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

  const cards: {
    label: string;
    value: string | number;
    href?: string;
    icon: string;
  }[] = [
    {
      label: "Users",
      value: stats?.users ?? "–",
      href: "/admin/users",
      icon: "people",
    },
    {
      label: "Deals",
      value: stats?.deals ?? "–",
      href: "/admin/deals",
      icon: "moneybag",
    },
    {
      label: "Open disputes",
      value: stats?.openDisputes ?? "–",
      href: "/admin/disputes",
      icon: "clipboard",
    },
    {
      label: "Pending payouts",
      value: stats?.pendingPayouts ?? "–",
      href: "/admin/payouts",
      icon: "gift",
    },
  ];

  return (
    <div>
      <WelcomeHeader
        title="Overview"
        subtitle="Marketplace at a glance."
      />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <StatCard
              value={loading ? "…" : String(c.value)}
              label={c.label}
              delta=""
              icon={c.icon}
            />
          );
          return c.href ? (
            <Link key={c.label} href={c.href}>
              {inner}
            </Link>
          ) : (
            <div key={c.label}>{inner}</div>
          );
        })}
      </div>
      {stats?.usersByRole && (
        <SectionCard title="Users by role" className="mt-6">
          <ul className="divide-y divide-ink-100">
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
        </SectionCard>
      )}
    </div>
  );
}
