/* ------------------------------------------------------------------ */
/* Messaging + Contracts mock data — copy      */
/* layout page (fileKey eHdTsQ2PCrvYzuG9qhvyXr): "Messages dashboard"   */
/* (360:19583), "inbox" (411:59061), "Contract" (394:50351),           */
/* "Contract creator" (394:52430).                                     */
/*                                                                     */

/* times (design placeholder repetition). The first row/bubble is kept */
/* verbatim; the rest are realistic mock entries, marked APPROX below. */
/* ------------------------------------------------------------------ */

export interface ConversationPreview {
  id: string;
  name: string;
  handle: string;
  initials: string;
  preview: string;
  time: string;
  unreadCount: number;
  active?: boolean;
  // The other party's user id + role (set by mapConversation for real
  // conversations). The thread header's "View Profile" button needs
  // them to resolve the public profile; mock rows carry neither, so
  // the button hides for them instead of linking nowhere.
  otherUserId?: string | null;
  otherRole?: string | null;
}

export interface ChatMessage {
  id: string;
  from: "them" | "me";
  body: string;
  time: string;
}

/* ------------------------------------------------------------------ */
/* Contract Centre                                                     */
/* ------------------------------------------------------------------ */

export interface ContractStat {
  value: string;
  label: string;
  description: string;
  delta: string;
}

export type ContractStatus =
  | "Draft"
  | "Awaiting Signature"
  | "Completed"
  | "Expired"
  | "Cancelled"
  | "Signed";

export interface ContractRow {
  id: string;
  title: string;
  client: string;
  submittedLabel: string;
  submittedDate: string;
  deadlineDate: string;
  status: ContractStatus;
}

export const contractTabs: ContractStatus[] = [
  "Draft",
  "Awaiting Signature",
  "Expired",
  "Cancelled",
  "Completed",
  "Signed",
];

/** Brand Contract Centre summary cards —  "Contract"
 * (394:50351): the same four cards as the creator variant. */
export interface ContractTemplate {
  id: string;
  name: string;
  updated: string;
}

