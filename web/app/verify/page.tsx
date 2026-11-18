"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/auth/Stepper";
import { api } from "@/lib/api";

//
// Copy, stepper, card and side-panel layout matched verbatim from the frame.
const STEPS = [
  "Profile Details",
  "Social Accounts",
  "Identity Document",
  "Submit for Review",
];

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-300"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

//
// Email verification (token link from the signup email).
// The verification email links here as /verify?token=... — this component
// submits that token to the API (GET /auth/verify) and reports the result.
// Previously this page ignored the token entirely and the Continue button
// did nothing, so users who clicked the email link were stuck here.
function EmailVerificationResult({ token }: { token: string }) {
  const [state, setState] = useState<"verifying" | "success" | "error">(
    "verifying"
  );

  useEffect(() => {
    let cancelled = false;
    api.verifyEmail(token).then(
      () => {
        if (!cancelled) setState("success");
      },
      () => {
        if (!cancelled) setState("error");
      }
    );
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <main className="bg-mist/50 dark:bg-ink-950/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-5xl">
          Verification
        </h1>
        <div className="mt-10 flex justify-center">
          <Card className="fade-up fade-up-2 w-full max-w-[662px] p-6 shadow-pop sm:p-10">
            {state === "verifying" && (
              <>
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 dark:border-ink-700 border-t-brand" />
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 lg:text-3xl">
                  Verifying your email…
                </h2>
                <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
                  Please wait while we confirm your email address.
                </p>
              </>
            )}
            {state === "success" && (
              <>
                <span
                  aria-hidden
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f7ee]"
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M6 14.5 11.5 20 22 8.5"
                      stroke="#16a34a"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 lg:text-3xl">
                  Your email is verified
                </h2>
                <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
                  Your email address has been confirmed. You can now log in
                  to your Pacten account.
                </p>
                <div className="mt-8">
                  <Link href="/login">
                    <Button size="lg">Login</Button>
                  </Link>
                </div>
              </>
            )}
            {state === "error" && (
              <>
                <h2 className="mt-6 text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 lg:text-3xl">
                  Verification link invalid
                </h2>
                <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
                  This verification link is invalid or has expired. Please log
                  in — you can still use your account — or contact support if
                  the problem continues.
                </p>
                <div className="mt-8">
                  <Link href="/login">
                    <Button size="lg">Login</Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

//
// Identity verification (verified-badge application) — Figma design, kept
// exactly as designed. It has no backend: the manual-verification flow is
// a separate gated item, so this form is only shown when the page is opened
// WITHOUT an email-verification token (no link in the app points here;
// only the verification email does, and it always carries a token).
function IdentityVerificationForm() {
  return (
    <main className="bg-mist/50 dark:bg-ink-950/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-5xl">
          Verification
        </h1>
        <p className="mt-3 text-lg text-ink-500 dark:text-ink-300">
          Submit your details for review and earn a verified badge.
        </p>

        <div className="mt-10 flex justify-start">
          <Stepper steps={STEPS} activeIndex={0} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[685px_1fr]">
          <Card className="p-6 shadow-pop sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 lg:text-3xl">
              Confirm Profile Details
            </h2>
            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="First Name"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  autoComplete="given-name"
                  required
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  autoComplete="family-name"
                  required
                />
              </div>
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
              />
              <div className="flex w-full flex-col gap-1.5">
                <label
                  htmlFor="creator-category"
                  className="text-sm font-medium text-ink-900 dark:text-ink-50"
                >
                  Creator Category
                </label>
                <div className="relative">
                  <select
                    id="creator-category"
                    name="creatorCategory"
                    className="h-12 w-full appearance-none rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 pr-11 text-[15px] text-ink-400 dark:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="fashion">Fashion</option>
                    <option value="fitness">Fitness</option>
                    <option value="beauty">Beauty</option>
                    <option value="tech">Tech</option>
                    <option value="food">Food</option>
                  </select>
                  <ChevronDown />
                </div>
              </div>
              <div>
                <Button type="submit" size="lg">
                  Continue
                </Button>
              </div>
            </form>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Login
              </Link>
            </p>
          </Card>

          <Card className="h-fit p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-900 dark:text-ink-50">Need Help?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">
              If you have questions about the verification process, visit our
              Help Centre or contact support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/">
                <Button size="lg">Visit Help Centre</Button>
              </Link>
              <Link href="/">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function VerifyPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  if (token) {
    return <EmailVerificationResult token={token} />;
  }
  return <IdentityVerificationForm />;
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-mist/50 dark:bg-ink-950/50">
          <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
            <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-5xl">
              Verification
            </h1>
            <p className="mt-3 text-lg text-ink-500 dark:text-ink-300">
              Verifying your email…
            </p>
          </div>
        </main>
      }
    >
      <VerifyPageInner />
    </Suspense>
  );
}
