"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

/** Public referral link: tracks the click, then sends the visitor to signup. */
export default function ReferralRedirectPage() {
  const { code } = useParams() as { code: string };
  const router = useRouter();

  useEffect(() => {
    api
      .referralClick(code)
      .catch(() => {})
      .finally(() => {
        router.replace(`/signup?ref=${encodeURIComponent(code)}`);
      });
  }, [code, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-[14px] text-ink-500">Taking you to Pacten…</p>
    </div>
  );
}
