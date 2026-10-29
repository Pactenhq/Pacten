"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Tag } from "@/components/ui/Tag";
import { dashboardUser, brandNav, creatorNav, professionalNav } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

// desktop + "mob Subscription" (423:66356) mobile — design unchanged.
// M4: plan, billing details and cancel are now driven by the real
// subscriptions API instead of mock data.

type Plan = {
  id: string;
  name: string;
  tier: string;
  priceCentsMonthly: number;
  currency: string;
  benefits: string[];
};

export default function SubscriptionPage() {
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;

  const [plan, setPlan] = useState<Plan | null>(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    api
      .mySubscription()
      .then((data) => {
        setPlan(data?.plan ?? null);
        setCancelAtPeriodEnd(!!data?.subscription?.cancelAtPeriodEnd);
        setPeriodEnd(data?.subscription?.currentPeriodEnd ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cancel = async () => {
    setCancelling(true);
    try {
      const sub = await api.cancelSubscription();
      setCancelAtPeriodEnd(!!sub?.cancelAtPeriodEnd);
    } catch (e: any) {
      alert(e?.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const isPaidPlan = !!plan && plan.priceCentsMonthly > 0;
  const price =
    plan == null
      ? "-"
      : plan.priceCentsMonthly === 0
        ? "$0"
        : `$${(plan.priceCentsMonthly / 100).toFixed(2)}/mo`;

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
            Subscription
          </h1>
          <p className="mt-2 text-[15px] text-ink-500">
            Manage your plan, billing details, and subscription preferences.
          </p>
        </div>

        {loading ? (
          <p className="text-[15px] text-ink-500">Loading subscription...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <Tag tone="brand">{isPaidPlan ? "Paid" : "Free"}</Tag>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-ink-900">
                  {plan?.name ?? "No active plan"}
                </p>
                <p className="text-xl font-bold text-brand">{price}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {isPaidPlan
                  ? "You are on a paid plan — lower transaction commissions apply."
                  : "You are on the free plan. Upgrade for lower commissions and extra visibility."}
              </p>
              <ul className="mt-5 space-y-2.5">
                {(plan?.benefits ?? []).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink-700"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-brand"
                    >
                      <path
                        d="m3.5 8.5 3 3 6-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-3">
                <Link href="/pricing">
                  <Button className="w-full">Upgrade Plan</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="w-full">
                    Change Plan
                  </Button>
                </Link>
                {cancelAtPeriodEnd ? (
                  <p className="text-center text-sm font-semibold text-ink-500">
                    Cancels at the end of the billing period.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    disabled={cancelling || !plan || plan.priceCentsMonthly === 0}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-danger bg-white px-6 text-[15px] font-semibold text-danger transition-colors hover:bg-danger-bg disabled:opacity-40"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900">Plan Details</h2>
                <dl className="mt-4 space-y-3 text-[15px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Billing Cycle:</dt>
                    <dd className="font-semibold text-ink-900">Monthly</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Next Billing Date:</dt>
                    <dd className="font-semibold text-ink-900">
                      {periodEnd
                        ? new Date(periodEnd).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "-"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Amount:</dt>
                    <dd className="font-semibold text-ink-900">{price}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500">Payment Method:</dt>
                    <dd className="font-semibold text-ink-900">
                      Stripe test mode
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900">
                  Transaction Commission
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  {isPaidPlan
                    ? "As a paid subscriber you pay the reduced commission rate on completed transactions."
                    : "Free plan commission applies. Upgrade to lower your transaction fees."}
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex text-sm font-semibold text-brand hover:underline"
                >
                  View commission details
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>
      {confirmCancel && (
        <ConfirmDialog
          title="Cancel subscription"
          message="Cancel your subscription at the end of the billing period?"
          confirmLabel="Cancel subscription"
          busy={cancelling}
          onCancel={() => setConfirmCancel(false)}
          onConfirm={async () => {
            await cancel();
            setConfirmCancel(false);
          }}
        />
      )}
    </DashboardShell>
  );
}
