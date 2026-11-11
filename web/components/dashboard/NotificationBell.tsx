"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/relative-time";

// Notification bell + dropdown, rebuilt from the design
// "Notification dropbox" frame (429:118790), 390px wide panel with
// notification rows (47px icon chip, two-line copy, relative time).
// Empty state follows "Notification dropbox empty" (429:118890).
// Data is REAL: GET /notifications/me + /notifications/me/unread-count.
// The bell previously rendered fabricated preview notifications
// ("Campaign accepted", …) for every logged-in user; the QA pack emptied
// it, and this build wires it to the notifications backend.

type NotificationIcon = "check" | "chat" | "user" | "star" | "wrench";

interface BellNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

function iconForType(type: string): NotificationIcon {
  if (type === "new_message") return "chat";
  if (type.startsWith("contract_")) return "check";
  if (type.startsWith("dispute_")) return "wrench";
  if (type.startsWith("application_")) return "user";
  return "star";
}

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
      className="flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        {paths[icon]}
      </svg>
    </span>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BellNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [list, count] = await Promise.all([
      api.notifications(20, 0).catch(() => null),
      api.notificationUnreadCount().catch(() => null),
    ]);
    if (list && Array.isArray(list.items)) setItems(list.items);
    if (count && typeof count.unreadCount === "number") {
      setUnread(count.unreadCount);
    } else if (list) {
      setUnread(list.unreadCount);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) load();
  }

  async function markAllRead() {
    await api.notificationMarkAllRead().catch(() => null);
    await load();
  }

  async function openItem(item: BellNotification) {
    if (!item.isRead) {
      await api.notificationMarkRead(item.id).catch(() => null);
    }
    setOpen(false);
    router.push(item.link || "/dashboard/notifications");
  }

  const badge = unread > 99 ? "99+" : String(unread);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={
          unread > 0
            ? `Notifications, ${unread} unread`
            : "Notifications"
        }
        aria-expanded={open}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-700 dark:text-ink-200 transition-colors hover:bg-ink-50 dark:hover:bg-white/5",
          open && "bg-ink-50 dark:bg-ink-900"
        )}
      >
        <BellIcon />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white"
          >
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[340px] max-w-[calc(100vw-3rem)] rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-pop">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[15px] font-semibold text-ink-900 dark:text-ink-50">
              Notifications
            </p>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[13px] font-medium text-brand dark:text-brand-200 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {loading && items.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink-500 dark:text-ink-300">Loading…</p>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-50 dark:bg-ink-900 text-ink-400 dark:text-ink-300">
                <BellIcon />
              </span>
              <p className="text-[15px] font-semibold text-ink-900 dark:text-ink-50">
                No new notifications
              </p>
              <p className="text-sm text-ink-500 dark:text-ink-300">You&apos;re all caught up.</p>
            </div>
          ) : (
            <ul className="flex max-h-[420px] flex-col gap-1 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openItem(n)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-ink-50 dark:hover:bg-white/5",
                      !n.isRead && "bg-brand-50/60 dark:bg-white/10"
                    )}
                  >
                    <RowIcon icon={iconForType(n.type)} />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[14px] leading-snug text-ink-900 dark:text-ink-50",
                          !n.isRead ? "font-semibold" : "font-medium"
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="truncate text-[13px] text-ink-500 dark:text-ink-300">
                        {n.body}
                      </p>
                    </div>
                    <span className="shrink-0 text-[12px] text-ink-400 dark:text-ink-300">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <a
            href="/dashboard/notifications"
            className="mt-4 block text-center text-[13px] font-medium text-brand dark:text-brand-200 hover:underline"
          >
            View all notifications
          </a>
        </div>
      )}
    </div>
  );
}
