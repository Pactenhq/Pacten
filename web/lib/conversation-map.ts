// Conversation API shape ko UI shape me badalne wale helpers.
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
