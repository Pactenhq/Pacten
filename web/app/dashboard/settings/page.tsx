"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/components/auth/AuthProvider";
import { SettingsProfileForm } from "./ProfileForm";

// Settings frame: left nav (Profile / Account) + panel. The Account
// panel shows the REAL account (from the session) with working actions
// — the previous build rendered "<Tab> settings are not part of this
// preview." placeholders for every non-Profile tab.
const settingsNav = ["Profile", "Account"];

function AccountPanel() {
  const { user, logout } = useAuth();
  const name =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() || "—";
  const rows: Array<[string, string]> = [
    ["Full name", name],
    ["Email", user?.email ?? "—"],
    [
      "Account type",
      user?.role
        ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
        : "—",
    ],
    ["Account status", user?.status ? String(user.status).replace(/_/g, " ") : "—"],
  ];
  return (
    <div>
      <p className="mt-1 text-[15px] text-ink-500">
        Your Pacten account details.
      </p>
      <dl className="mt-6 space-y-4">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 pb-3"
          >
            <dt className="text-sm font-medium text-ink-500">{label}</dt>
            <dd className="text-[15px] font-semibold capitalize text-ink-900">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-8 text-lg font-bold text-ink-900">Password</h2>
      <p className="mt-1 text-[15px] text-ink-500">
        To change your password, use the secure reset flow — we email you a
        link to set a new one.
      </p>
      <Link href="/forgot-password" className="mt-3 inline-block">
        <Button variant="outline" size="md">
          Reset password
        </Button>
      </Link>

      <h2 className="mt-8 text-lg font-bold text-ink-900">Privacy &amp; terms</h2>
      <p className="mt-1 text-[15px] text-ink-500">
        Read how Pacten handles your data in our{" "}
        <Link href="/privacy" className="font-semibold text-brand hover:underline">
          Privacy Policy
        </Link>{" "}
        and the rules of the marketplace in our{" "}
        <Link href="/terms" className="font-semibold text-brand hover:underline">
          Terms of Service
        </Link>
        .
      </p>

      <h2 className="mt-8 text-lg font-bold text-ink-900">Session</h2>
      <div className="mt-3">
        <Button variant="danger-outline" size="md" onClick={() => logout()}>
          Log out
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [active, setActive] = useState("Profile");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-[1185px] px-6 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Settings" className="h-fit">
            <ul className="flex flex-row gap-1 overflow-x-auto lg:flex-col lg:gap-1">
              {settingsNav.map((item) => (
                <li key={item} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setActive(item)}
                    aria-current={active === item ? "page" : undefined}
                    className={cn(
                      "flex h-11 w-full items-center rounded-xl px-4 text-[15px] font-medium transition-colors",
                      active === item
                        ? "bg-brand-50 text-brand"
                        : "text-ink-500 hover:bg-ink-50 hover:text-ink-900"
                    )}
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <Card className="h-fit p-6 lg:p-8">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
              {active}
            </h1>
            {active === "Profile" ? <SettingsProfileForm /> : <AccountPanel />}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
