"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CampaignMessage } from "@/lib/mock-campaigns";

// Rebuilt from the  (292:12953) messages
// section and the "Management" frame (416:64240) messages section:
// "Messages" heading (blue) with a blue count badge, the dark-blue
// creator card (avatar, name, handle, "View Profile"), the "Sep 2" date
// divider, message bubbles, and the composer: "Type your message..."
// input with a paperclip icon and a "Send Message" button.
export function MessagePanel({
  title = "Messages",
  count = 0,
  dateLabel = "Sep 2",
  initialMessages,
  creatorName,
  creatorHandle,
}: {
  title?: string;
  count?: number;
  dateLabel?: string;
  initialMessages: CampaignMessage[];
  creatorName?: string;
  creatorHandle?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setMessages((m) => [
      ...m,
      { from: "You", body, time: "Now", mine: true },
    ]);
    setDraft("");
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[20px] font-bold text-brand">{title}</h2>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white">
          {count + messages.length - initialMessages.length}
        </span>
      </div>

      {creatorName && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-brand px-5 py-4">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white"
            >
              {creatorName
                .split(" ")
                .map((w) => w[0])
                .join("")}
            </span>
            <div>
              <p className="text-[15px] font-bold text-white">{creatorName}</p>
              <p className="text-[13px] text-white/80">{creatorHandle}</p>
            </div>
          </div>
          <button className="cursor-pointer rounded-lg border border-white/70 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/10">
            View Profile
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center gap-4">
        <span className="h-px flex-1 bg-ink-100" />
        <span className="text-[13px] font-medium text-ink-400">{dateLabel}</span>
        <span className="h-px flex-1 bg-ink-100" />
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.mine ? "flex flex-col items-end" : "flex flex-col items-start"}
          >
            <div
              className={
                m.mine
                  ? "max-w-[75%] rounded-2xl bg-brand-100 px-4 py-3"
                  : "max-w-[75%] rounded-2xl bg-brand-50 px-4 py-3"
              }
            >
              <p className="text-[14px] text-ink-900">{m.body}</p>
            </div>
            <p className="mt-1 text-xs text-ink-400">{m.time}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-ink-200 p-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type your message..."
          rows={3}
          className="w-full resize-none bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-end gap-3">
          <button
            aria-label="Attach file"
            className="cursor-pointer rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="m21 11-8.5 8.5a5.5 5.5 0 0 1-7.78-7.78L13 3.5a3.67 3.67 0 0 1 5.2 5.2l-8.5 8.5a1.83 1.83 0 0 1-2.6-2.6L15 6.7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Button onClick={send}>Send Message</Button>
        </div>
      </div>
    </Card>
  );
}
