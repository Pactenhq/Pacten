"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { Footer } from "@/components/ui/Footer";
import { PactenLogo } from "@/components/ui/PactenLogo";
import { NotificationBell } from "./NotificationBell";
import { Sidebar, SidebarNav } from "./Sidebar";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { DashboardNavItem } from "@/lib/mock";

// Dashboard page shell, rebuilt from the design dashboard frames
// ("Brand dashboard" 340:10561 and siblings). Top bar: "Pacten." wordmark
// left; notification bell, avatar + user name with chevron, and an outline
// "Log Out" button right. Below it the 300px sidebar sits beside the
// content column; on mobile the sidebar is replaced by a hamburger that
// opens the nav in a slide-over drawer.

export function DashboardShell({
  nav,
  userName,
  userInitials,
  children,
}: {
  nav: DashboardNavItem[];
  userName: string;
  userInitials: string;
  /** Accepted for page-level API compatibility; the dashboard
      header carries no CTA button, so this is intentionally not rendered. */
  topButtonLabel?: string;
  children: React.ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  // When a real session exists, show the logged-in user's name instead of
  // the mock prop. Visual layout unchanged.
  const { user, displayName, loading: authLoading, logout } = useAuth();
  const shownName = !authLoading && user ? displayName : userName;
  const shownInitials =
    !authLoading && user
      ? shownName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : userInitials;
  const handleLogout = () => {
    if (user) logout();
    else setMenuOpen(false);
  };

  return (
    <ProtectedRoute>
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-4">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-50 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open dashboard menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <Link href="/" aria-label="Pacten home">
              <PactenLogo className="h-8 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <NotificationBell />
            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="relative h-[33px] w-[33px] shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/assets/profile/avatar-reviewer.jpg"
                  alt={shownName}
                  fill
                  className="object-cover"
                  sizes="33px"
                />
              </span>
              <span className="text-[15px] font-semibold text-ink-900">
                {shownName}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="text-ink-500"
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <Button
              size="md"
              variant="outline"
              className="hidden border-brand-300 text-brand hover:border-brand hover:text-brand sm:inline-flex"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1380px] flex-1 gap-10 px-6 py-8 lg:px-12">
        <Sidebar items={nav} userName={shownName} className="hidden lg:block" />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <Footer logoTone="brand" />

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <SidebarNav
          items={nav}
          userName={shownName}
          onNavigate={() => setMenuOpen(false)}
        />
        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full border-brand-300 text-brand"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </Drawer>
    </div>
    </ProtectedRoute>
  );
}
