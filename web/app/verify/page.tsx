"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/auth/Stepper";

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
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-500"
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

export default function VerifyPage() {
  return (
    <main className="bg-mist/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-900 lg:text-5xl">
          Verification
        </h1>
        <p className="mt-3 text-lg text-ink-500">
          Submit your details for review and earn a verified badge.
        </p>

        <div className="mt-10 flex justify-start">
          <Stepper steps={STEPS} activeIndex={0} />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[685px_1fr]">
          <Card className="p-6 shadow-pop sm:p-10">
            <h2 className="text-2xl font-bold tracking-tight text-ink-900 lg:text-3xl">
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
                  className="text-sm font-medium text-ink-900"
                >
                  Creator Category
                </label>
                <div className="relative">
                  <select
                    id="creator-category"
                    name="creatorCategory"
                    className="h-12 w-full appearance-none rounded-xl border border-ink-300 bg-white px-4 pr-11 text-[15px] text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
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

          <Card className="h-fit p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-ink-900">Need Help?</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
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
