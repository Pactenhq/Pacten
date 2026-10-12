"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { dashboardUser, brandNav } from "@/lib/mock";
import { subscriptionPlan } from "@/lib/mock-billing";
import { cn } from "@/lib/cn";

//  "Back to Subscription"
// outlined button, "Why are you cancelling?" card with right-aligned
// checkboxes, two light-blue summary cards (plan + features) on the right,
// and a full-width "Want to keep your plan?" card below with a blue
// "Change Plan" button. All copy verbatim.
const cancelReasons = [
  "Too expensive",
  "I don't use it enough",
  "Missing features I need",
  "I'm switching to another platform",
  "I'm not getting enough value",
  "Other",
];

export default function CancelSubscriptionPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const plan = subscriptionPlan;

  const toggle = (reason: string) =>
    setSelected((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );

  return (
    <DashboardShell
      nav={brandNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <div>
          <Link href="/dashboard/subscription">
            <Button variant="outline" size="sm" className="gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Subscription
            </Button>
          </Link>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink-900">
            Cancel Subscription
          </h1>
          <p className="mt-2 max-w-[703px] text-[15px] text-ink-500">
            We&rsquo;re sorry to see you go. Before you cancel, please review
            what happens to your plan and access.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-ink-900">
                Why are you cancelling?
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Your feedback helps us improve.
              </p>
              <div className="mt-5 flex flex-col">
                {cancelReasons.map((reason) => {
                  const checked = selected.includes(reason);
                  return (
                    <label
                      key={reason}
                      className="flex cursor-pointer items-center justify-between gap-3 border-b border-ink-100 py-3.5 text-[15px] text-ink-700 last:border-0"
                    >
                      {reason}
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                          checked
                            ? "border-brand bg-brand text-white"
                            : "border-ink-300 bg-white"
                        )}
                      >
                        {checked && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                              d="m2.5 6.2 2.6 2.6 4.4-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggle(reason)}
                      />
                    </label>
                  );
                })}
              </div>
              <p className="mt-6 text-[15px] font-medium text-ink-900">
                Tell us more (optional)
              </p>
              <textarea
                rows={4}
                placeholder="Share your feedback..."
                className="mt-2 w-full resize-none rounded-xl border border-ink-300 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </Card>

            <Card className="bg-brand-50/60 p-6">
              <h2 className="text-lg font-bold text-ink-900">
                Want to keep your plan?
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Switch to a different plan that better fits your needs.
              </p>
              <div className="mt-5">
                <Link href="/pricing">
                  <Button className="w-full sm:w-auto">Change Plan</Button>
                </Link>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-brand-50/60 p-6">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <rect x="3" y="8" width="18" height="4" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M5 12v8h14v-8M12 8v12M12 8s-4.5 0-5.5-2C5.7 4.5 7 3 8.5 3.5 10 4 12 8 12 8Zm0 0s4.5 0 5.5-2c.8-1.5-.5-3-2-2.5C14 4 12 8 12 8Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-semibold text-brand">
                  {plan.tag}
                </span>
              </div>
              <p className="mt-4 text-3xl font-extrabold text-ink-900">
                {plan.name}
              </p>
              <p className="mt-1 text-lg font-bold text-brand">{plan.price}</p>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                {plan.blurb}
              </p>
            </div>

            <div className="rounded-2xl bg-brand-50/60 p-6">
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-3 text-[15px] text-ink-700"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-brand"
                    >
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
                      <path
                        d="m6.5 10.2 2.4 2.4 4.6-5.2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
