"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

/** Role picker for referral links (/signup?ref=CODE). Preserves ?ref=. */
export default function SignupIndexPage() {
  // Read in an effect: during client-side navigation (e.g. from /r/:code)
  // window.location isn't updated yet on the very first render.
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => {
    setRef(new URLSearchParams(window.location.search).get("ref"));
  }, []);
  const suffix = ref ? `?ref=${encodeURIComponent(ref)}` : "";
  const roles = [
    {
      href: `/signup/brand${suffix}`,
      title: "Brand",
      desc: "Find creators and run campaigns.",
    },
    {
      href: `/signup/creator${suffix}`,
      title: "Creator",
      desc: "Get discovered and land deals.",
    },
    {
      href: `/signup/professional${suffix}`,
      title: "Professional",
      desc: "Offer your services to brands.",
    },
  ];
  return (
    <main className="bg-mist/50">
      <div className="mx-auto max-w-[1380px] px-6 py-14 lg:px-12 lg:py-20">
        <div className="flex justify-center">
          <Card className="w-full max-w-[662px] p-6 shadow-pop sm:p-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 lg:text-4xl">
              Join Pacten
            </h1>
            <p className="mt-2 text-[15px] text-ink-500">
              {ref
                ? "You were referred by a friend — pick your account type."
                : "Pick your account type to get started."}
            </p>
            <div className="mt-8 grid gap-4">
              {roles.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="rounded-2xl border border-ink-200 p-5 transition hover:border-brand hover:shadow-md"
                >
                  <p className="text-[17px] font-bold text-ink-900">{r.title}</p>
                  <p className="mt-1 text-[14px] text-ink-500">{r.desc}</p>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-brand hover:underline">
                Login
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
