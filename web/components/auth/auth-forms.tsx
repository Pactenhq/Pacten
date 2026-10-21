"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, dashboardPathForRole } from "./AuthProvider";
import type { Role } from "@/lib/api";

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm font-medium text-danger"
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
        className="w-full rounded-xl border border-brand/25 bg-brand-50 px-4 py-3 text-sm font-medium text-ink-900"
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
    setLoading(true);
    try {
      const u = await login(values.email.trim(), values.password);
      router.push(dashboardPathForRole(u?.role ?? ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return { field, submit, error, loading, verifiedNotice };
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

  const field = (name: string) => ({
    name,
    value: values[name] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
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
      // Referral attribution (M5): ?ref=CODE on the signup URL.
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

  return { field, submit, error, loading, checkEmail, email: values.email };
}
