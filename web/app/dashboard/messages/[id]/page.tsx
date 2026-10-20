"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationPanel } from "@/components/messaging/ConversationPanel";
import { conversations as mockConversations, janeSmithThread } from "@/lib/mock-messages";
import { api } from "@/lib/api";

// Desktop: two-column (list + panel) — matches Figma "Messages
// dashboard" (361:20232). Mobile: panel with Back link — matches Figma
// "mob inbox" (411:59486).
// Loads the real conversation + messages from the API; falls back to
// mock data when the API is unreachable or the id is a mock id.
export default function ConversationPage() {
  const { id } = useParams() as { id: string };
  const [conversations, setConversations] = useState<any[]>(mockConversations);
  const [active, setActive] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>(janeSmithThread);

  useEffect(() => {
    let cancelled = false;
    const isMockId = !id || id.length <= 20;
    if (isMockId) {
      const conv = mockConversations.find((c) => c.id === id) ?? mockConversations[0];
      setActive(conv);
      setMessages(janeSmithThread);
      return;
    }
    Promise.all([
      api.conversations().catch(() => []),
      api.conversationMessages(id).catch(() => []),
    ]).then(([convs, msgs]) => {
      if (cancelled) return;
      if (Array.isArray(convs) && convs.length > 0) {
        setConversations(
          convs.map((c: any) => {
            const other = c.participant2 ?? c.participant1 ?? {};
            return {
              id: c.id,
              name: other?.name ?? other?.email ?? "User",
              handle: other?.email ? `@${String(other.email).split("@")[0]}` : "",
              avatar: other?.avatar ?? "",
              preview: c.lastMessage?.content ?? "",
              time: c.lastMessage?.createdAt ?? c.updatedAt ?? "",
              unreadCount: c.unreadCount ?? 0,
            };
          })
        );
      }
      const conv = (Array.isArray(convs) ? convs : []).find((c: any) => c.id === id);
      if (conv) {
        const other = conv.participant2 ?? conv.participant1 ?? {};
        setActive({
          id: conv.id,
          name: other?.name ?? other?.email ?? "User",
          handle: other?.email ? `@${String(other.email).split("@")[0]}` : "",
        });
      } else {
        setActive(mockConversations[0]);
      }
      if (Array.isArray(msgs) && msgs.length > 0) {
        setMessages(
          msgs.map((m: any) => ({
            id: m.id,
            from: m.isMine ? "me" : "them",
            body: m.content,
            time: m.createdAt ?? "",
          }))
        );
      } else {
        setMessages(janeSmithThread);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1380px] flex-1 px-6 py-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[443px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ConversationList conversations={conversations} basePath="/dashboard/messages" />
          </div>
          <ConversationPanel
            conversation={active ?? mockConversations[0]}
            initialMessages={messages}
            conversationId={id}
            backHref="/dashboard/messages"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
