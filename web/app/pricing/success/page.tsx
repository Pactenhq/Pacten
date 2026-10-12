import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";

// desktop +
// "mob pricing Upgrade Successful" (426:70959) mobile.
// Button labels inside unexpanded component instances were not recoverable
// from cache (APPROX): "Go to Dashboard" / "Explore Plans".
export default function UpgradeSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[484px] px-6 py-20 lg:py-28">
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
      </main>
      <Footer />
    </div>
  );
}
