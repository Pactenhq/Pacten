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
import { useAuth } from "@/components/auth/AuthProvider";

// Doosra participant = jo main NAHI hun. Pehle code hamesha
// participant2 utha leta tha — jo user khud participant2 ho
// (doosre ne conversation shuru ki ho) use apna hi email
// partner ke taur par nazar aata tha.
export function otherParticipant(c: any, myId?: string) {
  const parts = [c?.participant1, c?.participant2].filter(Boolean);
  return (
    parts.find((p: any) => !myId || String(p.id) !== String(myId)) ??
    c?.participant2 ??
    c?.participant1 ??
    {}
  );
}

export function mapConversation(c: any, myId?: string) {
  const other = otherParticipant(c, myId);
  const fullName = [other.firstName, other.lastName].filter(Boolean).join(" ");
  return {
    id: c.id,
    name: fullName || other.email || "User",
    handle: other.email ? `@${String(other.email).split("@")[0]}` : "",
    avatar: other.avatar ?? "",
    preview: c.lastMessage?.content ?? "",
    lastMessage: c.lastMessage?.content ?? "",
    time: c.lastMessage?.createdAt ?? c.updatedAt ?? "",
    unread: c.unreadCount ?? 0,
    unreadCount: c.unreadCount ?? 0,
  };
}

export function mapMessages(msgs: any) {
  return (Array.isArray(msgs) ? msgs : []).map((m: any) => ({
    id: m.id,
    from: m.isMine ? "me" : "them",
    body: m.content,
    time: m.createdAt ?? "",
  }));
}

// desktop + "mob Messages dashboard"
// (361:20232) mobile: dashboard shell with sidebar, "Messages" hero
// ("Chat with creators, manage collaborations and keep all conversations
// in one place."), conversation list + open conversation panel.
// Mobile shows the list; the panel appears on the [id] route.
export default function MessagesPage() {
  const { user } = useAuth();
  const myId = (user as any)?.id as string | undefined;
  const [conversations, setConversations] = useState<any[]>(mockConversations);
  const [panelMessages, setPanelMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .conversations()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setConversations(data.map((c: any) => mapConversation(c, myId)));
          // Desktop panel pehli (real) conversation ke ASLI messages
          // dikhaye — pehle yahan hamesha mock Jane Smith thread
          // render hota tha.
          const first = data[0];
          if (first?.id && String(first.id).length > 20) {
            api
              .conversationMessages(first.id)
              .then((msgs: any) => setPanelMessages(mapMessages(msgs)))
              .catch(() => setPanelMessages([]));
          } else {
            setPanelMessages(janeSmithThread);
          }
        } else {
          // Koi real conversation nahi — mock demo thread rehne do
          setPanelMessages(janeSmithThread);
        }
      })
      .catch(() => {
        // API unavailable — keep mock data
        setPanelMessages(janeSmithThread);
      })
      .finally(() => setLoading(false));
  }, [myId]);

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
              initialMessages={panelMessages}
              conversationId={(active as any)?.id}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
