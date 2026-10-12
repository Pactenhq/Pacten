import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { pricingTiers, type PricingTier } from "@/lib/mock";
import { cn } from "@/lib/cn";

function PlanIcon({ icon, light }: { icon: PricingTier["icon"]; light?: boolean }) {
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
        light ? "bg-white/15 text-white" : "bg-brand-50 text-brand"
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

// Pricing plan cards, rebuilt from the design "pricing" page (390:41785).
// Four plans: Free / Pro / Elite (dark highlighted) / Plus. Copy verbatim.
export function PricingCards() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {pricingTiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "relative flex flex-col rounded-2xl border p-6",
            tier.highlighted
              ? "border-brand-dark bg-brand-dark text-white shadow-lift"
              : "border-ink-200 bg-white"
          )}
        >
          {tier.badge && (
            <span
              className={cn(
                "absolute -top-3.5 right-5 inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
                tier.highlighted
                  ? "bg-white text-brand-dark"
                  : "bg-brand-dark text-white"
              )}
            >
              {tier.badge}
            </span>
          )}
          <PlanIcon icon={tier.icon} light={tier.highlighted} />
          <p
            className={cn(
              "mt-5 text-2xl font-extrabold",
              tier.highlighted ? "text-white" : "text-ink-900"
            )}
          >
            {tier.name}
          </p>
          <p
            className={cn(
              "mt-1 text-lg font-bold",
              tier.highlighted ? "text-white" : "text-brand"
            )}
          >
            {tier.price}
          </p>
          {tier.commission && (
            <span
              className={cn(
                "mt-3 inline-flex h-7 w-fit items-center rounded-full px-3 text-xs font-semibold",
                tier.highlighted
                  ? "bg-white/15 text-white"
                  : "bg-brand-50 text-brand"
              )}
            >
              {tier.commission}
            </span>
          )}
          <hr
            className={cn(
              "my-5 border-0 border-t",
              tier.highlighted ? "border-white/20" : "border-ink-100"
            )}
          />
          {tier.featurePrefix && (
            <p
              className={cn(
                "mb-3 text-[15px]",
                tier.highlighted ? "text-white/80" : "text-ink-500"
              )}
            >
              {tier.featurePrefix}
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {tier.features.map((f) => (
              <CheckItem key={f} light={tier.highlighted}>
                {f}
              </CheckItem>
            ))}
          </ul>
          <Link href="/pricing/confirm" className="mt-6 block">
            {tier.highlighted ? (
              <Button className="w-full bg-white text-brand-dark hover:bg-brand-50">
                {tier.cta}
              </Button>
            ) : (
              <Button variant="outline" className="w-full">
                {tier.cta}
              </Button>
            )}
          </Link>
        </div>
      ))}
    </div>
  );
}
