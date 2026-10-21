"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

// desktop +
// "mob pricing Upgrade Successful" (426:70959) mobile.
// Button labels inside unexpanded component instances were not recoverable
// from cache (APPROX): "Go to Dashboard" / "Explore Plans".
//
// Live mode: Stripe returns here with ?session_id={CHECKOUT_SESSION_ID}.
// The checkout.session.completed webhook targets the deployed backend, so
// on a local run the plan would never activate — settle it from the
// return path via POST /subscriptions/sync (idempotent; the webhook is
// the other settlement path). Without a session_id (demo mode / direct
// visit) the success content renders unchanged.
function UpgradeSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [syncing, setSyncing] = useState(!!sessionId);
  const syncStarted = useRef(false);

  useEffect(() => {
    if (!sessionId || syncStarted.current) return;
    syncStarted.current = true;
    (async () => {
      try {
        await api.syncSubscription(sessionId);
      } catch {
        // Best-effort: the webhook can still settle the subscription.
      } finally {
        setSyncing(false);
      }
    })();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[484px] px-6 py-20 lg:py-28">
        {syncing ? (
          <div className="text-center">
            <span
              aria-hidden
              className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-brand text-brand"
            >
              <svg
                className="animate-spin"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
            </span>
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
              Activating your plan&hellip;
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">
              Just a moment while we confirm your payment with Stripe.
            </p>
          </div>
        ) : (
          <div className="text-center">
            <span
              aria-hidden
              className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border-2 border-brand text-brand"
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
            <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
              Your plan has been upgraded! &#x1F389;
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500">
              Your new plan is active and you can start using your additional
              features right away
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/dashboard/brand">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/subscription">
                <Button size="lg" className="w-full sm:w-auto">
                  Manage Subscription
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <UpgradeSuccessContent />
    </Suspense>
  );
}
