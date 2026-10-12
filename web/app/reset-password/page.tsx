"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }
    if (!token) {
      setMessage("Missing reset token");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await api.resetPassword(token, password);
      setStatus("done");
    } catch (err: any) {
      setMessage(err.message || "Invalid or expired link");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <Card className="w-full max-w-[480px] p-8 text-center shadow-pop sm:p-10">
        <h1 className="text-3xl font-extrabold text-ink-900">Password reset!</h1>
        <p className="mt-3 text-ink-500">You can now log in with your new password.</p>
        <Link href="/login" className="mt-6 block">
          <Button size="lg" className="w-full">Go to login</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="fade-up fade-up-2 w-full max-w-[480px] p-8 shadow-pop sm:p-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
        Reset password
      </h1>
      <p className="mt-3 text-[15px] text-ink-500">
        Choose a new password for your account.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-900">
            New password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="h-12 w-full rounded-xl border border-ink-200 px-4 text-[15px] focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-900">
            Confirm new password
          </label>
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            className="h-12 w-full rounded-xl border border-ink-200 px-4 text-[15px] focus:border-brand focus:outline-none"
          />
        </div>
        {status === "error" && <p className="text-sm text-red-600">{message}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Suspense>
          <ResetForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
