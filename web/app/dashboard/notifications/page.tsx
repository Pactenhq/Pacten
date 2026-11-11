"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { api, getToken } from "@/lib/api";
import { formatRelativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

// desktop +
// "mob Notification" (376:36317) mobile.
// NOTE: the frame uses the public nav (no dashboard sidebar); followed as
// drawn. The list is REAL: GET /notifications/me. It previously rendered
// fabricated notification groups for every visitor; the QA pack replaced
// them with an empty state, and this build wires the real list.

interface PageNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<PageNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.notifications(50, 0);
      setItems(Array.isArray(data.items) ? data.items : []);
      setUnread(data.unreadCount || 0);
      setLoadError(false);
    } catch {
      if (!getToken()) {
        setSignedOut(true);
      } else {
        setLoadError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markAllRead() {
    await api.notificationMarkAllRead().catch(() => null);
    await load();
  }

  async function openItem(item: PageNotification) {
    if (!item.isRead) {
      await api.notificationMarkRead(item.id).catch(() => null);
    }
    router.push(item.link || "/dashboard/notifications");
  }

  return (
    <div className="min-h-screen bg-white dark:bg-ink-900">
      <Navbar />
      <main className="mx-auto max-w-[1316px] px-6 py-12 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-ink-50 lg:text-4xl">
            Notifications
          </h1>
          {unread > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-[14px] font-medium text-brand dark:text-brand-200 hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="mt-10 flex flex-col gap-10">
          <section aria-label="Notifications">
            {loading ? (
              <p className="py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
                Loading…
              </p>
            ) : signedOut ? (
              <p className="py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
                <a href="/login" className="font-medium text-brand dark:text-brand-200 hover:underline">
                  Sign in
                </a>{" "}
                to view your notifications.
              </p>
            ) : loadError ? (
              <p className="py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
                Could not load notifications. Please try again.
              </p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-[15px] text-ink-500 dark:text-ink-300">
                No notifications yet. Updates about your campaigns, deals and
                messages will appear here.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => openItem(n)}
                      className={cn(
                        "flex w-full items-start gap-4 py-4 text-left transition-colors hover:bg-ink-50 dark:hover:bg-white/5",
                        !n.isRead && "bg-brand-50/50 dark:bg-white/10"
                      )}
                    >
                      <div className="min-w-0 flex-1 px-2">
                        <p
                          className={cn(
                            "text-[15px] leading-snug text-ink-900 dark:text-ink-50",
                            !n.isRead ? "font-semibold" : "font-medium"
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="mt-0.5 text-[14px] text-ink-500 dark:text-ink-300">
                          {n.body}
                        </p>
                      </div>
                      <span className="shrink-0 px-2 text-[13px] text-ink-400 dark:text-ink-300">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
