"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

// NOTE: No Figma design exists for Deal Detail — basic functional page.
const NEXT_ACTIONS: Record<string, string[]> = {
  proposed: ["negotiating", "cancelled"],
  negotiating: ["agreed", "cancelled"],
  agreed: ["active", "cancelled"],
  active: ["completed", "disputed", "cancelled"],
  completed: [],
  cancelled: [],
  disputed: ["active", "cancelled"],
};

export default function DealDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api
      .dealDetail(id)
      .then((data) => setDeal(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const updated = await api.updateDealStatus(id, status);
      setDeal(updated);
    } catch {
      alert("Failed to update deal status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell
        nav={nav}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        <p className="text-gray-500">Loading deal...</p>
      </DashboardShell>
    );
  }

  if (!deal) {
    return (
      <DashboardShell
        nav={nav}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        <p className="text-gray-500">Deal not found.</p>
        <Link href="/dashboard/deals" className="text-blue-600 hover:underline">
          Back to deals
        </Link>
      </DashboardShell>
    );
  }

  const actions = NEXT_ACTIONS[deal.status] ?? [];

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeHeader title={deal.title} subtitle={`Status: ${deal.status}`} />
          <Link href="/dashboard/deals">
            <Button variant="outline">Back to Deals</Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Deal Terms</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Description</dt>
                <dd className="font-medium">{deal.description ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Agreed Budget</dt>
                <dd className="font-medium">{deal.agreedBudget ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Deadline</dt>
                <dd className="font-medium">{deal.deadline ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Deliverables</dt>
                <dd className="font-medium">{deal.deliverables ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Terms</dt>
                <dd className="font-medium">{deal.terms ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Parties</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500">Brand</dt>
                <dd className="font-medium">
                  {deal.brand?.email ?? deal.brand?.name ?? "-"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Creator</dt>
                <dd className="font-medium">
                  {deal.creator?.email ?? deal.creator?.name ?? "-"}
                </dd>
              </div>
            </dl>

            {actions.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700">
                  Update Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action}
                      onClick={() => updateStatus(action)}
                      disabled={updating}
                      variant={action === "cancelled" ? "outline" : "primary"}
                      size="sm"
                    >
                      Mark as {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
