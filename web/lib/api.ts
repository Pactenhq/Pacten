// API client for the Pacten backend (Phase 1: auth + profiles).
// Base URL is baked at build time from NEXT_PUBLIC_API_URL.

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

const TOKEN_KEY = "pacten_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable */
  }
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

export async function apiFetch<T = any>(
  path: string,
  { method = "GET", body, auth = false, headers: extraHeaders }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(extraHeaders ?? {}),
  };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Could not reach the Pacten server. Please check your connection and try again."
    );
  }
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : Array.isArray(data?.message)
          ? data.message.join(", ")
          : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export type Role = "brand" | "creator" | "professional" | "admin";

export const api = {
  signup: (d: {
    email: string;
    password: string;
    role: Role;
    firstName: string;
    lastName: string;
    companyName?: string;
    displayName?: string;
    referralCode?: string;
  }) => apiFetch("/auth/signup", { method: "POST", body: d }),

  verifyEmail: (token: string) =>
    apiFetch(`/auth/verify?token=${encodeURIComponent(token)}`),

  login: (d: { email: string; password: string }) =>
    apiFetch<{ accessToken: string; user: any }>("/auth/login", {
      method: "POST",
      body: d,
    }),

  me: () => apiFetch<any>("/users/me", { auth: true }),

  myProfile: () => apiFetch<any>("/profiles/me", { auth: true }),

  updateProfile: (d: Record<string, unknown>) =>
    apiFetch<any>("/profiles/me", { method: "PATCH", body: d, auth: true }),

  creators: (params = "") => apiFetch<any[]>(`/profiles/creators${params}`),

  creatorProfile: (id: string) => apiFetch<any>(`/profiles/creators/${id}`),

  professionals: (params = "") =>
    apiFetch<any[]>(`/profiles/professionals${params}`),

  professionalProfile: (id: string) =>
    apiFetch<any>(`/profiles/professionals/${id}`),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string; resetToken?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, newPassword },
    }),

  // Campaigns
  campaigns: (params = "") => apiFetch<any[]>(`/campaigns${params}`),

  campaignDetail: (id: string) => apiFetch<any>(`/campaigns/${id}`),

  myCampaigns: () => apiFetch<any[]>("/campaigns/mine", { auth: true }),

  createCampaign: (d: Record<string, unknown>) =>
    apiFetch<any>("/campaigns", { method: "POST", body: d, auth: true }),

  updateCampaign: (id: string, d: Record<string, unknown>) =>
    apiFetch<any>(`/campaigns/${id}`, {
      method: "PATCH",
      body: d,
      auth: true,
    }),

  deleteCampaign: (id: string) =>
    apiFetch<any>(`/campaigns/${id}`, { method: "DELETE", auth: true }),

  // Applications
  applyToCampaign: (campaignId: string, d: Record<string, unknown>) =>
    apiFetch<any>(`/campaigns/${campaignId}/apply`, {
      method: "POST",
      body: d,
      auth: true,
    }),

  campaignApplications: (campaignId: string) =>
    apiFetch<any[]>(`/campaigns/${campaignId}/applications`, { auth: true }),

  myApplications: () =>
    apiFetch<any[]>("/campaigns/applications/mine", { auth: true }),

  receivedApplications: async () => {
    const campaigns = await apiFetch<any[]>("/campaigns/mine", { auth: true });
    if (!Array.isArray(campaigns)) return [];
    const all: any[] = [];
    for (const c of campaigns) {
      try {
        const apps = await apiFetch<any[]>(`/campaigns/${c.id}/applications`, {
          auth: true,
        });
        if (Array.isArray(apps)) {
          apps.forEach((a: any) => all.push({ ...a, campaign: c }));
        }
      } catch {
        // skip campaigns with no access
      }
    }
    return all;
  },

  updateApplicationStatus: (appId: string, status: string) =>
    apiFetch<any>(`/campaigns/applications/${appId}/status`, {
      method: "PATCH",
      body: { status },
      auth: true,
    }),

  withdrawApplication: (appId: string) =>
    apiFetch<any>(`/campaigns/applications/${appId}`, {
      method: "DELETE",
      auth: true,
    }),

  // Direct opportunities (M2): brand → creator/professional
  sendOpportunity: (d: {
    recipientId: string;
    title: string;
    description?: string;
    budget?: string;
  }) => apiFetch<any>(`/opportunities`, { method: "POST", body: d, auth: true }),

  sentOpportunities: () => apiFetch<any[]>(`/opportunities/sent`, { auth: true }),

  receivedOpportunities: () =>
    apiFetch<any[]>(`/opportunities/received`, { auth: true }),

  respondOpportunity: (id: string, action: "accept" | "decline") =>
    apiFetch<any>(`/opportunities/${id}/respond`, {
      method: "PATCH",
      body: { action },
      auth: true,
    }),

  // Messaging
  conversations: () =>
    apiFetch<any[]>("/conversations", { auth: true }),

  createConversation: (d: Record<string, unknown>) =>
    apiFetch<any>("/conversations", { method: "POST", body: d, auth: true }),

  conversationMessages: (id: string) =>
    apiFetch<any[]>(`/conversations/${id}/messages`, { auth: true }),

  sendMessage: (id: string, content: string) =>
    apiFetch<any>(`/conversations/${id}/messages`, {
      method: "POST",
      body: { content },
      auth: true,
    }),

  // Deals
  deals: () => apiFetch<any[]>("/deals", { auth: true }),

  dealDetail: (id: string) =>
    apiFetch<any>(`/deals/${id}`, { auth: true }),

  createDeal: (d: Record<string, unknown>) =>
    apiFetch<any>("/deals", { method: "POST", body: d, auth: true }),

  updateDeal: (id: string, d: Record<string, unknown>) =>
    apiFetch<any>(`/deals/${id}`, { method: "PATCH", body: d, auth: true }),

  updateDealStatus: (id: string, status: string) =>
    apiFetch<any>(`/deals/${id}/status`, {
      method: "PATCH",
      body: { status },
      auth: true,
    }),

  submitDealWork: (id: string) =>
    apiFetch<any>(`/deals/${id}/submit`, { method: "POST", auth: true }),

  approveDealWork: (id: string) =>
    apiFetch<any>(`/deals/${id}/approve`, { method: "POST", auth: true }),

  // Contracts (M4)
  contracts: () => apiFetch<any[]>("/contracts", { auth: true }),

  contractDetail: (id: string) =>
    apiFetch<any>(`/contracts/${id}`, { auth: true }),

  generateContract: (dealId: string, title?: string) =>
    apiFetch<any>(`/contracts/from-deal/${dealId}`, {
      method: "POST",
      body: title ? { title } : {},
      auth: true,
    }),

  acceptContract: (id: string) =>
    apiFetch<any>(`/contracts/${id}/accept`, {
      method: "POST",
      auth: true,
    }),

  declineContract: (id: string) =>
    apiFetch<any>(`/contracts/${id}/decline`, {
      method: "POST",
      auth: true,
    }),

  // Payments (M4, Stripe test mode)
  createUpfrontPayment: (
    dealId: string,
    d?: { amountCents?: number; currency?: string },
    idempotencyKey?: string
  ) =>
    apiFetch<any>(`/payments/upfront/${dealId}`, {
      method: "POST",
      body: d ?? {},
      auth: true,
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    }),

  demoConfirmPayment: (paymentId: string) =>
    apiFetch<any>(`/payments/${paymentId}/demo-confirm`, {
      method: "POST",
      auth: true,
    }),

  // Live mode: settle a deal payment after returning from Stripe Checkout.
  syncPayment: (paymentId: string) =>
    apiFetch<any>(`/payments/${paymentId}/sync`, {
      method: "POST",
      auth: true,
    }),

  myPayments: () => apiFetch<any[]>("/payments/my", { auth: true }),

  paymentDetail: (id: string) =>
    apiFetch<any>(`/payments/${id}`, { auth: true }),

  paymentCommission: (id: string) =>
    apiFetch<any>(`/payments/${id}/commission`, { auth: true }),

  commissionRules: () =>
    apiFetch<any[]>("/payments/commission-rules", { auth: true }),

  myPayouts: () => apiFetch<any[]>("/payments/payouts/my", { auth: true }),

  payoutForDeal: (dealId: string) =>
    apiFetch<any>(`/payments/payouts/by-deal/${dealId}`, { auth: true }),

  // Subscriptions (M4)
  subscriptionPlans: (role?: string) =>
    apiFetch<any[]>(
      role ? `/subscriptions/plans?role=${role}` : "/subscriptions/plans",
      { auth: true }
    ),

  mySubscription: () => apiFetch<any>("/subscriptions/me", { auth: true }),

  subscriptionCheckout: (planId: string) =>
    apiFetch<any>("/subscriptions/checkout", {
      method: "POST",
      body: { planId },
      auth: true,
    }),

  // Live mode: settle a subscription after returning from Stripe Checkout.
  syncSubscription: (sessionId: string) =>
    apiFetch<any>("/subscriptions/sync", {
      method: "POST",
      body: { sessionId },
      auth: true,
    }),

  cancelSubscription: () =>
    apiFetch<any>("/subscriptions/cancel", { method: "POST", auth: true }),

  // Referrals (M5)
  referralDashboard: () =>
    apiFetch<any>("/referrals/me", { auth: true }),

  referralClick: (code: string) => apiFetch<any>(`/referrals/r/${code}`),

  requestReferralPayout: (amountCents: number) =>
    apiFetch<any>("/referrals/payouts", {
      method: "POST",
      body: { amountCents },
      auth: true,
    }),

  myReferralPayouts: () =>
    apiFetch<any[]>("/referrals/payouts/me", { auth: true }),

  adminReferralPayouts: (status?: string) =>
    apiFetch<any[]>(
      status ? `/referrals/admin/payouts?status=${status}` : "/referrals/admin/payouts",
      { auth: true }
    ),

  decideReferralPayout: (id: string, approved: boolean, notes?: string) =>
    apiFetch<any>(`/referrals/admin/payouts/${id}/decide`, {
      method: "POST",
      body: { approved, notes },
      auth: true,
    }),

  // Disputes (M5)
  fileDispute: (dealId: string, reason: string, description: string) =>
    apiFetch<any>("/disputes", {
      method: "POST",
      body: { dealId, reason, description },
      auth: true,
    }),

  myDisputes: () => apiFetch<any[]>("/disputes/me", { auth: true }),

  disputeDetail: (id: string) =>
    apiFetch<any>(`/disputes/${id}`, { auth: true }),

  adminDisputes: (status?: string) =>
    apiFetch<any[]>(
      status ? `/disputes/admin/all?status=${status}` : "/disputes/admin/all",
      { auth: true }
    ),

  resolveDispute: (id: string, outcome: "resolved" | "rejected", resolution: string) =>
    apiFetch<any>(`/disputes/admin/${id}/resolve`, {
      method: "POST",
      body: { outcome, resolution },
      auth: true,
    }),

  // Admin (M5)
  adminStats: () => apiFetch<any>("/admin/stats", { auth: true }),

  adminUsers: (params?: { role?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return apiFetch<any>(`/admin/users${q ? `?${q}` : ""}`, { auth: true });
  },

  adminSetUserStatus: (id: string, status: string) =>
    apiFetch<any>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status },
      auth: true,
    }),
};

export function dashboardPathForRole(role: string): string {
  if (role === "brand") return "/dashboard/brand";
  if (role === "creator") return "/dashboard/creator";
  if (role === "professional") return "/dashboard/professional";
  return "/dashboard/brand";
}
