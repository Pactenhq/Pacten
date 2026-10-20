"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/Button";
import type { ChatMessage, ConversationPreview } from "@/lib/mock-messages";
import { api, getToken } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";

// Open-conversation panel, rebuilt from the design "inbox" (411:59061)
// Frame 412: header (photo avatar, name/handle, filled "View Profile"
// button, kebab), "Sep 2" date divider, incoming (#ebf3ff) / outgoing
// (#d3d8f0) bubbles with timestamps, and the composer box
// ("Type your message..." + paperclip + "Send Message").
// Real conversations (UUID id) load/persist messages via the API.
// Naye messages WebSocket (socket.io) se foran aate hain; agar socket
// connect na ho sake to 5s polling fallback ke taur par chalti hai.
// Mock conversations stay client-side.

export function ConversationPanel({
  conversation,
  initialMessages,
  conversationId,
  backHref,
}: {
  conversation: ConversationPreview;
  initialMessages: ChatMessage[];
  conversationId?: string;
  backHref?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [socketOk, setSocketOk] = useState(false);
  const convId = conversationId ?? (conversation as any)?.id;
  const isReal = !!convId && convId.length > 20;
  const { user } = useAuth();
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = (user as any)?.id ?? null;
  }, [user]);

  // Keep local state in sync when the parent loads real messages
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Realtime: WebSocket connection for new messages on real conversations
  useEffect(() => {
    if (!isReal || !convId) return;
    let socket: Socket | null = null;
    try {
      const base = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"
      ).replace(/\/api\/v1\/?$/, "");
      socket = io(base, {
        auth: { token: getToken() },
        transports: ["websocket", "polling"],
      });
      socket.on("connect", () => {
        setSocketOk(true);
        socket?.emit("joinConversation", { conversationId: convId });
      });
      socket.on("disconnect", () => setSocketOk(false));
      socket.on("connect_error", () => setSocketOk(false));
      socket.on("newMessage", (m: any) => {
        if (!m || m.conversationId !== convId) return;
        setMessages((prev) => {
          // Apna bheja hua message (optimistic) dobara add na ho
          if (prev.some((x) => String(x.id) === String(m.id))) return prev;
          const mine =
            m.senderId &&
            userIdRef.current &&
            String(m.senderId) === String(userIdRef.current);
          return [
            ...prev,
            {
              id: m.id,
              from: mine ? "me" : "them",
              body: m.content,
              time: m.createdAt ?? "",
            },
          ];
        });
      });
    } catch {
      setSocketOk(false);
    }
    return () => {
      try {
        socket?.disconnect();
      } catch {
        /* ignore */
      }
      setSocketOk(false);
    };
  }, [isReal, convId]);

  // Fallback polling — sirf jab WebSocket connected na ho
  useEffect(() => {
    if (!isReal || !convId || socketOk) return;
    const poll = () => {
      api
        .conversationMessages(convId)
        .then((msgs: any[]) => {
          if (Array.isArray(msgs) && msgs.length > 0) {
            setMessages(
              msgs.map((m: any) => ({
                id: m.id,
                from: m.isMine ? "me" : "them",
                body: m.content,
                time: m.createdAt ?? "",
              }))
            );
          }
        })
        .catch(() => {});
    };
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [isReal, convId, socketOk]);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    if (isReal && convId) {
      api
        .sendMessage(convId, body)
        .then((m: any) => {
          setMessages((prev) => [
            ...prev,
            {
              id: m?.id ?? `m-${Date.now()}`,
              from: "me",
              body: m?.content ?? body,
              time: m?.createdAt ?? "now",
            },
          ]);
        })
        .catch(() => {
          // API unavailable — keep client-side only
          setMessages((prev) => [
            ...prev,
            { id: `m-${Date.now()}`, from: "me", body, time: "now" },
          ]);
        });
    } else {
      setMessages((m) => [
        ...m,
        { id: `m-${Date.now()}`, from: "me", body, time: "now" },
      ]);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back to conversations"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-50 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
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
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-ink-900">{conversation.name}</span>
            <span className="block truncate text-[13px] text-ink-500">{conversation.handle}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="md">View Profile</Button>
          <button
            aria-label="Conversation options"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-700 hover:bg-ink-50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <circle cx="12" cy="5" r="1.8" />
              <circle cx="12" cy="12" r="1.8" />
              <circle cx="12" cy="19" r="1.8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thread */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="flex items-center gap-3">
          <hr className="flex-1 border-ink-100" />
          <span className="text-[13px] font-medium text-ink-500">Sep 2</span>
          <hr className="flex-1 border-ink-100" />
        </div>
        {messages.map((m) =>
          m.from === "them" ? (
            <div key={m.id} className="flex max-w-[75%] flex-col gap-1 self-start">
              <div className="rounded-2xl rounded-tl-md bg-[#ebf3ff] px-4 py-3 text-[15px] text-ink-900">
                {m.body}
              </div>
              <span className="text-xs text-ink-500">{m.time}</span>
            </div>
          ) : (
            <div key={m.id} className="flex max-w-[75%] flex-col items-end gap-1 self-end">
              <div className="rounded-2xl rounded-tr-md bg-[#d3d8f0] px-4 py-3 text-[15px] text-ink-900">
                {m.body}
              </div>
              <span className="text-xs text-ink-500">{m.time}</span>
            </div>
          )
        )}
      </div>

      {/* Composer — bordered box with textarea, paperclip, Send Message */}
      <div className="p-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type your message..."
            aria-label="Type your message"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] text-ink-900 outline-none placeholder:text-ink-400"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              aria-label="Attach a file"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-400 hover:bg-ink-50"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="m21 11-8.5 8.5a5.5 5.5 0 0 1-7.78-7.78L13 3.5a3.67 3.67 0 0 1 5.19 5.19l-8.25 8.25a1.83 1.83 0 0 1-2.6-2.6L14.5 7.2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <Button size="lg" onClick={send} className="shrink-0">
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
