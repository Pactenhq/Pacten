"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationPanel } from "@/components/messaging/ConversationPanel";
import { conversations as mockConversations, janeSmithThread } from "@/lib/mock-messages";
import { brandNav, dashboardUser } from "@/lib/mock";
import { api } from "@/lib/api";

// desktop + "mob Messages dashboard"
// (361:20232) mobile: dashboard shell with sidebar, "Messages" hero
// ("Chat with creators, manage collaborations and keep all conversations
// in one place."), conversation list + open conversation panel.
// Mobile shows the list; the panel appears on the [id] route.
export default function MessagesPage() {
  const [conversations, setConversations] = useState<any[]>(mockConversations);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .conversations()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Map API shape to the ConversationList shape, fallback to mock when empty
          setConversations(
            data.map((c: any) => {
              const other = c.participant2 ?? c.participant1;
              return {
                id: c.id,
                name: other?.name ?? other?.email ?? "User",
                avatar: other?.avatar ?? "",
                lastMessage: c.lastMessage?.content ?? "",
                time: c.lastMessage?.createdAt ?? c.updatedAt,
                unread: c.unreadCount ?? 0,
                ...c,
              };
            })
          );
        }
      })
      .catch(() => {
        // API unavailable — keep mock data
      })
      .finally(() => setLoading(false));
  }, []);

  const active = conversations[0];
  return (
    <DashboardShell
      nav={brandNav}
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
            <ConversationPanel
              conversation={active}
              initialMessages={janeSmithThread}
              conversationId={(active as any)?.id}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
