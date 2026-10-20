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
import { useAuth } from "@/components/auth/AuthProvider";
import { mapConversation, mapMessages } from "@/lib/conversation-map";

// Desktop: two-column (list + panel) — matches Figma "Messages
// dashboard" (361:20232). Mobile: panel with Back link — matches Figma
// "mob inbox" (411:59486).
// Loads the real conversation + messages from the API; falls back to
// mock data when the API is unreachable or the id is a mock id.
// Real conversation me messages na hon to thread KHAALI dikhta hai —
// pehle wahan mock Jane Smith thread aa jata tha.
export default function ConversationPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const myId = (user as any)?.id as string | undefined;
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const isMockId = !id || id.length <= 20;
    if (isMockId) {
      const conv = mockConversations.find((c) => c.id === id) ?? mockConversations[0];
      setConversations(mockConversations);
      setActive(conv);
      setMessages(janeSmithThread);
      return;
    }
    Promise.all([
      api.conversations().catch(() => []),
      api.conversationMessages(id).catch(() => []),
    ]).then(([convs, msgs]) => {
      if (cancelled) return;
      const mapped = (Array.isArray(convs) ? convs : []).map((c: any) =>
        mapConversation(c, myId)
      );
      setConversations(mapped);
      const mine = mapped.find((c: any) => c.id === id);
      setActive(mine ?? null);
      setMessages(mapMessages(msgs));
    });
    return () => {
      cancelled = true;
    };
  }, [id, myId]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="mx-auto w-full max-w-[1380px] flex-1 px-6 py-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[443px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ConversationList conversations={conversations} basePath="/dashboard/messages" />
          </div>
          <ConversationPanel
            conversation={active ?? { id, name: "Conversation", handle: "" }}
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
