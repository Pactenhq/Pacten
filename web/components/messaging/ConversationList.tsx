import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";
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
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="flex items-center gap-3 border-b border-ink-100 p-4">
        <div className="flex h-[50px] flex-1 items-center gap-2 rounded-xl bg-ink-50 px-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-ink-500">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            aria-label="Search conversations"
            className="w-full bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-500"
          />
        </div>
        {/* Filter control */}
        <select
          aria-label="Filter conversations"
          className="h-[50px] shrink-0 rounded-xl border border-ink-100 bg-white px-3 text-sm font-medium text-ink-700 outline-none"
          defaultValue="all"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <hr className="border-ink-100" />}
            <Link
              href={`${basePath}/${c.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-ink-50",
                c.active && "bg-brand-50/60"
              )}
            >
              <span
                aria-hidden
                className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-brand-100"
              >
                <Image
                  src="/assets/messages/jane-smith.png"
                  alt=""
                  fill
                  sizes="52px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[15px] font-bold text-ink-900">{c.name}</span>
                  <span className="truncate text-[13px] text-ink-500">{c.handle}</span>
                </span>
                <span className="block truncate text-sm text-ink-500">{c.preview}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[13px] text-ink-500">{fmtTime(c.time)}</span>
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
