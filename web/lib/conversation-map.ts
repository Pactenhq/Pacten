// Helpers that convert the conversation API shape to the UI shape.
// The other participant is whoever is NOT me — never just
// participant2, which can be the user themselves.
export function otherParticipant(c: any, myId?: string) {
  const parts = [c?.participant1, c?.participant2].filter(Boolean);
  return (
    parts.find((p: any) => !myId || String(p.id) !== String(myId)) ??
    c?.participant2 ??
    c?.participant1 ??
    {}
  );
}

export function initialsForName(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function mapConversation(c: any, myId?: string) {
  const other = otherParticipant(c, myId);
  const fullName = [other.firstName, other.lastName].filter(Boolean).join(" ");
  return {
    id: c.id,
    name: fullName || other.email || "User",
    initials: initialsForName(fullName || other.email || "User"),
    handle: other.email ? `@${String(other.email).split("@")[0]}` : "",
    avatar: other.avatar ?? "",
    // The other party's identity, for the thread header's "View Profile"
    // button: the public profile routes are keyed by PROFILE id, so the
    // panel resolves the profile via the by-user lookup. These fields are
    // what the button links to.
    otherUserId: other.id ?? null,
    otherRole: other.role ?? null,
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
