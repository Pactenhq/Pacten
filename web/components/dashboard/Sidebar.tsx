"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { DashboardNavItem } from "@/lib/mock";

// Shared dashboard sidebar, rebuilt from the design dashboard frames
// ("Brand dashboard" 340:10561, "Creator dashboard" 366:25472,
// "Professional dashboard" 364:22630, "Referral dashboard" 372:32610).
// Sidebar header: 45px avatar + "My Dashboard"; nav rows are 45px icon
// chips + labels with hairline dividers between them. The brand sidebar
// carries the extra "Employer" entry; creator/professional sidebars do not.

function NavIcon({ icon }: { icon: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
  } as const;
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  switch (icon) {
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5" {...stroke} />
          <path d="M10 20v-6h4v6" {...stroke} />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11v2l4 1 2 6h2l-1.5-6.5L19 17V7L9.5 10.5 7 10l-4 1z" {...stroke} />
          <path d="M19 7a3 3 0 0 1 0 6" {...stroke} />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M6 3h8l4 4v14H6V3z" {...stroke} />
          <path d="M14 3v4h4M9 12h6M9 16h6" {...stroke} />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v10H9l-5 4V5z" {...stroke} />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V4M4 20h16" {...stroke} />
          <path d="M8 16v-5M12 16V8M16 16v-3" {...stroke} />
        </svg>
      );
    case "gift":
      return (
        <svg {...common}>
          <path d="M4 9h16v4H4zM6 13v8h12v-8M12 9v12M12 9S8 9 6.5 7.5 8 4 10 5s2 4 2 4zm0 0s4 0 5.5-1.5S16 4 14 5s-2 4-2 4z" {...stroke} />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <path d="M4 8h16v12H4V8zM9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 13h16" {...stroke} />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7V3z" {...stroke} />
          <path d="M14 3v4h4" {...stroke} />
        </svg>
      );
    case "card":
      return (
        <svg {...common}>
          <path d="M3 6h18v12H3V6zM3 10h18" {...stroke} />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.2" {...stroke} />
          <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" {...stroke} />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" {...stroke} />
        </svg>
      );
  }
}

function SidebarNavInner({
  items,
  userName,
  onNavigate,
}: {
  items: DashboardNavItem[];
  userName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-1">
      <nav aria-label="Dashboard" className="flex flex-col">
        {items.map((item, i) => {
          const active =
            item.href !== "#" &&
            (pathname === item.href ||
              (item.href !== "/dashboard/campaigns" &&
                pathname.startsWith(item.href + "/")));
          return (
            <div key={item.label}>
              {i > 0 && <hr className="border-ink-100" />}
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-3 text-[15px] font-medium transition-colors",
                  active
                    ? "bg-brand-50/70 text-ink-900"
                    : "text-ink-700 hover:bg-ink-50 hover:text-ink-900"
                )}
              >
                <span
                  className={cn(
                    "flex h-[45px] w-[45px] shrink-0 items-center justify-center rounded-xl",
                    active ? "bg-brand text-white" : "bg-ink-50 text-ink-500"
                  )}
                >
                  <NavIcon icon={item.icon} />
                </span>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
      <p className="sr-only">{userName}</p>
    </div>
  );
}

export function SidebarNav(props: {
  items: DashboardNavItem[];
  userName: string;
  onNavigate?: () => void;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col gap-1" aria-hidden="true">
          {props.items.map((item) => (
            <div
              key={item.label}
              className="h-[69px] rounded-xl bg-ink-50/60"
            />
          ))}
        </div>
      }
    >
      <SidebarNavInner {...props} />
    </Suspense>
  );
}

export function Sidebar({
  items,
  userName,
  className,
}: {
  items: DashboardNavItem[];
  userName: string;
  className?: string;
}) {
  return (
    <aside className={cn("w-[300px] shrink-0", className)}>
      <div className="sticky top-[104px]">
        <SidebarNav items={items} userName={userName} />
      </div>
    </aside>
  );
}
