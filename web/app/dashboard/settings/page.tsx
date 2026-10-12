"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { SettingsProfileForm } from "./ProfileForm";

// 
// The frame shows the public nav with a left settings nav (Profile /
// Account / Notifications / Privacy / Security) and a Profile panel:
// "Profile" / "Manage your public profile information.", profile photo
// row, fields, "Save Changes". All copy verbatim from the frame.
const settingsNav = [
  "Profile",
  "Account",
  "Notifications",
  "Privacy",
  "Security",
];

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
            {active === "Profile" ? (
              <SettingsProfileForm />
            ) : (
              <p className="mt-1 text-[15px] text-ink-500">
                {active} settings are not part of this preview.
              </p>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
