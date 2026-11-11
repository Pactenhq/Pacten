"use client";

// Theme toggle (sun/moon) for the site header and the dashboard header.
// Light is the default. The choice is saved in localStorage
// ("pacten-theme": "light" | "dark") and applied by toggling the `dark`
// class on <html> — the blocking script in app/layout.tsx applies the
// saved class before first paint, so there is no flash of the wrong theme.
//
// The icon swap is pure CSS (dark: variants on the two SVGs), so the
// button never flashes the wrong icon while React hydrates.
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const nextDark = !root.classList.contains("dark");
    root.classList.toggle("dark", nextDark);
    try {
      localStorage.setItem("pacten-theme", nextDark ? "dark" : "light");
    } catch {
      // Private mode / blocked storage: theme still applies for the session.
    }
  };

  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      onClick={toggle}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-900 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-white/5 dark:hover:text-white"
    >
      {/* Moon: shown in light mode */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="dark:hidden"
      >
        <path
          d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {/* Sun: shown in dark mode */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="hidden dark:block"
      >
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}
