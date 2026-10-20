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
};

export async function apiFetch<T = any>(
  path: string,
  { method = "GET", body, auth = false }: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
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

export type Role = "brand" | "creator" | "professional";

export const api = {
  signup: (d: {
    email: string;
    password: string;
    role: Role;
    firstName: string;
    lastName: string;
    companyName?: string;
    displayName?: string;
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

  // Messaging (M3)
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

  // Deals (M3)
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
};

export function dashboardPathForRole(role: string): string {
  if (role === "brand") return "/dashboard/brand";
  if (role === "creator") return "/dashboard/creator";
  if (role === "professional") return "/dashboard/professional";
  return "/dashboard/brand";
}
