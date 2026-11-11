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

// Billing History rows come from the real GET /payments/my endpoint.
// Payment records carry no per-payment plan and no receipt/invoice URL,
// so the Plan column shows the user's current plan name (Figma shows the
// plan name repeated per row) and no per-row download icon is rendered.
type Payment = {
  id: string;
  dealId: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status) {
    case "succeeded":
      return "success";
    case "pending":
    case "requires_action":
      return "warning";
    case "failed":
    case "canceled":
    case "refunded":
      return "danger";
    default:
      return "neutral";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "succeeded":
      return "Paid";
    case "pending":
      return "Pending";
    case "requires_action":
      return "Action needed";
    case "failed":
      return "Failed";
    case "canceled":
      return "Canceled";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

function formatBillingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatBillingAmount(p: Payment): string {
  return `$${(p.amountCents / 100).toFixed(2)}`;
}

function billingHistoryCsv(planName: string, payments: Payment[]): string {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = ["Plan,Date,Amount,Status"];
  for (const p of payments) {
    lines.push(
      [
        esc(planName),
        esc(formatBillingDate(p.createdAt)),
        esc(`${formatBillingAmount(p)} ${(p.currency || "usd").toUpperCase()}`),
        esc(statusLabel(p.status)),
      ].join(",")
    );
  }
  return lines.join("\n");
}

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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
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

  useEffect(() => {
    api
      .myPayments()
      .then((pays) => {
        setPayments(Array.isArray(pays) ? pays : []);
      })
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
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
  const planName = plan?.name ?? "—";

  const exportBillingHistory = () => {
    const csv = billingHistoryCsv(planName, payments);
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "billing-history.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
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
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
            Subscription
          </h1>
          <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
            Manage your plan, billing details, and subscription preferences.
          </p>
        </div>

        {loading ? (
          <p className="text-[15px] text-ink-500 dark:text-ink-300">Loading subscription...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <Tag tone="brand">{isPaidPlan ? "Paid" : "Free"}</Tag>
              <div className="mt-4 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-ink-900 dark:text-ink-50">
                  {plan?.name ?? "No active plan"}
                </p>
                <p className="text-xl font-bold text-brand dark:text-brand-200">{price}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                {isPaidPlan
                  ? "You are on a paid plan — lower transaction commissions apply."
                  : "You are on the free plan. Upgrade for lower commissions and extra visibility."}
              </p>
              <ul className="mt-5 space-y-2.5">
                {(plan?.benefits ?? []).map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-ink-700 dark:text-ink-200"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-brand dark:text-brand-200"
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
                  <p className="text-center text-sm font-semibold text-ink-500 dark:text-ink-300">
                    Cancels at the end of the billing period.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    disabled={cancelling || !plan || plan.priceCentsMonthly === 0}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-danger bg-white dark:bg-ink-900 px-6 text-[15px] font-semibold text-danger dark:text-danger-bright transition-colors hover:bg-danger-bg dark:hover:bg-danger/15 disabled:opacity-40"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Subscription"}
                  </button>
                )}
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">Plan Details</h2>
                <dl className="mt-4 space-y-3 text-[15px]">
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500 dark:text-ink-300">Billing Cycle:</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-50">Monthly</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500 dark:text-ink-300">Next Billing Date:</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-50">
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
                    <dt className="text-ink-500 dark:text-ink-300">Amount:</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-50">{price}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-500 dark:text-ink-300">Payment Method:</dt>
                    <dd className="font-semibold text-ink-900 dark:text-ink-50">
                      Stripe test mode
                    </dd>
                  </div>
                </dl>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">
                  Transaction Commission
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-500 dark:text-ink-300">
                  {isPaidPlan
                    ? "As a paid subscriber you pay the reduced commission rate on completed transactions."
                    : "Free plan commission applies. Upgrade to lower your transaction fees."}
                </p>
                <Link
                  href="/pricing"
                  className="mt-4 inline-flex text-sm font-semibold text-brand dark:text-brand-200 hover:underline"
                >
                  View commission details
                </Link>
              </Card>
            </div>
          </div>
        )}

        {!loading && (
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">
                Billing History
              </h2>
              <button
                type="button"
                onClick={exportBillingHistory}
                className="inline-flex h-10 items-center rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 text-[15px] font-semibold text-ink-700 dark:text-ink-200 transition-colors hover:border-brand hover:text-brand dark:hover:text-brand-200"
              >
                Export
              </button>
            </div>
            {paymentsLoading ? (
              <p className="mt-4 text-[15px] text-ink-500 dark:text-ink-300">
                Loading billing history...
              </p>
            ) : payments.length === 0 ? (
              // Empty state still renders the Plan/Date/Amount/Status
              // column headers, so the Figma columns are verifiable even
              // before any payment exists (previously the headers only
              // appeared once a payment row existed).
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-800 text-sm text-ink-500 dark:text-ink-300">
                      <th className="pb-3 pr-4 font-semibold">Plan</th>
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                </table>
                <p className="mt-4 text-[15px] text-ink-500 dark:text-ink-300">
                  No billing activity yet.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[15px]">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-800 text-sm text-ink-500 dark:text-ink-300">
                      <th className="pb-3 pr-4 font-semibold">Plan</th>
                      <th className="pb-3 pr-4 font-semibold">Date</th>
                      <th className="pb-3 pr-4 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b border-ink-50 last:border-0"
                      >
                        <td className="py-3 pr-4 font-semibold text-ink-900 dark:text-ink-50">
                          {planName}
                        </td>
                        <td className="py-3 pr-4 text-ink-700 dark:text-ink-200">
                          {formatBillingDate(p.createdAt)}
                        </td>
                        <td className="py-3 pr-4 font-semibold text-ink-900 dark:text-ink-50">
                          {formatBillingAmount(p)}{" "}
                          <span className="font-normal text-ink-500 dark:text-ink-300">
                            {(p.currency || "usd").toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3">
                          <Tag tone={statusTone(p.status)}>
                            {statusLabel(p.status)}
                          </Tag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
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
