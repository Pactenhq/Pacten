"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  api,
  dashboardPathForRole,
  getToken,
  setToken,
  type Role,
} from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  status: string;
} | null;

type AuthContextValue = {
  user: AuthUser;
  profile: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  signup: (d: {
    email: string;
    password: string;
    role: Role;
    firstName: string;
    lastName: string;
  }) => Promise<{ verified: boolean }>;
  logout: () => void;
  refresh: () => Promise<void>;
  displayName: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function nameFrom(user: AuthUser, profile: any): string {
  if (!user) return "";
  if (profile) {
    if (user.role === "brand" && profile.companyName) return profile.companyName;
    if (profile.displayName) return profile.displayName;
  }
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.me();
      const u = (me?.user ?? me) as AuthUser;
      setUser(u);
      try {
        setProfile(await api.myProfile());
      } catch {
        setProfile(null);
      }
    } catch {
      setToken(null);
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login({ email, password });
    setToken(data.accessToken);
    const u = data.user as AuthUser;
    setUser(u);
    try {
      setProfile(await api.myProfile());
    } catch {
      setProfile(null);
    }
    return u;
  }, []);

  const signup = useCallback(
    async (d: {
      email: string;
      password: string;
      role: Role;
      firstName: string;
      lastName: string;
    }) => {
      const data = await api.signup(d);
      // Dev-mode: the API returns the verification token directly
      // (no email is sent yet). Auto-verify so the flow is testable.
      if (data?.verificationToken) {
        try {
          await api.verifyEmail(data.verificationToken);
          return { verified: true };
        } catch {
          return { verified: false };
        }
      }
      return { verified: false };
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setProfile(null);
    router.push("/");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      login,
      signup,
      logout,
      refresh,
      displayName: nameFrom(user, profile),
    }),
    [user, profile, loading, login, signup, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user) router.replace("/login");
  }, [auth.loading, auth.user, router]);
  return auth;
}

export { dashboardPathForRole };
