"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await api.forgotPassword(email);
      setMessage(res.message || "Check your email for a reset link");
      setStatus("done");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="fade-up fade-up-2 w-full max-w-[480px] p-8 shadow-pop sm:p-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">
            Forgot password?
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {status === "done" ? (
            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              {message}
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink-900">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-ink-200 px-4 text-[15px] focus:border-brand focus:outline-none"
                />
              </div>
              {status === "error" && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
                {status === "loading" ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-ink-500">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-brand hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
