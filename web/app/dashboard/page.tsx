"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { dashboardPathForRole } from "@/lib/api";

// Bare /dashboard had no index route (404). It now redirects every
// visitor to the right home: the logged-in user's role dashboard
// (brand / creator / professional / admin), or /login when logged out.
// No UI link leads here; this only closes the hole for typed/pasted URLs.
export default function DashboardIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    router.replace(dashboardPathForRole(user.role));
  }, [user, loading, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 dark:border-ink-700 border-t-brand" />
    </div>
  );
}
