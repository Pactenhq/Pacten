"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { initialsForName } from "@/lib/conversation-map";
import type { ConversationPreview } from "@/lib/mock-messages";
import { fmtTime } from "./ConversationPanel";

// Conversation list column, rebuilt from the design "Messages dashboard"
// (360:19583) / "inbox" (411:59061): search field, "All" filter
// control, and 52px photo-avatar rows with name/handle, preview
// snippet, timestamp and unread badge, separated by hairline dividers.

export function ConversationList({
  conversations,
  basePath,
}: {
  conversations: ConversationPreview[];
  basePath: string;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return conversations.filter((c) => {
      if (filter === "unread" && c.unreadCount <= 0) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q)
      );
    });
  }, [conversations, query, filter]);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
      <div className="flex items-center gap-3 border-b border-ink-100 dark:border-ink-800 p-4">
        <div className="flex h-[50px] flex-1 items-center gap-2 rounded-xl bg-ink-50 dark:bg-ink-900 px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-500 dark:text-ink-300">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            aria-label="Search conversations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[15px] text-ink-900 dark:text-ink-50 outline-none placeholder:text-ink-500 dark:placeholder:text-ink-300"
          />
        </div>
        {/* Filter control */}
        <select
          aria-label="Filter conversations"
          className="h-[50px] shrink-0 rounded-xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 text-sm font-medium text-ink-700 dark:text-ink-200 outline-none"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "unread")}
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-ink-500 dark:text-ink-300">
            {filter === "unread"
              ? "No unread conversations"
              : "No conversations match your search"}
          </p>
        )}
        {visible.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <hr className="border-ink-100 dark:border-ink-800" />}
            <Link
              href={`${basePath}/${c.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-50 dark:hover:bg-white/5",
                c.active && "bg-brand-50/60 dark:bg-white/10"
              )}
            >
              <span
                aria-hidden
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand/25 text-[15px] font-bold text-brand dark:text-brand-200"
              >
                {c.initials || initialsForName(c.name)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[15px] font-bold text-ink-900 dark:text-ink-50">{c.name}</span>
                  <span className="truncate text-[13px] text-ink-500 dark:text-ink-300">{c.handle}</span>
                </span>
                <span className="block truncate text-sm text-ink-500 dark:text-ink-300">{c.preview}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[13px] text-ink-500 dark:text-ink-300">{fmtTime(c.time)}</span>
                {c.unreadCount > 0 && (
                  <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-bold text-white">
                    {c.unreadCount}
                  </span>
                )}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
