import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { pricingTiers } from "@/lib/mock";

// desktop +
// "mob pricing Confirm Your Upgrade" (426:70148) mobile.
// All copy verbatim from the frame.
function MastercardLogo() {
  return (
    <span aria-hidden className="relative inline-flex h-8 w-12 shrink-0">
      <span className="absolute left-0 top-0 h-8 w-8 rounded-full bg-[#eb001b]" />
      <span className="absolute right-0 top-0 h-8 w-8 rounded-full bg-[#f79e1b] opacity-90" />
    </span>
  );
}

export default function ConfirmUpgradePage() {
  const pro = pricingTiers.find((t) => t.name === "Pro") ?? pricingTiers[1];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[941px] px-6 py-14 lg:py-20">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 lg:text-[52px] lg:leading-[1.1]">
            Confirm Your <span className="text-brand">Upgrade</span>
          </h1>
          <p className="mt-4 text-lg text-ink-500">
            Review your new plan and payment details before confirming.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[435px_1fr]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-ink-900">Your New Plan</h2>
              <Link href="/pricing">
                <Button variant="outline" size="sm">
                  Edit Plan
                </Button>
              </Link>
            </div>

            <div className="mt-5 rounded-2xl border border-ink-100 p-6">
              <span
                aria-hidden
                className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-50 text-brand"
              >
                <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="5" width="12" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3 8.5V13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5M8 5v9M8 5S5.5 5 4.5 4A1.3 1.3 0 0 1 6.6 2.6C7.5 3.2 8 5 8 5Zm0 0s2.5 0 3.5-1A1.3 1.3 0 0 0 9.4 2.6C8.5 3.2 8 5 8 5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="mt-4 text-2xl font-extrabold text-ink-900">
                {pro.name}
              </p>
              <p className="mt-1 text-lg font-bold text-brand">{pro.price}</p>
              <hr className="my-5 border-0 border-t border-ink-100" />
              <ul className="flex flex-col gap-3">
                {pro.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      aria-hidden
                      className="mt-0.5 shrink-0 text-brand"
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
                    <span className="text-[15px] text-ink-700">{f}</span>
                  </li>
                ))}
              </ul>
              {pro.commission && (
                <span className="mt-5 inline-flex h-7 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand">
                  {pro.commission}
                </span>
              )}
            </div>

            <div className="mt-5 flex gap-3 rounded-2xl bg-brand-50/70 p-5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 26 26"
                fill="none"
                aria-hidden
                className="shrink-0 text-brand"
              >
                <circle cx="13" cy="13" r="11.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M13 12v5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="13" cy="8.5" r="1.2" fill="currentColor" />
              </svg>
              <div className="text-sm leading-relaxed text-ink-700">
                <p className="font-bold text-ink-900">
                  You&apos;re upgrading from Pro
                </p>
                <p className="mt-1">
                  Your new plan will be activated immediately. Your next
                  billing date will remain the same.
                </p>
              </div>
            </div>
          </Card>

          <Card className="h-fit p-6">
            <h2 className="text-xl font-bold text-ink-900">Billing Summary</h2>
            <div className="mt-5">
              <p className="text-[15px] text-ink-500">New Plan</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-[15px] font-bold text-ink-900">Pro</p>
                <p className="text-[15px] text-ink-900">$19</p>
              </div>
              <hr className="my-4 border-0 border-t border-ink-100" />
              <div className="flex items-center justify-between">
                <p className="text-[15px] text-ink-500">Monthly</p>
                <p className="text-[15px] text-ink-900">$19</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-ink-100 p-6">
              <h3 className="text-lg font-bold text-ink-900">Payment Method</h3>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <MastercardLogo />
                  <div>
                    <p className="text-[15px] font-bold text-ink-900">
                      Mastercard
                    </p>
                    <p className="mt-1 text-sm text-ink-500">
                      &bull;&bull;&bull;&bull; 4242
                    </p>
                    <p className="mt-2 text-sm text-ink-500">
                      Expires 04/2028
                    </p>
                  </div>
                </div>
                <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-brand-50 px-3 text-xs font-semibold text-brand">
                  Default
                </span>
              </div>
              <button
                type="button"
                className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-ink-300 text-[15px] font-medium text-ink-400 transition-colors hover:border-brand hover:text-brand"
              >
                + Add Payment Method
              </button>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
