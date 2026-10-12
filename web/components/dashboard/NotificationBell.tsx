"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  notificationPreview,
  type NotificationIcon,
} from "@/lib/mock-billing";

// Notification bell + dropdown, rebuilt from the design
// "Notification dropbox" frame (429:118790), 390px wide panel with
// notification rows (47px icon chip, two-line copy, relative time).
// Empty state follows "Notification dropbox empty" (429:118890);
// its copy was not recoverable from cache (APPROX).

function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

function RowIcon({ icon }: { icon: NotificationIcon }) {
  const paths: Record<NotificationIcon, React.ReactNode> = {
    check: (
      <path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    chat: <path d="M4 5h16v10H9l-5 4V5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />,
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ),
    star: (
      <path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8L12 3z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
    wrench: (
      <path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3 3.7-3.7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
  };
  return (
    <span
      aria-hidden
      className="flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        {paths[icon]}
      </svg>
    </span>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const items = notificationPreview;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 transition-colors hover:bg-ink-50",
          open && "bg-ink-50"
        )}
      >
        <BellIcon />
        {items.length > 0 && (
          <span
            aria-hidden
            className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl border border-ink-100 bg-white p-5 shadow-pop">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 text-ink-400">
                <BellIcon />
              </span>
              <p className="text-[15px] font-semibold text-ink-900">
                No new notifications
              </p>
              <p className="text-sm text-ink-500">You&apos;re all caught up.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {items.map((n) => (
                <li key={n.id} className="flex items-start gap-3">
                  <RowIcon icon={n.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold leading-snug text-ink-900">
                      {n.title}
                    </p>
                    <p className="truncate text-[13px] text-ink-500">{n.body}</p>
                  </div>
                  <span className="shrink-0 text-[12px] text-ink-400">
                    {n.time}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
