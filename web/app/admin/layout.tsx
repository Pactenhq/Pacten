"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/deals", label: "Deals" },
  { href: "/admin/payouts", label: "Referral Payouts" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      // A signed-in non-admin used to be dumped on the login form with
      // no explanation (while the header still showed their session).
      // Send them to their own dashboard instead.
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
        <p className="text-[14px] text-ink-500">
          {user && user.role !== "admin"
            ? "This area is for platform admins — taking you to your dashboard…"
            : "Checking access…"}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-[18px] font-extrabold text-ink-900">
            Pacten <span className="text-brand">Admin</span>
          </p>
          <p className="text-[13px] text-ink-500">{user.email}</p>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-6">
          {NAV.map((n) => {
            const active =
              n.href === "/admin" ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-t-xl px-4 py-3 text-[14px] font-semibold ${
                  active
                    ? "bg-ink-50 text-brand"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
