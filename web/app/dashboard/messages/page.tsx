"use client";

export const dynamic = "force-dynamic";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { ConversationSkeleton } from "@/components/ui/Skeleton";
import { useSearchParams } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationPanel } from "@/components/messaging/ConversationPanel";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { mapConversation, mapMessages } from "@/lib/conversation-map";

// desktop + "mob Messages dashboard"
// (361:20232) mobile: dashboard shell with sidebar, "Messages" hero
// ("Chat with creators, manage collaborations and keep all conversations
// in one place."), conversation list + open conversation panel.
// Mobile shows the list; the panel appears on the [id] route.
//
// Direct-URL open: the "Message Creator / Message Professional"
// buttons link here with ?conversation=<id>. That param names the
// thread to open — and opening a thread marks it read. Merely visiting
// the list (no param) must leave the unread badge alone.
//
// useSearchParams() needs a Suspense boundary (Next.js build fails the
// prerender without one), so the page body lives in MessagesContent
// and the default export only wraps it.
function MessagesContent() {
  const { user } = useAuth();
  const myId = (user as any)?.id as string | undefined;
  const searchParams = useSearchParams();
  const paramId = searchParams.get("conversation");
  const [conversations, setConversations] = useState<any[]>([]);
  const [panelMessages, setPanelMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // The session resolves after the first render, so `myId` is kept in a
  // ref for the list refresh — the refresh must use the latest id
  // without re-running the load effect. (Same pattern as the [id] page.)
  const myIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    myIdRef.current = myId;
  }, [myId]);

  // Refresh the conversation list (unread badges) after the open thread
  // is marked read. Deliberately NOT gated by the load effect's
  // `cancelled` flag: on a direct-URL open the effect runs twice
  // (session unresolved, then resolved). The refresh is idempotent —
  // the list is re-read from the API after mark-read — so a superseded
  // run applying it is harmless.
  const refreshConversations = useCallback(() => {
    api
      .conversations()
      .catch(() => [])
      .then((fresh: any) => {
        if (Array.isArray(fresh))
          setConversations(
            fresh.map((c: any) => mapConversation(c, myIdRef.current))
          );
      });
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .conversations()
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) {
          // The API answered: show EXACTLY what it returned — including
          // an empty list.
          setConversations(data.map((c: any) => mapConversation(c, myId)));
          // ?conversation=<id> names the thread to open. Only a real
          // id that is actually in the list opens a thread — an
          // unknown/invalid param falls back to the first conversation
          // with no mark-read, exactly like a plain list visit.
          const target =
            paramId && paramId.length > 20
              ? data.find((c: any) => String(c.id) === paramId)
              : undefined;
          const first = target ?? data[0];
          if (first?.id && String(first.id).length > 20) {
            if (target) {
              // Opening the thread marks it read. The list is re-read
              // only AFTER the mark-read fetch resolves — refreshing in
              // parallel can re-read the list before the server has
              // marked the thread read, leaving a stale badge. (The
              // refresh is deliberately not gated by `cancelled`, same
              // as the [id] page: on a direct-URL open the effect runs
              // twice and the first run's cleanup must not discard it.)
              api
                .conversationMessages(first.id)
                .then((msgs: any) => {
                  if (!cancelled) setPanelMessages(mapMessages(msgs));
                  refreshConversations();
                })
                .catch(() => {
                  if (!cancelled) setPanelMessages([]);
                });
            } else {
              // Preview prefetch for the side panel — must NOT mark the
              // thread read. Merely visiting the list must leave the
              // unread badge alone; only opening the thread marks it read.
              api
                .conversationMessages(first.id, { markRead: false })
                .then((msgs: any) => {
                  if (!cancelled) setPanelMessages(mapMessages(msgs));
                })
                .catch(() => {
                  if (!cancelled) setPanelMessages([]);
                });
            }
          } else {
            setPanelMessages([]);
          }
        }
      })
      .catch(() => {
        // API unavailable: show the empty state, never fabricated
        // conversations. Real accounts must never see mock people.
        if (cancelled) return;
        setConversations([]);
        setPanelMessages([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [myId, paramId, refreshConversations]);

  // The ?conversation= thread, when it is in the list — otherwise the
  // first conversation, exactly as before.
  const paramTarget =
    paramId && paramId.length > 20
      ? conversations.find((c: any) => String((c as any).id) === paramId)
      : undefined;
  const active = paramTarget ?? conversations[0];
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;
  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <WelcomeHeader
          title="Messages"
          subtitle="Chat with creators, manage collaborations and keep all conversations in one place."
        />
        <div className="grid gap-6 lg:grid-cols-[443px_minmax(0,1fr)]">
          <ConversationList conversations={conversations} basePath="/dashboard/messages" />
          <div className="hidden lg:block">
            {active ? (
              <ConversationPanel
                conversation={active}
                initialMessages={panelMessages}
                conversationId={(active as any)?.id}
                // Only a thread opened via ?conversation= marks read;
                // the plain list visit keeps the preview read-only.
                markRead={!!paramTarget}
              />
            ) : loading ? (
              <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
                <ConversationSkeleton rows={4} />
              </div>
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 text-center">
                <p className="text-[15px] text-ink-500 dark:text-ink-300">
                  {loadError
                    ? "Conversations couldn't be loaded. Please check your connection and refresh the page."
                    : "No conversations yet. When you message a creator or business, the conversation will appear here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <ConversationSkeleton rows={4} />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
