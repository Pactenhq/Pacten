"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

//
// Email verification (token link from the signup email).
// The verification email links here as /verify?token=... — this component
// submits that token to the API (GET /auth/verify) and reports the result.
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
// No token: the page was opened without an email-verification link.
// There is no badge application here — manual verification is a separate
// gated item with no backend yet — so the page tells the user to use the
// link in their signup email, and offers a working resend.
function NoTokenVerificationGuide() {
  const [email, setEmail] = useState("");
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");

  const resend = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResendState("sending");
    try {
      await api.resendVerificationEmail(email.trim());
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  return (
    <main className="bg-mist/50 dark:bg-ink-950/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-5xl">
          Verification
        </h1>
        <p className="mt-3 text-lg text-ink-500 dark:text-ink-300">
          This page confirms your email address using the link in your signup
          email.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[685px_1fr]">
          <Card className="p-6 shadow-pop sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 dark:text-ink-50 lg:text-3xl">
              Check your email
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-500 dark:text-ink-300">
              We sent a verification link to the email address you signed up
              with. Open that email and click the link, then log in. The link
              expires after 24 hours.
            </p>
            <form
              className="mt-8 flex flex-col gap-5"
              onSubmit={resend}
            >
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={resendState === "sending"}
                >
                  {resendState === "sending"
                    ? "Sending…"
                    : "Resend verification email"}
                </Button>
              </div>
            </form>
            {resendState === "sent" && (
              <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
                If an account exists for this email, a verification email has
                been sent. Check your inbox — and your spam folder.
              </p>
            )}
            {resendState === "error" && (
              <p className="mt-4 text-sm text-danger dark:text-danger-bright">
                Something went wrong. Please try again.
              </p>
            )}
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
              Already verified?{" "}
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
              If the email never arrives, check your spam folder first, then
              contact support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="mailto:hello@pacten.info">
                <Button variant="outline" size="lg">
                  Contact Support
                </Button>
              </a>
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
  return <NoTokenVerificationGuide />;
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
