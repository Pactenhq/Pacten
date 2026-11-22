"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, dashboardPathForRole } from "./AuthProvider";
import { api, type Role } from "@/lib/api";

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/30 bg-danger-bg dark:bg-danger/15 px-4 py-3 text-sm font-medium text-danger dark:text-danger-bright"
    >
      {message}
    </div>
  );
}

export function AuthNotice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
    >
      {message}
    </div>
  );
}

/** "Check your email" panel shown after signup when no dev auto-verify happened. */
export function CheckEmailNotice({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div
        role="status"
        className="w-full rounded-xl border border-brand/25 bg-brand-50 dark:bg-white/10 px-4 py-3 text-sm font-medium text-ink-900 dark:text-ink-50"
      >
        Account created for <span className="font-bold">{email}</span>. Please
        check your inbox and click the verification link, then log in.
      </div>
    </div>
  );
}

type FieldBag = Record<string, string>;

export function useLoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [values, setValues] = useState<FieldBag>({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendState, setResendState] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  // "Remember me" — checked by default, unchecked = session-only token.
  const [remember, setRemember] = useState(true);

  const field = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  const verifiedNotice =
    params.get("verified") === "1"
      ? "Your email is verified. Log in to continue."
      : null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setResendState("idle");
    setLoading(true);
    try {
      const u = await login(values.email.trim(), values.password, remember);
      router.push(dashboardPathForRole(u?.role ?? ""));
    } catch (err) {
      if ((err as { code?: string })?.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      }
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  // Resend the verification email to the address just typed in. The
  // endpoint always returns the generic message, so a failure here is
  // only a transport error.
  const resendVerification = async () => {
    setResendState("sending");
    try {
      await api.resendVerificationEmail(values.email.trim());
      setResendState("sent");
    } catch {
      setResendState("error");
    }
  };

  return { field, submit, error, loading, verifiedNotice, remember, setRemember, needsVerification, resendState, resendVerification };
}

export function useSignupForm(role: Role) {
  const { signup } = useAuth();
  const router = useRouter();
  const [values, setValues] = useState<FieldBag>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const field = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!termsAccepted) {
      setError(
        "Please confirm you are at least 18 and agree to the Terms of Service and Privacy Policy."
      );
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (values.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const ref =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref") || undefined
          : undefined;
      const { verified } = await signup({
        email: values.email.trim(),
        password: values.password,
        role,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        termsAccepted: true,
        ...(ref ? { referralCode: ref } : {}),
      });
      if (verified) router.push("/login?verified=1");
      else setCheckEmail(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return {
    field,
    submit,
    error,
    loading,
    checkEmail,
    email: values.email,
    termsAccepted,
    setTermsAccepted,
  };
}
