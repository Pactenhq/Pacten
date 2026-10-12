"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/auth/Stepper";
import {
  AuthError,
  CheckEmailNotice,
  useSignupForm,
} from "@/components/auth/auth-forms";

//
// Copy, stepper and layout matched verbatim from the frame.
// Now wired to the real auth API.
const STEPS = ["Account", "Profile", "Platforms", "Portfolio", "Services"];

function CreatorSignupForm() {
  const { field, submit, error, loading, checkEmail, email } =
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
          <div>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? "Creating account…" : "Continue"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}

export default function CreatorSignupPage() {
  return (
    <main className="bg-mist/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <Stepper steps={STEPS} activeIndex={0} />
        <div className="mt-10 flex justify-center">
          <Card className="fade-up fade-up-2 w-full max-w-[662px] p-6 shadow-pop sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
              Create your account
            </h1>
            <p className="mt-2 text-[15px] text-ink-500">
              Let&apos;s start with the basics
            </p>
            <CreatorSignupForm />
            <p className="mt-4 text-sm text-ink-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-brand hover:underline"
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
