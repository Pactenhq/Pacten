"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import {
  AuthError,
  CheckEmailNotice,
  useSignupForm,
} from "@/components/auth/auth-forms";

//
// Copy and layout matched from the frame, wired to the real auth API.
// NOTE: the frame drew a 5-step wizard (Account/Profile/Platforms/
// Portfolio/Services) but signup is a single step — the account is
// created here and profile completion happens later in Settings — so no
// stepper is shown: showing steps that never happen misled users into
// waiting for a step 2.
function CreatorSignupForm() {
  const { field, submit, error, loading, checkEmail, email, termsAccepted, setTermsAccepted } =
    useSignupForm("creator");
  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
      <AuthError message={error} />
      {checkEmail ? (
        <CheckEmailNotice email={email} />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="First Name"
              type="text"
              placeholder="First Name"
              autoComplete="given-name"
              required
              {...field("firstName")}
            />
            <TextField
              label="Last Name"
              type="text"
              placeholder="Last Name"
              autoComplete="family-name"
              required
              {...field("lastName")}
            />
          </div>
          <TextField
            label="Email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
            {...field("email")}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              label="Password"
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              {...field("password")}
            />
            <TextField
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              autoComplete="new-password"
              required
              {...field("confirmPassword")}
            />
          </div>
          <label className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-200">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              aria-label="I confirm I am at least 18 years old and I agree to the Terms of Service and Privacy Policy"
              className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
            />
            <span>
              I confirm I am at least 18 years old and I agree to the{" "}
              <Link
                href="/terms"
                className="font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          <div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export default function CreatorSignupPage() {
  return (
    <main className="bg-mist/50 dark:bg-ink-950/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <div className="mt-10 flex justify-center">
          <Card className="fade-up fade-up-2 w-full max-w-[662px] p-6 shadow-pop sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
              Let&apos;s start with the basics
            </p>
            <CreatorSignupForm />
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
        </div>
      </div>
    </main>
  );
}
