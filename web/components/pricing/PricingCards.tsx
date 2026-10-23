"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

export type PlanRole = "brand" | "creator" | "professional";

type Plan = {
  id: string;
  role: string;
  code: string;
  name: string;
  tier: string;
  priceCentsMonthly: number;
  currency: string;
  benefits: string[];
};

function PlanIcon({ highlighted, index }: { highlighted?: boolean; index: number }) {
  const kinds = ["diamond", "briefcase", "gift"] as const;
  const icon = kinds[index % kinds.length];
  const paths =
    icon === "diamond" ? (
      <path
        d="M8 2.5 14.5 6 8 13.5 1.5 6 8 2.5Z M1.5 6h13 M5.5 3.8 8 13.5 10.5 3.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    ) : icon === "briefcase" ? (
      <>
        <rect x="2" y="5.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M5.5 5.5V4.2A1.2 1.2 0 0 1 6.7 3h2.6a1.2 1.2 0 0 1 1.2 1.2v1.3M2 9h12" stroke="currentColor" strokeWidth="1.6" />
      </>
    ) : (
      <>
        <rect x="2" y="5" width="12" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <path d="M3 8.5V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5M8 5v9M8 5S5.5 5 4.5 4A1.3 1.3 0 0 1 6.6 2.6C7.5 3.2 8 5 8 5Zm0 0s2.5 0 3.5-1A1.3 1.3 0 0 0 9.4 2.6C8.5 3.2 8 5 8 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    );
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[52px] w-[52px] items-center justify-center rounded-2xl",
        highlighted ? "bg-white/15 text-white" : "bg-brand-50 text-brand"
      )}
    >
      <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
        {paths}
      </svg>
    </span>
  );
}

function CheckItem({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
        className={cn("mt-0.5 shrink-0", light ? "text-white" : "text-brand")}
      >
        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="m6.8 10.2 2.2 2.2 4.2-4.8"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={cn("text-[15px]", light ? "text-white/90" : "text-ink-700")}>
        {children}
      </span>
    </li>
  );
}

const fmtPrice = (p: Plan) =>
  p.priceCentsMonthly === 0
    ? "$0"
    : `$${(p.priceCentsMonthly / 100).toFixed(p.priceCentsMonthly % 100 === 0 ? 0 : 2)}`;

// Pricing plan cards — same design as before, now driven by the real
// subscription plans API (M4). Prices/benefits are configurable server-side.
export function PricingCards({ role }: { role: PlanRole }) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .subscriptionPlans(role)
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) {
    return <p className="text-center text-[15px] text-ink-500">Loading plans...</p>;
  }

  if (plans.length === 0) {
    return (
      <p className="text-center text-[15px] text-ink-500">
        Plans are unavailable right now. Please try again later.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-5",
        plans.length >= 3 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"
      )}
    >
      {plans.map((plan, i) => {
        // Only the Pro tier is highlighted / badged — previously EVERY
        // paid plan rendered a "Most popular" badge at the same time.
        const highlighted =
          (plan as any).tier === "pro" ||
          (plan.priceCentsMonthly === 2900 && !(plan as any).tier);
        return (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6",
              highlighted
                ? "border-brand-dark bg-brand-dark text-white shadow-lift"
                : "border-ink-200 bg-white"
            )}
          >
            {highlighted && (
              <span className="absolute -top-3.5 right-5 inline-flex h-7 items-center rounded-full bg-white px-3 text-xs font-semibold text-brand-dark">
                Most popular
              </span>
            )}
            <PlanIcon highlighted={highlighted} index={i} />
            <p
              className={cn(
                "mt-5 text-2xl font-extrabold",
                highlighted ? "text-white" : "text-ink-900"
              )}
            >
              {plan.name}
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-bold",
                highlighted ? "text-white" : "text-brand"
              )}
            >
              {fmtPrice(plan)}{plan.priceCentsMonthly > 0 && <span className="text-sm font-semibold">/month</span>}
            </p>
            <hr
              className={cn(
                "my-5 border-0 border-t",
                highlighted ? "border-white/20" : "border-ink-100"
              )}
            />
            <ul className="flex flex-col gap-3">
              {(plan.benefits ?? []).map((f) => (
                <CheckItem key={f} light={highlighted}>
                  {f}
                </CheckItem>
              ))}
            </ul>
            <Link href={`/pricing/confirm?plan=${plan.id}`} className="mt-6 block">
              {highlighted ? (
                <Button className="w-full bg-white text-brand-dark hover:bg-brand-50">
                  {plan.priceCentsMonthly === 0 ? "Start Free" : "Choose Plan"}
                </Button>
              ) : (
                <Button variant="outline" className="w-full">
                  {plan.priceCentsMonthly === 0 ? "Start Free" : "Choose Plan"}
                </Button>
              )}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
