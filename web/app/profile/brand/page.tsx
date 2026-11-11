"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { api, dashboardPathForRole } from "@/lib/api";

// Brand profile page. There is no public brand profile route, so this
// page shows the signed-in brand's own profile from the real profiles
// API. It previously rendered a fabricated showcase brand (fake
// campaigns, fake jobs, fake hiring activity, fake reviews). Every
// field below comes from GET /profiles/me; empty fields say so
// instead of inventing content.
export default function BrandProfilePage() {
  const { user, displayName, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [state, setState] = useState<"loading" | "signin" | "wrong-role" | "ready" | "missing">("loading");

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "brand") {
      setState(!user ? "signin" : "wrong-role");
      return;
    }
    let alive = true;
    api
      .myProfile()
      .then((p) => {
        if (!alive) return;
        if (p && p.id) {
          setProfile(p);
          setState("ready");
        } else {
          setState("missing");
        }
      })
      .catch(() => {
        if (alive) setState("missing");
      });
    return () => {
      alive = false;
    };
  }, [authLoading, user]);

  const field = (label: string, value: unknown) => (
    <div className="border-b border-ink-100 dark:border-ink-800 py-4 last:border-0">
      <p className="text-[13px] font-medium text-ink-500 dark:text-ink-300">{label}</p>
      <p className="mt-1 text-[15px] font-medium text-ink-900 dark:text-ink-50">
        {value ? String(value) : "Not provided yet"}
      </p>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <div className="mx-auto max-w-[900px] px-4 pt-6 sm:px-6 lg:px-12">
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
              <p className="text-lg font-medium text-ink-900 dark:text-ink-50">This page is for brands.</p>
              <Link href={dashboardPathForRole(user?.role ?? "")} className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
                Go to your dashboard
              </Link>
            </div>
          )}
          {state === "missing" && (
            <div className="flex flex-col items-start gap-3">
              <p className="text-lg font-medium text-ink-900 dark:text-ink-50">No brand profile found.</p>
              <p className="text-[15px] text-ink-500 dark:text-ink-300">
                Your brand profile could not be loaded. Complete it from your dashboard settings.
              </p>
              <Link href="/dashboard/settings" className="text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline">
                Go to settings
              </Link>
            </div>
          )}
          {state === "ready" && profile && (
            <Card className="p-5 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-[26px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
                    {profile.companyName || displayName || "Your brand"}
                  </h1>
                  <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">Brand profile</p>
                </div>
                {profile.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.logoUrl} alt="Brand logo" width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                ) : null}
              </div>
              <div className="mt-6">
                {field("Company name", profile.companyName)}
                {field("Website", profile.website)}
                {field("Industry", profile.industry)}
                {field("Description", profile.description)}
                {field("Location", profile.location)}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/settings">
                  <Button>Edit profile</Button>
                </Link>
                <Link href="/dashboard/brand">
                  <Button variant="outline">Go to dashboard</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
