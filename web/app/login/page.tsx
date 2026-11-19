"use client";

import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import {
  AuthError,
  AuthNotice,
  useLoginForm,
} from "@/components/auth/auth-forms";

//
// Card copy and layout matched verbatim: left-aligned heading, Email /
// Password fields, Remember me checkbox, left-aligned "Log In" button.
// Now wired to the real auth API.
function LoginForm() {
  const { field, submit, error, loading, verifiedNotice, remember, setRemember, needsVerification, resendState, resendVerification } = useLoginForm();
  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
      <AuthNotice message={verifiedNotice} />
      <AuthError message={error} />
      {needsVerification && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-brand/25 bg-brand-50 dark:bg-white/10 px-4 py-3">
          <p className="text-sm font-medium text-ink-900 dark:text-ink-50">
            Didn&apos;t get the email? We can send it again.
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={resendVerification}
            disabled={resendState === "sending" || resendState === "sent"}
          >
            {resendState === "sending"
              ? "Sending…"
              : resendState === "sent"
                ? "Verification email sent"
                : "Resend verification email"}
          </Button>
          {resendState === "sent" && (
            <p role="status" className="text-sm font-medium text-emerald-700">
              Verification email sent — please check your inbox.
            </p>
          )}
          {resendState === "error" && (
            <p role="alert" className="text-sm font-medium text-danger dark:text-danger-bright">
              Could not send the email. Please try again.
            </p>
          )}
        </div>
      )}
      <TextField
        label="Email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
        {...field("email")}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
        {...field("password")}
      />
      <div className="flex items-center justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-700 dark:text-ink-200">
          <input
            type="checkbox"
            data-testid="remember-me"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded border-ink-300 dark:border-ink-700 accent-[#0c29ab]"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="text-sm font-semibold text-brand dark:text-brand-200 hover:underline">
          Forgot password?
        </Link>
      </div>
      <div>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? "Logging in…" : "Log In"}
        </Button>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="bg-mist/50 dark:bg-ink-950/50">
        <div className="mx-auto flex min-h-[70vh] max-w-[1380px] items-center justify-center px-6 py-16 lg:px-12 lg:py-24">
          <Card className="fade-up fade-up-2 w-full max-w-[662px] p-6 shadow-pop sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 text-[15px] text-ink-500 dark:text-ink-300">
              Log in to your Pacten account and continue where you left off.
            </p>
            <Suspense>
              <LoginForm />
            </Suspense>
            <p className="mt-4 text-sm text-ink-500 dark:text-ink-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup/creator"
                className="font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
