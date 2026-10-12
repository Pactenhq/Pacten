"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./Button";
import { PactenLogo } from "./PactenLogo";
import { cn } from "@/lib/cn";
import { useAuth, dashboardPathForRole } from "@/components/auth/AuthProvider";

// Rebuilt navigation ("destop home" 90:2 + "mob" 146:3977):
// wordmark, For Creators / For Professional / For Business dropdown links,
// Pricing, Login link, and three role CTA buttons (152/165/190 x 53).
const dropdownLinks = [
  { label: "For Creators", href: "/creators" },
  { label: "For Professional", href: "/professionals" },
  { label: "For Business", href: "/signup/brand" },
];

function Chevron() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="opacity-70"
    >
      <path
        d="M3 4.5 6 7.5 9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, displayName, loading, logout } = useAuth();
  const loggedIn = !loading && !!user;
  const dashboardHref = user ? dashboardPathForRole(user.role) : "/dashboard/brand";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur transition-all duration-300 ${scrolled ? "navbar-scrolled" : ""}`}>
      <nav className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center" aria-label="Pacten home">
            <PactenLogo className="h-9 w-auto" />
          </Link>
          <div className="hidden items-center gap-6 xl:flex">
            {dropdownLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-ink-700 hover:text-ink-900"
              >
                {label}
                <Chevron />
              </Link>
            ))}
            <Link
              href="/pricing"
              className="text-[15px] font-medium text-ink-700 hover:text-ink-900"
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="hidden items-center gap-2 pl-8 xl:flex">
          {loggedIn ? (
            <>
              <span className="mr-2 max-w-[180px] truncate whitespace-nowrap text-[15px] font-semibold text-ink-900">
                {displayName}
              </span>
              <Link href={dashboardHref}>
                <Button variant="primary" size="sm" className="px-4">
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={logout}
                className="whitespace-nowrap text-[15px] font-semibold text-brand hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mr-2 whitespace-nowrap text-[15px] font-semibold text-brand hover:underline"
              >
                Login
              </Link>
              <Link href="/signup/creator">
                <Button variant="primary" size="sm" className="px-4">
                  Join as a Creator
                </Button>
              </Link>
              <Link href="/signup/brand">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-brand px-4 text-brand hover:border-brand-dark hover:bg-brand-50 hover:text-brand-dark"
                >
                  Join as a Business
                </Button>
              </Link>
              <Link href="/signup/professional">
                <Button variant="primary" size="sm" className="px-4">
                  Join as a Professional
                </Button>
              </Link>
            </>
          )}
        </div>
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 xl:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M3 5.5h14M3 10h14M3 14.5h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </nav>
      <div
        className={cn(
          "border-t border-ink-100 bg-white px-6 py-4 xl:hidden",
          !open && "hidden"
        )}
      >
        <div className="flex flex-col gap-3">
          {[...dropdownLinks.map((l) => ({ label: l.label, href: l.href })), { label: "Pricing", href: "/pricing" }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[15px] font-medium text-ink-700"
            >
              {label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <span className="mt-2 text-[15px] font-semibold text-ink-900">
                {displayName}
              </span>
              <div className="mt-1 flex flex-col gap-2">
                <Link href={dashboardHref}>
                  <Button variant="primary" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={logout}>
                  Log out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mt-2 text-[15px] font-semibold text-ink-900"
              >
                Login
              </Link>
              <div className="mt-1 flex flex-col gap-2">
                <Link href="/signup/creator">
                  <Button variant="primary" className="w-full">
                    Join as a Creator
                  </Button>
                </Link>
                <Link href="/signup/brand">
                  <Button variant="outline" className="w-full">
                    Join as a Business
                  </Button>
                </Link>
                <Link href="/signup/professional">
                  <Button variant="primary" className="w-full">
                    Join as a Professional
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
