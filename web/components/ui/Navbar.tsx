"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { PactenLogo } from "./PactenLogo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";
import { useAuth, dashboardPathForRole } from "@/components/auth/AuthProvider";

// Rebuilt navigation ("destop home" 90:2 + "mob" 146:3977):
// wordmark, For Creators / For Professional / For Business dropdown links,
// Pricing, Login link, and three role CTA buttons (152/165/190 x 53).
// Dropdown menu contents are the expanded panels shown in the Figma file
// above the "destop home" frame, verbatim. `href` is the destination the
// collapsed mobile item links to (mobile shows no submenus, per Figma).
const dropdownLinks = [
  {
    label: "For Creators",
    href: "/creators",
    items: [
      { label: "Find Campaigns", href: "/campaigns" },
      { label: "Creator Marketplace", href: "/creators" },
      { label: "Become a Creator", href: "/signup/creator" },
    ],
  },
  {
    label: "For Professional",
    href: "/professionals",
    items: [
      { label: "Find Work", href: "/campaigns" },
      { label: "Professional Marketplace", href: "/professionals" },
      { label: "Become a Professional", href: "/signup/professional" },
    ],
  },
  {
    label: "For Business",
    href: "/signup/brand",
    items: [
      { label: "Find Creators", href: "/creators" },
      { label: "Find Professionals", href: "/professionals" },
      { label: "Become a Business", href: "/signup/brand" },
    ],
  },
];

function NavDropdown({
  label,
  items,
  open,
  onOpen,
  onClose,
  triggerRef,
}: {
  label: string;
  items: { label: string; href: string }[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  triggerRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <div
      className="relative shrink-0"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => (open ? onClose() : onOpen())}
        className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap bg-transparent text-[15px] font-medium text-ink-700 dark:text-ink-200 hover:text-ink-900 dark:hover:text-ink-50 shrink-0"
      >
        {label}
        <span
          aria-hidden
          className={cn(
            "inline-flex transition-transform duration-200",
            open && "rotate-180"
          )}
        >
          <Chevron />
        </span>
      </button>
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-60 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-2 shadow-card">
          <ul>
            {items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className="flex w-full items-center rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-700 dark:text-ink-200 transition-colors hover:bg-ink-50 dark:hover:bg-white/5 hover:text-ink-900 dark:hover:text-ink-50"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const desktopNavRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { user, displayName, loading, logout } = useAuth();
  const loggedIn = !loading && !!user;
  const dashboardHref = user ? dashboardPathForRole(user.role) : "/dashboard/brand";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // One dropdown open at a time. Clicking outside the desktop nav or
  // pressing Escape closes the open menu (and returns focus to its
  // trigger, so keyboard users do not lose their place).
  useEffect(() => {
    if (openMenu == null) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(e.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const idx = openMenu;
        setOpenMenu(null);
        triggerRefs.current[idx]?.focus();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  return (
    <header className={`sticky top-0 z-40 border-b border-ink-100 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur transition-all duration-300 ${scrolled ? "navbar-scrolled" : ""}`}>
      <nav className="mx-auto flex h-[72px] max-w-[1380px] items-center justify-between px-6 lg:px-12">
        <div className="flex shrink-0 items-center gap-8">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Pacten home">
            <PactenLogo className="h-9 w-auto" />
          </Link>
          <div
            ref={desktopNavRef}
            className="hidden items-center gap-5 xl:flex"
          >
            {dropdownLinks.map((group, i) => (
              <NavDropdown
                key={group.label}
                label={group.label}
                items={group.items}
                open={openMenu === i}
                onOpen={() => setOpenMenu(i)}
                onClose={() => setOpenMenu((cur) => (cur === i ? null : cur))}
                triggerRef={(el) => {
                  triggerRefs.current[i] = el;
                }}
              />
            ))}
            <Link
              href="/pricing"
              className="whitespace-nowrap text-[15px] font-medium text-ink-700 dark:text-ink-200 hover:text-ink-900 dark:hover:text-ink-50 shrink-0"
            >
              Pricing
            </Link>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-2 pl-2 xl:flex">
          <ThemeToggle />
          {loggedIn ? (
            <>
              <span className="mr-2 max-w-[180px] truncate whitespace-nowrap text-[15px] font-semibold text-ink-900 dark:text-ink-50">
                {displayName}
              </span>
              <Link href={dashboardHref}>
                <Button variant="primary" size="sm" className="px-4">
                  Dashboard
                </Button>
              </Link>
              <button
                onClick={logout}
                className="whitespace-nowrap text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="mr-2 whitespace-nowrap text-[15px] font-semibold text-brand dark:text-brand-200 hover:underline"
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
                  className="border-brand px-4 text-brand dark:text-brand-200 hover:border-brand-dark hover:bg-brand-50 dark:hover:bg-white/10 hover:text-brand-dark"
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
        <div className="flex items-center gap-2 xl:hidden">
          <ThemeToggle />
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink-200 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 xl:hidden"
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
        </div>
      </nav>
      <div
        className={cn(
          "border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-4 xl:hidden",
          !open && "hidden"
        )}
      >
        <div className="flex flex-col gap-3">
          {[...dropdownLinks.map((l) => ({ label: l.label, href: l.href })), { label: "Pricing", href: "/pricing" }].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-[15px] font-medium text-ink-700 dark:text-ink-200"
            >
              {label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <span className="mt-2 text-[15px] font-semibold text-ink-900 dark:text-ink-50">
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
                className="mt-2 text-[15px] font-semibold text-ink-900 dark:text-ink-50"
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
