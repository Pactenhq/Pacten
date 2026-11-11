"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ConversationPanel } from "@/components/messaging/ConversationPanel";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/AuthProvider";
import { mapConversation, mapMessages } from "@/lib/conversation-map";

// Desktop: two-column (list + panel) — matches Figma "Messages
// dashboard" (361:20232). Mobile: panel with Back link — matches Figma
// "mob inbox" (411:59486).
// Loads the real conversation + messages from the API. Unknown ids and
// API failures show an empty/not-found state — never mock people.
// Real conversation me messages na hon to thread KHAALI dikhta hai.
export default function ConversationPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const myId = (user as any)?.id as string | undefined;
  const [conversations, setConversations] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
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
      setMessages(mine ? mapMessages(msgs) : []);
      setLoaded(true);
      // Opening the thread marked its messages read — refetch the list
      // once so the unread badge clears instead of showing the
      // load-time snapshot.
      api
        .conversations()
        .catch(() => [])
        .then((fresh: any) => {
          if (cancelled) return;
          if (Array.isArray(fresh))
            setConversations(fresh.map((c: any) => mapConversation(c, myId)));
        });
    });
    return () => {
      cancelled = true;
    };
  }, [id, myId]);

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-ink-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1380px] flex-1 px-6 py-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-[443px_minmax(0,1fr)]">
          <div className="hidden lg:block">
            <ConversationList conversations={conversations} basePath="/dashboard/messages" />
          </div>
          {loaded && !active ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-8 text-center">
              <p className="text-[15px] text-ink-500 dark:text-ink-300">
                Conversation not found. It may have been removed, or the
                link is incorrect.
              </p>
            </div>
          ) : (
            <ConversationPanel
              conversation={active ?? { id, name: "Conversation", handle: "" }}
              initialMessages={messages}
              conversationId={id}
              backHref="/dashboard/messages"
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
