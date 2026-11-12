"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Scroll-to-top on every route change.
//
// Symptom (Nov 12): returning to '/' from another page landed near the
// BOTTOM of the homepage instead of the top — via the logo link, a nav
// link, and the browser back button alike. Reproduction showed Next's
// own scroll-to-top did fire (scrollY hit 0 right after navigation),
// but a saved-position restore then dragged the page back down to
// ~4677px over the next second, once the async showcase/pricing
// sections had grown the page to its full height. So the restore has
// to be disabled, not just outrun once.
//
// This component therefore does two things:
//  1. Sets history.scrollRestoration to 'manual' once, so the browser
//     never restores a saved scroll position on its own (back button
//     included).
//  2. Scrolls to the top instantly on every pathname change. Instant,
//     not smooth: html carries `scroll-behavior: smooth`, which would
//     animate this scroll while async sections are still growing the
//     page.
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
