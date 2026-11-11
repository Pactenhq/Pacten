"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, dashboardPathForRole } from "@/lib/api";

// Legacy route: shows the signed-in professional's own public profile.
// It previously rendered a fabricated showcase profile (fake rates,
// fake availability, fake reviews). It now redirects to the real
// public profile page (/professionals/[id]) backed by the profiles API.
export default function ProfessionalProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState<"loading" | "signin" | "wrong-role" | "missing">("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "professional") {
      setState(!user ? "signin" : "wrong-role");
      return;
    }
    let alive = true;
    api
      .myProfile()
      .then((p) => {
        if (!alive) return;
        if (p && p.id) router.replace(`/professionals/${p.id}`);
        else setState("missing");
      })
      .catch(() => {
        if (alive) setState("missing");
      });
    return () => {
      alive = false;
    };
  }, [authLoading, user, router]);

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6 lg:px-12">
          {state === "loading" && <p className="text-ink-500 dark:text-ink-300">Loading your profile...</p>}
          {state === "signin" && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-lg font-medium text-ink-900 dark:text-ink-50">Sign in to view your profile</p>
              <Link href="/login" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
                Go to login
              </Link>
            </div>
          )}
          {state === "wrong-role" && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-lg font-medium text-ink-900 dark:text-ink-50">This page is for professionals.</p>
              <Link href={dashboardPathForRole(user?.role ?? "")} className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
                Go to your dashboard
              </Link>
            </div>
          )}
          {state === "missing" && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-lg font-medium text-ink-900 dark:text-ink-50">No professional profile found.</p>
              <p className="text-[15px] text-ink-500 dark:text-ink-300">
                Your professional profile could not be loaded. Complete it from your dashboard.
              </p>
              <Link href="/dashboard/professional" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
                Go to your dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
