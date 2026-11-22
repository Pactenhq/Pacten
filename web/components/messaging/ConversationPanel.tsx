"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { Button } from "@/components/ui/Button";
import type { ChatMessage, ConversationPreview } from "@/lib/mock-messages";
import { api, getToken } from "@/lib/api";
import { initialsForName } from "@/lib/conversation-map";
import { useAuth } from "@/components/auth/AuthProvider";

// Open-conversation panel: header (photo avatar, name/handle, filled
// "View Profile" button, kebab), date divider showing the FIRST
// message's real date, incoming / outgoing bubbles with timestamps,
// and the composer box ("Type your message..." + paperclip + "Send
// Message"). Real conversations (UUID id) load/persist messages via
// the API. New messages arrive over WebSocket (socket.io), with a 5s
// polling fallback if the socket cannot connect. Mock conversations
// stay client-side.

// Format an ISO timestamp as a design-style time ("10:24 AM");
// strings already in display format ("now", "10:24 AM") pass
// through unchanged.
export function fmtTime(t: string): string {
  if (!t) return "";
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) {
    const d = new Date(t);
    if (!isNaN(d.getTime()))
      return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return t;
}

// Format an ISO timestamp as a design-style date ("Nov 11"). Strings
// already in display format ("now") mean today's date — an optimistic
// message or a legacy display string.
export function fmtDate(t: string): string {
  let d: Date | null = null;
  if (/^\d{4}-\d{2}-\d{2}T/.test(t)) {
    const parsed = new Date(t);
    if (!isNaN(parsed.getTime())) d = parsed;
  }
  if (!d) d = new Date();
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function ConversationPanel({
  conversation,
  initialMessages,
  conversationId,
  backHref,
  markRead = true,
}: {
  conversation: ConversationPreview;
  initialMessages: ChatMessage[];
  conversationId?: string;
  backHref?: string;
  // List-page preview panel: false — polling must not mark the thread
  // read while the user is only looking at the list. Thread page: true.
  markRead?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sendError, setSendError] = useState("");
  const [socketOk, setSocketOk] = useState(false);
  const [resolvingProfile, setResolvingProfile] = useState(false);
  const router = useRouter();
  const convId = conversationId ?? (conversation as any)?.id;
  const isReal = !!convId && convId.length > 20;
  const { user } = useAuth();
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = (user as any)?.id ?? null;
  }, [user]);

  // Keep local state in sync when the parent loads real messages —
  useEffect(() => {
    setMessages((prev) => {
      const incoming = initialMessages ?? [];
      const keptTemps = prev.filter(
        (m) =>
          String(m.id).startsWith("m-") &&
          !incoming.some((im: any) => im.from === "me" && im.body === m.body)
      );
      const sameOrder =
        prev.length === incoming.length &&
        prev.every((p, i) => String(p.id) === String((incoming[i] as any).id));
      if (keptTemps.length === 0 && sameOrder) return prev;
      const byId = new Map(prev.map((m) => [String(m.id), m]));
      return [
        ...incoming.map((m: any) => byId.get(String(m.id)) ?? m),
        ...keptTemps,
      ];
    });
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
          // Don't add our own sent (optimistic) message twice
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
        .conversationMessages(convId, { markRead })
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
  }, [isReal, convId, socketOk, markRead]);

  // "View Profile": the other party's PUBLIC profile lives at
  // /creators/[profileId] or /professionals/[profileId] — keyed by PROFILE
  // id, while the conversation only carries the other party's USER id — so
  // the profile id is resolved through the by-user lookup before
  // navigating. There is NO public brand profile route (no /brands/[id]
  // page exists), and mock conversations carry no other-party identity at
  // all, so for a brand counterpart — or when the identity/role is unknown
  // — the button is hidden instead of linking to a route that does not
  // exist. A missing public profile (lookup 404, e.g. role without a
  // completed profile) also hides the button rather than landing on a
  // "not found" page.
  const otherUserId = (conversation as any)?.otherUserId as string | null | undefined;
  const otherRole = (conversation as any)?.otherRole as string | null | undefined;
  const viewProfileKind =
    otherUserId && otherRole === "creator"
      ? "creator"
      : otherUserId && otherRole === "professional"
        ? "professional"
        : null;
  const viewProfile = async () => {
    if (!viewProfileKind || !otherUserId || resolvingProfile) return;
    setResolvingProfile(true);
    try {
      const profile =
        viewProfileKind === "creator"
          ? await api.creatorProfileByUser(otherUserId)
          : await api.professionalProfileByUser(otherUserId);
      if (profile?.id) {
        router.push(
          viewProfileKind === "creator"
            ? `/creators/${profile.id}`
            : `/professionals/${profile.id}`
        );
      }
    } catch {
      // No public profile for this user — stay on the thread; the
      // button stays put and a retry is harmless.
    } finally {
      setResolvingProfile(false);
    }
  };

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setSendError("");
    if (isReal && convId) {
      const tempId = `m-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        { id: tempId, from: "me", body, time: "now" },
      ]);
      api
        .sendMessage(convId, body)
        .then((m: any) => {
          setMessages((prev) => {
            // The WebSocket broadcast can arrive before the REST
            // response — if the socket already added the message, don't
            // add it again; the temp row is then dropped.
            if (m?.id && prev.some((x) => String(x.id) === String(m.id)))
              return prev.filter((x) => String(x.id) !== tempId);
            return prev.map((x) =>
              String(x.id) === tempId
                ? {
                    id: m?.id ?? tempId,
                    from: "me",
                    body: m?.content ?? body,
                    time: m?.createdAt ?? "now",
                  }
                : x
            );
          });
        })
        .catch((err: any) => {
          // Free-plan message cap: surface the limit, don't fake the send.
          if (String(err?.message || "").includes("Free plan limit")) {
            setSendError(err.message);
            setDraft(body);
            // The optimistic bubble never happened — drop it.
            setMessages((prev) => prev.filter((x) => String(x.id) !== tempId));
            return;
          }
          // API unavailable — the optimistic bubble stays as the
          // client-side copy (previous behaviour, now immediate).
        });
    } else {
      setMessages((m) => [
        ...m,
        { id: `m-${Date.now()}`, from: "me", body, time: "now" },
      ]);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 dark:border-ink-800 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back to conversations"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5 lg:hidden"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <span
            aria-hidden
            className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand/25 text-[15px] font-bold text-brand dark:text-brand-200"
          >
            {initialsForName(conversation.name)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-ink-900 dark:text-ink-50">{conversation.name}</span>
            <span className="block truncate text-[13px] text-ink-500 dark:text-ink-300">{conversation.handle}</span>
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {viewProfileKind && (
            <Button size="md" onClick={viewProfile} disabled={resolvingProfile}>
              {resolvingProfile ? "Opening…" : "View Profile"}
            </Button>
          )}
          <button
            aria-label="Conversation options"
            className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-700 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-white/5"
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
        {messages.length > 0 && (
          <div className="flex items-center gap-3">
            <hr className="flex-1 border-ink-100 dark:border-ink-800" />
            <span className="text-[13px] font-medium text-ink-500 dark:text-ink-300">{fmtDate(messages[0].time)}</span>
            <hr className="flex-1 border-ink-100 dark:border-ink-800" />
          </div>
        )}
        {messages.map((m) =>
          m.from === "them" ? (
            <div key={m.id} className="flex max-w-[75%] flex-col gap-1 self-start">
              <div className="rounded-2xl rounded-tl-md bg-[#ebf3ff] dark:bg-ink-800 px-4 py-3 text-[15px] text-ink-900 dark:text-ink-50">
                {m.body}
              </div>
              <span className="text-xs text-ink-500 dark:text-ink-300">{fmtTime(m.time)}</span>
            </div>
          ) : (
            <div key={m.id} className="flex max-w-[75%] flex-col items-end gap-1 self-end">
              <div className="rounded-2xl rounded-tr-md bg-[#d3d8f0] dark:bg-brand/25 px-4 py-3 text-[15px] text-ink-900 dark:text-ink-50">
                {m.body}
              </div>
              <span className="text-xs text-ink-500 dark:text-ink-300">{fmtTime(m.time)}</span>
            </div>
          )
        )}
      </div>

      {sendError && (
        <p className="mx-4 mb-2 rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700">
          {sendError}
        </p>
      )}
      {/* Composer — bordered box with textarea, paperclip, Send Message */}
      <div className="p-4">
        <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-4">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            placeholder="Type your message..."
            aria-label="Type your message"
            rows={3}
            className="w-full resize-none bg-transparent text-[15px] text-ink-900 dark:text-ink-50 outline-none placeholder:text-ink-400 dark:placeholder:text-ink-300"
          />
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              aria-label="Attach a file"
              className="cursor-pointer inline-flex h-11 w-11 items-center justify-center rounded-xl text-ink-400 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-white/5"
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
