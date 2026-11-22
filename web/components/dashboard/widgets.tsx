"use client";

import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  DashboardCampaign,
  RequestRow,
  StatCardData,
} from "@/lib/mock";

/* ------------------------------------------------------------------ */
/* Icons (stroke SVGs  dashboard frames)               */
/* ------------------------------------------------------------------ */

export function WidgetIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
    className,
  } as const;
  const stroke = {
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  switch (name) {
    case "gift":
      return (
        <svg {...common}>
          <path d="M4 9h16v4H4zM6 13v8h12v-8M12 9v12M12 9S8 9 6.5 7.5 8 4 10 5s2 4 2 4zm0 0s4 0 5.5-1.5S16 4 14 5s-2 4-2 4z" {...stroke} />
        </svg>
      );
    case "eye":
      return (
        <svg {...common}>
          <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" {...stroke} />
          <circle cx="12" cy="12" r="2.8" {...stroke} />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" {...stroke} />
          <path d="m8.5 12.2 2.4 2.4 4.6-5" {...stroke} />
        </svg>
      );
    case "moneybag":
      return (
        <svg {...common}>
          <path d="M9 7h6l2.5 5.5A6 6 0 1 1 6.5 12.5L9 7z" {...stroke} />
          <path d="M9 7l1-3h4l1 3" {...stroke} />
          <path d="M12 12.5v4M10 14.5h4" {...stroke} />
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M3 11v2l4 1 2 6h2l-1.5-6.5L19 17V7L9.5 10.5 7 10l-4 1z" {...stroke} />
          <path d="M19 7a3 3 0 0 1 0 6" {...stroke} />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M4 5h16v10H9l-5 4V5z" {...stroke} />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" {...stroke} />
          <path d="M9 4a3 3 0 0 1 6 0M9 11h6M9 15h4" {...stroke} />
        </svg>
      );
    case "people":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3.2" {...stroke} />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 5.5a3.2 3.2 0 0 1 0 5.6M17.5 14a5.5 5.5 0 0 1 3 5" {...stroke} />
        </svg>
      );
    case "percent":
      return (
        <svg {...common}>
          <path d="M19 5 5 19" {...stroke} />
          <circle cx="7.5" cy="7.5" r="2.5" {...stroke} />
          <circle cx="16.5" cy="16.5" r="2.5" {...stroke} />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" {...stroke} />
          <circle cx="12" cy="12" r="5" {...stroke} />
          <circle cx="12" cy="12" r="1.5" {...stroke} />
        </svg>
      );
    case "cursor":
      return (
        <svg {...common}>
          <path d="M5 3.5 19 11l-6.5 1.5L9 19 5 3.5z" {...stroke} />
        </svg>
      );
    case "chart":
      return (
        <svg {...common}>
          <path d="M4 20V4M4 20h16" {...stroke} />
          <path d="M8 16v-5M12 16V8M16 16v-3" {...stroke} />
        </svg>
      );
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9.5 18h5M10 21h4" {...stroke} />
          <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.3 2.2h4.6c.2-.9.6-1.6 1.3-2.2A6 6 0 0 0 12 3z" {...stroke} />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" {...stroke} />
          <path d="M12 7.5V12l3 2" {...stroke} />
        </svg>
      );
    case "bolt":
      return (
        <svg {...common}>
          <path d="M13 2 5 13.5h6L11 22l8-11.5h-6L13 2z" {...stroke} />
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" {...stroke} />
          <path d="M8 5H4.5A3.5 3.5 0 0 0 8 12M16 5h3.5A3.5 3.5 0 0 1 16 12M12 13v4M8.5 20h7M10 17h4" {...stroke} />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" {...stroke} />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" {...stroke} />
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

/** Light-blue rounded icon chip used across dashboard cards. */
export function IconChip({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200"
    >
      <WidgetIcon name={name} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Primitives                                                            */
/* ------------------------------------------------------------------ */

export function WelcomeHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <h1 className="break-words text-[28px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          {title}
        </h1>
        <p className="mt-1 break-words text-[15px] text-ink-500 dark:text-ink-300">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/** Green "+x% ↗" pill used on dashboard stat cards. */
export function DeltaPill({ delta }: { delta: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-success-bg dark:bg-success/15 px-2.5 py-1 text-[12px] font-bold text-success dark:text-success-bright">
      {delta}
    </span>
  );
}

export function StatCard({
  value,
  label,
  delta,
  icon,
  sub,
  mobileLabel,
}: StatCardData & { sub?: string; mobileLabel?: string }) {
  return (
    <Card className="flex flex-col items-center p-5 text-center">
      {icon && <IconChip name={icon} />}
      <p
        className={cn(
          "font-extrabold tracking-tight text-ink-900 dark:text-ink-50",
          icon ? "mt-3 text-[34px]" : "text-[30px]"
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-[14px] font-bold text-ink-900 dark:text-ink-50">
        {mobileLabel ? (
          <>
            <span className="lg:hidden">{mobileLabel}</span>
            <span className="hidden lg:inline">{label}</span>
          </>
        ) : (
          label
        )}
      </p>
      {sub && <p className="mt-0.5 text-[13px] text-ink-400 dark:text-ink-300">{sub}</p>}
      {delta ? (
        <p className="mt-2">
          <DeltaPill delta={delta} />
        </p>
      ) : null}
    </Card>
  );
}

export function SectionCard({
  title,
  action,
  children,
  className,
  titleClassName,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className={cn("text-[19px] font-bold text-ink-900 dark:text-ink-50", titleClassName)}>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold",
        status === "Active" && "bg-success-bg dark:bg-success/15 text-success dark:text-success-bright",
        status === "Submitted" && "bg-warning-bg dark:bg-warning/15 text-warning dark:text-warning-bright",
        status === "Completed" && "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200",
        status === "Pending" && "bg-warning-bg dark:bg-warning/15 text-warning dark:text-warning-bright",
        status === "Successful" && "bg-success-bg dark:bg-success/15 text-success dark:text-success-bright"
      )}
    >
      {status}
    </span>
  );
}

/** Referral status pill with a leading dot (blue = Successful, amber = Pending). */
export function DotStatusPill({ status }: { status: string }) {
  const pending = status === "Pending";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold",
        pending ? "bg-amber-100 text-amber-800" : "bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200"
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-2 w-2 rounded-full",
          pending ? "bg-amber-600" : "bg-brand"
        )}
      />
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Campaign rows + request tables                                        */
/* ------------------------------------------------------------------ */

/** Horizontal campaign row . */
export function CampaignCard({ campaign }: { campaign: DashboardCampaign }) {
  const completed = campaign.status === "Completed";
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
      <span className="flex min-w-0 flex-1 items-center gap-4">
        <IconChip name={completed ? "check" : "clock"} />
        <span className="min-w-0">
          <span className="block truncate text-[16px] font-bold text-ink-900 dark:text-ink-50">
            {campaign.title}
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-500 dark:text-ink-300">
            {campaign.handle}
          </span>
        </span>
      </span>
      <dl className="flex items-center gap-6 text-[13px] sm:gap-8">
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Budget</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{campaign.budget}</dd>
        </div>
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Status</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{campaign.status}</dd>
        </div>
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Deadline</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{campaign.deadline}</dd>
        </div>
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Submitted</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{campaign.submitted}</dd>
        </div>
      </dl>
    </Card>
  );
}

/** Brand "Recent Requests" table — had a "Campaingn" typo, corrected. */
export function RequestsTable({ rows }: { rows: RequestRow[] }) {
  const router = useRouter();
  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table className="w-full min-w-[680px] text-left text-[14px]">
        <thead>
          <tr className="border-b border-ink-100 dark:border-ink-800 text-[13px] text-ink-400 dark:text-ink-300">
            <th className="pb-3 pr-4 font-medium" aria-label="Creator" />
            <th className="pb-3 pr-4 font-medium">Campaign</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Date</th>
            <th className="pb-3 font-medium" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row.handle}-${i}`}
              className="border-b border-ink-100 dark:border-ink-800 last:border-0"
            >
              <td className="py-3.5 pr-4">
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand/25 text-sm font-bold text-brand dark:text-brand-200"
                  >
                    {row.name.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-900 dark:text-ink-50">
                      {row.name}
                    </span>
                    <span className="block text-[13px] text-ink-400 dark:text-ink-300">
                      {row.handle}
                    </span>
                  </span>
                </span>
              </td>
              <td className="py-3.5 pr-4 font-semibold text-ink-900 dark:text-ink-50">
                {row.campaign}
              </td>
              <td className="py-3.5 pr-4 font-semibold text-ink-900 dark:text-ink-50">
                {row.status}
              </td>
              <td className="py-3.5 pr-4 font-semibold text-ink-900 dark:text-ink-50">
                {row.date}
              </td>
              <td className="py-3.5 text-right">
                <Button
                  variant="outline"
                  size="md"
                  className="border-brand-300 text-ink-900 dark:text-ink-50 hover:border-brand"
                  onClick={() => router.push("/dashboard/applications/received")}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Creator/Professional request row (red brand avatar, Budget/Status/Date). */
export function RequestRowCard({
  name,
  location,
  budget,
  status,
  date,
}: {
  name: string;
  location: string;
  budget: string;
  status: string;
  date: string;
}) {
  const router = useRouter();
  return (
    <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
      <span className="flex min-w-0 flex-1 items-center gap-4">
        <span
          aria-hidden
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-rose-500 text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 20.5S4.5 15.5 4.5 9.8A4.3 4.3 0 0 1 12 6.6a4.3 4.3 0 0 1 7.5 3.2c0 5.7-7.5 10.7-7.5 10.7z"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="min-w-0">
          <span className="block text-[16px] font-bold text-ink-900 dark:text-ink-50">
            {name}
          </span>
          <span className="mt-0.5 block text-[13px] text-ink-500 dark:text-ink-300">
            {location}
          </span>
        </span>
      </span>
      <dl className="flex items-center gap-6 text-[13px] sm:gap-8">
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Budget</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{budget}</dd>
        </div>
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Status</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{status}</dd>
        </div>
        <div className="text-center">
          <dt className="text-ink-400 dark:text-ink-300">Date</dt>
          <dd className="mt-1 font-bold text-ink-900 dark:text-ink-50">{date}</dd>
        </div>
      </dl>
      <Button
        variant="outline"
        size="md"
        className="border-brand-300 text-ink-900 dark:text-ink-50 hover:border-brand"
        onClick={() => router.push("/dashboard/applications")}
      >
        View Details
      </Button>
    </Card>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-900/60 px-6 py-10 text-center">
      <span
        aria-hidden
        className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-300"
      >
        <WidgetIcon name="clipboard" />
      </span>
      <p className="mt-4 text-[15px] font-bold text-ink-900 dark:text-ink-50">{title}</p>
      <p className="mt-1 max-w-[380px] text-[14px] text-ink-500 dark:text-ink-300">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Creator / Professional widgets                                        */
/* ------------------------------------------------------------------ */

export function ProfileCompleteness({ pct }: { pct: number }) {
  return (
    <div>
      <p className="text-[15px] font-bold text-ink-900 dark:text-ink-50">Profile Completeness</p>
      <div className="mt-3 flex items-center gap-4">
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Profile completeness"
        >
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[14px] font-semibold text-ink-500 dark:text-ink-300">{pct}%</span>
      </div>
    </div>
  );
}

export function AvailabilityCalendar() {
  // Real calendar for the CURRENT month. Prev/next navigate; today is
  // highlighted; no fake availability statuses are shown.
  const [view, setView] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const today = new Date();
  const firstDow = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const marked: Record<number, "Active" | "Available" | "Blocked"> = {};
  const isToday = (day: number) =>
    day === today.getDate() &&
    view.month === today.getMonth() &&
    view.year === today.getFullYear();
  const shiftMonth = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  return (
    <section>
      <h2 className="text-[22px] font-extrabold text-ink-900 dark:text-ink-50">
        Availability & Calendar
      </h2>
      <Card className="mt-4 p-6">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => shiftMonth(-1)}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-ink-400 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.6} />
              <path d="m14 9-3 3 3 3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-[16px] font-extrabold text-ink-900 dark:text-ink-50">
            {view.month + 1} / {view.year}
          </p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => shiftMonth(1)}
            className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-full text-ink-400 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.6} />
              <path d="m10 9 3 3-3 3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 text-center text-[13px] font-medium text-ink-500 dark:text-ink-300">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 border-t border-l border-ink-100 dark:border-ink-800">
          {weeks.flat().map((day, i) => {
            const status = day !== null ? marked[day] : undefined;
            return (
              <div
                key={i}
                className="min-h-[92px] border-b border-r border-ink-100 dark:border-ink-800 p-2"
              >
                {day !== null && (
                  <>
                    <p
                      className={`text-right text-[13px] ${isToday(day) ? "font-extrabold text-brand dark:text-brand-200" : "text-ink-700 dark:text-ink-200"}`}
                    >
                      {day}
                      {isToday(day) ? " · Today" : ""}
                    </p>
                    {status && (
                      <p className="mt-2 text-center">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            status === "Active" && "bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200",
                            status === "Available" && "bg-success-bg dark:bg-success/15 text-success dark:text-success-bright",
                            status === "Blocked" && "bg-red-50 text-red-500"
                          )}
                        >
                          {status}
                        </span>
                      </p>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}

export function QuickActions({
  buttons,
}: {
  buttons: Array<{ label: string; href: string }>;
}) {
  return (
    <section>
      <h2 className="text-[22px] font-extrabold text-ink-900 dark:text-ink-50">Quick Actions</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {buttons.map(({ label, href }) => (
          <Link key={label} href={href}>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-brand-300 text-brand dark:text-brand-200 hover:border-brand hover:text-brand dark:hover:text-brand-200"
            >
              {label}
            </Button>
          </Link>
        ))}
      </div>
      <Card className="mt-4 flex items-start gap-4 p-5">
        <IconChip name="lightbulb" />
        <p className="text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">
          <span className="font-bold text-ink-900 dark:text-ink-50">Tip:</span>{" "}
          {/* Was "Creators with complete profiles get 3× more campaign
              requests." — a fabricated multiplier with no data behind it.
              Neutral wording keeps the advice without the invented number. */}
          Complete your profile to get more campaign requests.
        </p>
      </Card>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Referral dashboard widgets                                            */
/* ------------------------------------------------------------------ */

export function ReferralHero({
  info,
  loading = false,
}: {
  loading?: boolean;
  info: {
    title: string;
    subtitle: string;
    linkLabel: string;
    link: string;
    linkHint: string;
    codeLabel: string;
    code: string;
    codeStatus: string;
    codeHint: string;
  };
}) {
  const [copied, setCopied] = useState(false);
  const linkCardRef = useRef<HTMLDivElement>(null);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(info.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  // System share sheet where the browser offers one, otherwise copy.
  const shareLink = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Pacten",
          text: "Join me on Pacten",
          url: info.link,
        });
        return;
      } catch {
        // Share dismissed — fall through to copy.
      }
    }
    await copyLink();
  };
  // Bring the referral link into view and copy it, so it can be pasted
  // into any invite.
  const inviteFriends = () => {
    linkCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    void copyLink();
  };
  // The Rewards section lives further down this page.
  const viewRewards = () => {
    document
      .getElementById("rewards")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Per-platform share links carrying the referral link. Instagram has no
  // web share URL, so it has no chip here.
  const encodedLink = encodeURIComponent(info.link);
  const shareText = encodeURIComponent("Join me on Pacten");
  const shareTargets = [
    {
      key: "in",
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`,
      text: "in",
    },
    {
      key: "x",
      label: "Share on X",
      href: `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedLink}`,
      text: "𝕏",
    },
    {
      key: "wa",
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${shareText}%20${encodedLink}`,
      text: "wa",
    },
    {
      key: "tg",
      label: "Share on Telegram",
      href: `https://t.me/share/url?url=${encodedLink}&text=${shareText}`,
      text: "tg",
    },
  ];
  const heroButtonClass =
    "border-brand-300 text-brand dark:text-brand-200 hover:border-brand hover:text-brand dark:hover:text-brand-200";
  return (
    <div>
      <h1 className="text-[28px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
        {info.title}
      </h1>
      <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">{info.subtitle}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button variant="outline" size="lg" className={heroButtonClass} onClick={copyLink}>
          {copied ? "Copied" : "Copy Link"}
        </Button>
        <Button variant="outline" size="lg" className={heroButtonClass} onClick={shareLink}>
          Share
        </Button>
        <Button variant="outline" size="lg" className={heroButtonClass} onClick={inviteFriends}>
          Invite Friends
        </Button>
        <Button variant="outline" size="lg" className={heroButtonClass} onClick={viewRewards}>
          View Rewards
        </Button>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div ref={linkCardRef}>
          <Card className="p-6">
            <p className="text-[19px] font-bold text-ink-900 dark:text-ink-50">{info.linkLabel}</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-12 min-w-0 flex-1 items-center justify-between gap-2 rounded-xl bg-brand-50/60 dark:bg-white/10 px-4 text-[14px] font-medium text-brand dark:text-brand-200">
                {loading ? (
                  <Skeleton className="h-4 flex-1" />
                ) : (
                  <span className="truncate">{info.link}</span>
                )}
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy referral link"
                  className="cursor-pointer shrink-0 text-brand dark:text-brand-200 hover:text-brand-dark"
                >
                  <WidgetIcon name="copy" className="h-[18px] w-[18px]" />
                </button>
              </span>
              <Button size="md" onClick={copyLink}>
                {copied ? "Copied" : "Copy Link"}
              </Button>
            </div>
            <p className="mt-3 text-[13px] text-ink-500 dark:text-ink-300">{info.linkHint}</p>
            <p className="mt-4 flex items-center gap-3 text-[13px] font-semibold text-ink-700 dark:text-ink-200">
              Share
              <span className="flex items-center gap-2" aria-label="Share options">
                {shareTargets.map((s) => (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-brand-50 dark:bg-white/10 text-[12px] font-extrabold text-brand dark:text-brand-200"
                  >
                    {s.text}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={copyLink}
                  aria-label="Copy referral link"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-brand-50 dark:bg-white/10 text-[12px] font-extrabold text-brand dark:text-brand-200"
                >
                  🔗
                </button>
              </span>
            </p>
          </Card>
        </div>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <p className="text-[19px] font-bold text-ink-900 dark:text-ink-50">
              {info.codeLabel}
            </p>
            <span className="inline-flex items-center rounded-full bg-brand-50 dark:bg-white/10 px-3 py-1 text-[12px] font-semibold text-brand dark:text-brand-200">
              {info.codeStatus}
            </span>
          </div>
          <p className="mt-4 inline-block rounded-xl bg-brand-50/60 dark:bg-white/10 px-5 py-3 text-[16px] font-extrabold tracking-[0.15em] text-ink-900 dark:text-ink-50">
            {info.code}
          </p>
          <p className="mt-3 text-[13px] text-ink-500 dark:text-ink-300">{info.codeHint}</p>
        </Card>
      </div>
    </div>
  );
}

export function AnalyticsGrid({
  items,
}: {
  items: { value: string; label: string; hint: string; icon: string }[];
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col items-center p-5 text-center">
          <IconChip name={item.icon} />
          <p className="mt-3 text-[30px] font-extrabold text-ink-900 dark:text-ink-50">
            {item.value}
          </p>
          <p className="mt-1 text-[14px] font-bold text-ink-900 dark:text-ink-50">{item.label}</p>
          <p className="text-[13px] text-ink-400 dark:text-ink-300">{item.hint}</p>
        </Card>
      ))}
    </div>
  );
}

export function RewardsCards({
  entries,
}: {
  entries: { label: string; date: string; amount: string; status: string }[];
}) {
  const groups = [
    {
      title: "Pending Rewards",
      icon: "clock",
      headerClass: "bg-amber-100 text-amber-800",
      badge: "Pending",
      badgeClass: "bg-amber-100 text-amber-800",
      rows: entries.filter((e) => e.status === "Pending"),
    },
    {
      title: "Paid Rewards",
      icon: "check",
      headerClass: "bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200",
      badge: "Paid",
      badgeClass: "bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200",
      rows: entries.filter((e) => e.status === "Paid"),
    },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {groups.map((g) => (
        <Card key={g.title} className="p-6">
          <p
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-bold",
              g.headerClass
            )}
          >
            <WidgetIcon name={g.icon} className="h-5 w-5" />
            {g.title}
          </p>
          {g.rows.length === 0 ? (
            <p className="mt-4 text-[14px] text-ink-500 dark:text-ink-300">
              No {g.badge.toLowerCase()} rewards yet.
            </p>
          ) : (
            <ul className="mt-2 divide-y divide-ink-100 dark:divide-ink-800">
              {g.rows.map((r, idx) => (
                <li
                  key={`${r.label}-${r.date}-${idx}`}
                  className="flex items-center justify-between gap-3 py-3.5 text-[14px]"
                >
                  <span className="text-ink-700 dark:text-ink-200">
                    {r.label} · {r.date}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[12px] font-semibold",
                      g.badgeClass
                    )}
                  >
                    {g.badge}
                  </span>
                  <span className="font-bold text-ink-900 dark:text-ink-50">{r.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}

export function CommissionHistory({
  entries,
}: {
  entries: { campaign: string; date: string; amount: string }[];
}) {
  // The empty state renders ONLY when there are no entries — it used
  // to be appended unconditionally under the populated list.
  if (entries.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No commission history yet"
          body="Your commission earnings from completed campaigns will appear here."
        />
      </Card>
    );
  }
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <ul className="divide-y divide-ink-100 dark:divide-ink-800">
          {entries.map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <p className="text-[15px] font-bold text-ink-900 dark:text-ink-50">{e.campaign}</p>
              <p className="text-center">
                <span className="block text-[14px] font-medium text-ink-900 dark:text-ink-50">
                  {e.date}
                </span>
                <span className="block text-[12px] text-ink-400 dark:text-ink-300">Date</span>
              </p>
              <p className="text-right">
                <span className="block text-[14px] font-medium text-ink-900 dark:text-ink-50">
                  {e.amount}
                </span>
                <span className="block text-[12px] text-ink-400 dark:text-ink-300">Amount</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function RecentReferrals({
  rows,
}: {
  rows: { name: string; joined: string; earnings: string; status: string }[];
}) {
  // Empty state only when there are no rows.
  if (rows.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No referrals yet"
          body="Share your referral link with friends and start earning rewards when they join Pacten."
        />
      </Card>
    );
  }
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <ul className="divide-y divide-ink-100 dark:divide-ink-800">
          {rows.map((r, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4"
            >
              <span className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand/25 text-sm font-bold text-brand dark:text-brand-200"
                >
                  {r.name.charAt(0)}
                </span>
                <span className="text-[15px] font-bold text-ink-900 dark:text-ink-50">
                  {r.name}
                </span>
              </span>
              <span className="text-center">
                <span className="block text-[14px] font-medium text-ink-900 dark:text-ink-50">
                  {r.joined}
                </span>
                <span className="block text-[12px] text-ink-400 dark:text-ink-300">
                  Date Joined
                </span>
              </span>
              <span className="text-center">
                <span className="block text-[14px] font-medium text-ink-900 dark:text-ink-50">
                  {r.earnings}
                </span>
                <span className="block text-[12px] text-ink-400 dark:text-ink-300">Earnings</span>
              </span>
              <DotStatusPill status={r.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
