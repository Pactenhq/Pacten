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
}

export const conversations: ConversationPreview[] = [
  {
    //  "Messages dashboard" (360:19583): all five
    // rows are identical Jane Smith entries
    id: "jane-smith",
    name: "Jane Smith",
    handle: "@janesmith",
    initials: "JS",
    preview: "Hey! I’m interested in this campaign...",
    time: "10:24 AM",
    unreadCount: 1,
    active: true,
  },
  {
    id: "jane-smith-2",
    name: "Jane Smith",
    handle: "@janesmith",
    initials: "JS",
    preview: "Hey! I’m interested in this campaign...",
    time: "Yesterday",
    unreadCount: 1,
  },
  {
    id: "jane-smith-3",
    name: "Jane Smith",
    handle: "@janesmith",
    initials: "JS",
    preview: "Hey! I’m interested in this campaign...",
    time: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "jane-smith-4",
    name: "Jane Smith",
    handle: "@janesmith",
    initials: "JS",
    preview: "Hey! I’m interested in this campaign...",
    time: "Yesterday",
    unreadCount: 0,
  },
  {
    id: "jane-smith-5",
    name: "Jane Smith",
    handle: "@janesmith",
    initials: "JS",
    preview: "Hey! I’m interested in this campaign...",
    time: "10/08",
    unreadCount: 0,
  },
];

export interface ChatMessage {
  id: string;
  from: "them" | "me";
  body: string;
  time: string;
}

export const janeSmithThread: ChatMessage[] = [
  //  "Messages dashboard" (360:19583): the design
  // repeats the same bubble four times, alternating sides
  { id: "m1", from: "them", body: "Hey! I’m interested in this campaign...", time: "10:24 AM" },
  { id: "m2", from: "me", body: "Hey! I’m interested in this campaign...", time: "10:24 AM" },
  { id: "m3", from: "them", body: "Hey! I’m interested in this campaign...", time: "10:24 AM" },
  { id: "m4", from: "me", body: "Hey! I’m interested in this campaign...", time: "10:24 AM" },
];

/* ------------------------------------------------------------------ */
/* Contract Centre                                                     */
/* ------------------------------------------------------------------ */

export interface ContractStat {
  value: string;
  label: string;
  description: string;
  delta: string;
}

export const contractStats: ContractStat[] = [
  // All four cards  (394:50490–394:50530)
  { value: "0", label: "Total Sent", description: "Contracts sent to clients", delta: "+0% ↗" },
  { value: "0", label: "Signed", description: "Completed and signed", delta: "+0% ↗" },
  { value: "0", label: "Declined", description: "Not accepted", delta: "+0% ↗" },
  { value: "0", label: "Awaiting Signature", description: "Waiting for client action", delta: "+0% ↗" },
];

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

export const contractRows: ContractRow[] = [
  //  "Contract" (394:50351): the design repeats the
  // same row four times, one per status. "Submitted" is the design
  // spelling, reproduced as-is
  {
    id: "contract-draft",
    title: "Influencer Campaign Agreement",
    client: "Client Name",
    submittedLabel: "Submitted",
    submittedDate: "Apr 12, 2024",
    deadlineDate: "Nov 2, 2026",
    status: "Draft",
  },
  {
    id: "contract-awaiting",
    title: "Influencer Campaign Agreement",
    client: "Client Name",
    submittedLabel: "Submitted",
    submittedDate: "Apr 12, 2024",
    deadlineDate: "Nov 2, 2026",
    status: "Awaiting Signature",
  },
  {
    id: "contract-completed",
    title: "Influencer Campaign Agreement",
    client: "Client Name",
    submittedLabel: "Submitted",
    submittedDate: "Apr 12, 2024",
    deadlineDate: "Nov 2, 2026",
    status: "Completed",
  },
  {
    id: "contract-expired",
    title: "Influencer Campaign Agreement",
    client: "Client Name",
    submittedLabel: "Submitted",
    submittedDate: "Apr 12, 2024",
    deadlineDate: "Nov 2, 2026",
    status: "Expired",
  },
];

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
export const brandContractStats: ContractStat[] = [
  { value: "0", label: "Total Sent", description: "Contracts sent to clients", delta: "+0% ↗" },
  { value: "0", label: "Signed", description: "Completed and signed", delta: "+0% ↗" },
  { value: "0", label: "Declined", description: "Not accepted", delta: "+0% ↗" },
  { value: "0", label: "Awaiting Signature", description: "Waiting for client action", delta: "+0% ↗" },
];

export interface ContractTemplate {
  id: string;
  name: string;
  updated: string;
}

export const contractTemplates: ContractTemplate[] = [
  //  (394:52335)
  { id: "influencer-template", name: "Influencer Template", updated: "Mar 10, 2026" },
];
