import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/Button";
import { dashboardUser, brandNav } from "@/lib/mock";

// desktop +
// "mob Cancel Subscription compled" (426:67623) mobile.
// Button labels inside unexpanded component instances were not recoverable
// from cache (APPROX): "Resubscribe" / "Go to Dashboard".
export default function SubscriptionCancelledPage() {
  return (
    <DashboardShell
      nav={brandNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="mx-auto flex max-w-[568px] flex-col items-center py-16 text-center lg:py-24">
        <span
          aria-hidden
          className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-brand text-brand"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
        </span>
        <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink-900">
          We&rsquo;d love to have you back
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-500">
          If you change your mind, you can resubscribe at any time.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/dashboard/brand">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/pricing">
            <Button size="lg" className="w-full sm:w-auto">
              View Plans
            </Button>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
