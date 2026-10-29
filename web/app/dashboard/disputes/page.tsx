"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

export default function DisputesPage() {
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myDisputes()
      .then((d) => setDisputes(Array.isArray(d) ? d : []))
      .catch(() => setDisputes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900">
          Disputes
        </h1>
        <p className="mt-1 text-[15px] text-ink-500">
          Disputes on your deals. Our team reviews each one.
        </p>
      </div>
      <Card className="mt-6 p-6">
        {loading ? (
          <p className="text-[14px] text-ink-500">Loading…</p>
        ) : disputes.length === 0 ? (
          <p className="text-[14px] text-ink-500">
            No disputes. You can file one from any deal page if an issue
            comes up.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {disputes.map((d: any) => (
              <li key={d.id} className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[15px] font-bold text-ink-900 capitalize">
                      {d.reason.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-[13px] text-ink-500">
                      Filed {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-semibold capitalize text-ink-700">
                      {d.status.replace(/_/g, " ")}
                    </span>
                    <Link
                      href={`/dashboard/disputes/${d.id}`}
                      className="text-[14px] font-semibold text-brand hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </DashboardShell>
  );
}
