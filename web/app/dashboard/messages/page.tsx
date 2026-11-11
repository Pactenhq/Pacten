"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
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
export default function MessagesPage() {
  const { user } = useAuth();
  const myId = (user as any)?.id as string | undefined;
  const [conversations, setConversations] = useState<any[]>([]);
  const [panelMessages, setPanelMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    api
      .conversations()
      .then((data) => {
        if (Array.isArray(data)) {
          // The API answered: show EXACTLY what it returned — including
          // an empty list. The page previously kept the mock Jane Smith
          // conversations whenever the real list was empty, so real
          // accounts saw five fake duplicate conversations.
          setConversations(data.map((c: any) => mapConversation(c, myId)));
          const first = data[0];
          if (first?.id && String(first.id).length > 20) {
            // Preview prefetch for the side panel — must NOT mark the
            // thread read. Merely visiting the list must leave the
            // unread badge alone; only opening the thread marks it read.
            api
              .conversationMessages(first.id, { markRead: false })
              .then((msgs: any) => setPanelMessages(mapMessages(msgs)))
              .catch(() => setPanelMessages([]));
          } else {
            setPanelMessages([]);
          }
        }
      })
      .catch(() => {
        // API unavailable: show the empty state, never fabricated
        // conversations. Real accounts must never see mock people.
        setConversations([]);
        setPanelMessages([]);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [myId]);

  const active = conversations[0];
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
                markRead={false}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 text-center">
                <p className="text-[15px] text-ink-500 dark:text-ink-300">
                  {loading
                    ? "Loading conversations…"
                    : loadError
                      ? "Conversations couldn't be loaded. Please check your connection and refresh the page."
                      : "No conversations yet. When you message a creator or brand, the conversation will appear here."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
