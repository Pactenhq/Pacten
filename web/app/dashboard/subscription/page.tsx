import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import {
  billingHistory,
  subscriptionPlan,
} from "@/lib/mock-billing";
import { dashboardUser, brandNav } from "@/lib/mock";

// desktop +
// "mob Subscription" (423:66356) mobile. All copy verbatim.
export default function SubscriptionPage() {
  const plan = subscriptionPlan;

  return (
    <DashboardShell
      nav={brandNav}
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <Tag tone="brand">{plan.tag}</Tag>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-ink-900">{plan.name}</p>
              <p className="text-xl font-bold text-brand">{plan.price}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {plan.blurb}
            </p>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((f) => (
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
              <Link
                href="/dashboard/subscription/cancel"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-danger bg-white px-6 text-[15px] font-semibold text-danger transition-colors hover:bg-danger-bg"
              >
                Cancel Subscription
              </Link>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-ink-900">Plan Details</h2>
              <dl className="mt-4 space-y-3 text-[15px]">
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Billing Cycle:</dt>
                  <dd className="font-semibold text-ink-900">
                    {plan.billingCycle}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Next Billing Date:</dt>
                  <dd className="font-semibold text-ink-900">
                    {plan.nextBillingDate}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Amount:</dt>
                  <dd className="font-semibold text-ink-900">{plan.amount}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-ink-500">Payment Method:</dt>
                  <dd className="flex items-center gap-3">
                    <span className="font-semibold text-ink-900">
                      &bull;&bull;&bull;&bull; {plan.card.last4}
                    </span>
                    <button
                      type="button"
                      className="inline-flex h-7 items-center gap-1 rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand hover:bg-brand-100"
                    >
                      Edit
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-bold text-ink-900">Payment Method</h2>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink-900">
                    {plan.card.brand}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    &bull;&bull;&bull;&bull; {plan.card.last4} &middot; Expires{" "}
                    {plan.card.expiry}
                  </p>
                </div>
                {plan.card.isDefault && (
                  <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand">
                    Default
                  </span>
                )}
              </div>
              <button
                type="button"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-ink-300 text-[15px] font-medium text-ink-400 transition-colors hover:border-brand hover:text-brand"
              >
                + Add Payment Method
              </button>
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink-900">Billing History</h2>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <div className="-mx-6 mt-4 overflow-x-auto px-6">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink-100 text-[13px] text-ink-400">
                  <th className="pb-3 pr-4 font-medium">Plan</th>
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {billingHistory.map((row) => (
                  <tr
                    key={row.date}
                    className="border-b border-ink-100 last:border-0"
                  >
                    <td className="py-4 pr-4 font-semibold text-ink-900">
                      {row.plan}
                    </td>
                    <td className="py-4 pr-4 text-ink-700">{row.date}</td>
                    <td className="py-4 pr-4 text-ink-700">{row.amount}</td>
                    <td className="py-4">
                      <span className="inline-flex h-7 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
