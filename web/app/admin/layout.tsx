"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { DashboardNavItem } from "@/lib/mock";

const ADMIN_NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/users", label: "Users", icon: "shield" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "megaphone" },
  { href: "/admin/deals", label: "Deals", icon: "briefcase" },
  { href: "/admin/payouts", label: "Referral Payouts", icon: "gift" },
  { href: "/admin/disputes", label: "Disputes", icon: "file" },
  { href: "/admin/settings", label: "Settings", icon: "gear" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      // A signed-in non-admin is sent to their own dashboard instead
      // of the login form.
      router.replace(
        user.role === "creator"
          ? "/dashboard/creator"
          : user.role === "professional"
            ? "/dashboard/professional"
            : "/dashboard/brand"
      );
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[14px] text-ink-500 dark:text-ink-300">
          {user && user.role !== "admin"
            ? "This area is for platform admins — taking you to your dashboard…"
            : "Checking access…"}
        </p>
      </div>
    );
  }

  return (
    <DashboardShell
      nav={ADMIN_NAV}
      userName="Pacten Admin"
      userInitials="PA"
    >
      {children}
    </DashboardShell>
  );
}
