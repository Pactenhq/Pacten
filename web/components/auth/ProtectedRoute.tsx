"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { getToken } from "@/lib/api";

type ProtectedRouteProps = {
  children: ReactNode;
  /** If set, only users with one of these roles can access */
  roles?: string[];
};

/**
 * Wraps dashboard pages. Redirects to /login if not authenticated,
 * or to / if the user's role is not allowed.
 */
export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Fast synchronous check: no token in storage = definitely not logged in
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (!checked || loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (roles && roles.length > 0 && !roles.includes(user.role)) {
      router.replace("/");
    }
  }, [user, loading, checked, roles, router]);

  if (!checked || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-ink-200 border-t-brand" />
      </div>
    );
  }

  if (!user) return null;
  if (roles && roles.length > 0 && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
