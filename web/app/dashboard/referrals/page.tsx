"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AnalyticsGrid,
  CommissionHistory,
  DiscountHistory,
  Leaderboard,
  RecentReferrals,
  ReferralHero,
  RewardsCards,
  SectionCard,
  StatCard,
  ViewAllPill,
} from "@/components/dashboard/widgets";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { dashboardUser, referralNav } from "@/lib/mock";
import { api } from "@/lib/api";

// desktop +
// "mob Referral dashboard" (374:34045) mobile. Invite header, referral
// link/code cards, five stat cards, recent referrals, analytics, rewards,
// earnings history and the top-referrers
// leaderboard. Wired to the real referrals API (M5); design unchanged.

const fmt$ = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function ReferralsDashboardPage() {
  const [dash, setDash] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.referralDashboard().catch(() => null),
      api.myReferralPayouts().catch(() => []),
    ])
      .then(([d, p]) => {
        setDash(d);
        setPayouts(Array.isArray(p) ? p : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const requestPayout = async () => {
    const dollars = parseFloat(amount);
    if (!dollars || dollars <= 0) {
      setMsg("Enter a valid amount.");
      return;
    }
    setRequesting(true);
    setMsg(null);
    try {
      await api.requestReferralPayout(Math.round(dollars * 100));
      setAmount("");
      setMsg("Payout requested — an admin will review it manually.");
      load();
    } catch (e: any) {
      setMsg(e?.message || "Request failed.");
    } finally {
      setRequesting(false);
    }
  };

  const info = {
    title: "Invite friends and earn rewards",
    subtitle: "Share Pacten with your network and get rewarded when they join.",
    linkLabel: "Your Referral Link",
    link: dash?.link || "Loading…",
    linkHint: "Share this link — you earn 20% of a referred user's first three subscription payments, and 10% of Pacten's commission on their first completed paid deal.",
    codeLabel: "Your Referral Code",
    code: dash?.code || "…",
    codeStatus: "Active",
    codeHint: "Friends can also use your code during signup.",
  };

  const s = dash?.stats || {};
  const stats = [
    {
      value: String(s.total ?? 0),
      label: "Total Referrals",
      delta: "",
      icon: "people",
    },
    {
      value: String(s.successful ?? 0),
      label: "Successful Referrals",
      delta: "",
      icon: "check",
    },
    {
      value: fmt$(s.totalEarnedCents ?? 0),
      label: "Lifetime Earnings",
      delta: "",
      icon: "moneybag",
    },
    {
      value: fmt$(s.pendingCents ?? 0),
      label: "Pending Commission",
      delta: "",
      icon: "percent",
    },
    {
      value: fmt$(s.totalPaidCents ?? 0),
      label: "Total Paid Out",
      delta: "",
      icon: "target",
    },
  ];

  const recent =
    dash?.recent?.map((r: any) => ({
      name: r.name,
      joined: fmtDate(r.joined),
      earnings: fmt$(r.earningsCents ?? 0),
      status: r.status === "successful" ? "Successful" : "Pending",
    })) || [];

  const analytics = [
    {
      value: String(dash?.clicks ?? 0),
      label: "Clicks",
      hint: "Total link clicks",
      icon: "cursor",
    },
    {
      value: String(s.total ?? 0),
      label: "Signups",
      hint: "Friends who signed up",
      icon: "people",
    },
    {
      value:
        s.total > 0
          ? `${Math.round(((s.successful ?? 0) / s.total) * 100)}%`
          : "0%",
      label: "Conversions",
      hint: "Signup-to-qualified rate",
      icon: "chart",
    },
    {
      value: fmt$(s.totalEarnedCents ?? 0),
      label: "Revenue",
      hint: "Revenue from referrals",
      icon: "moneybag",
    },
  ];

  const earningLabel = (e: any) =>
    e.type === "subscription"
      ? "Subscription commission"
      : e.type === "deal"
        ? "Deal commission"
        : "Referral earning";
  const commissionEntries = (dash?.earnings || []).map((e: any) => ({
    campaign: `${earningLabel(e)} · ${e.status}`,
    date: fmtDate(e.createdAt),
    amount: fmt$(e.amountCents ?? 0),
  }));

  return (
    <DashboardShell
      nav={referralNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <ReferralHero info={info} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((st) => (
            <StatCard key={st.label} {...st} sub="All time" />
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold text-ink-900">
              Recent Referrals
            </h2>
            <ViewAllPill />
          </div>
          <RecentReferrals rows={recent} />
        </section>

        <section>
          <h2 className="text-[22px] font-extrabold text-ink-900">
            Referral Analytics
          </h2>
          <p className="mt-1 text-[15px] text-ink-500">
            Track your referral performance
          </p>
          <div className="mt-4">
            <AnalyticsGrid items={analytics} />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold text-ink-900">Rewards</h2>
            <ViewAllPill />
          </div>
          <RewardsCards />
        </section>

        {/* Cash payouts — requested by the user, approved manually by admin (Sania). */}
        <section>
          <div className="mb-4">
            <h2 className="text-[22px] font-extrabold text-ink-900">
              Cash Payouts
            </h2>
            <p className="mt-1 text-[15px] text-ink-500">
              Request a payout of your available balance. An admin approves
              each request manually. Minimum withdrawal is{" "}
              {fmt$(dash?.minWithdrawalCents ?? 2500)} — payouts are processed
              monthly.
            </p>
          </div>
          <Card className="p-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-[13px] font-semibold text-ink-500">
                  Available balance
                </p>
                <p className="text-[28px] font-extrabold text-ink-900">
                  {fmt$(s.availableCents ?? 0)}
                </p>
              </div>
              <div className="ml-auto flex items-end gap-3">
                <label className="block">
                  <span className="mb-1 block text-[13px] font-semibold text-ink-500">
                    Amount (USD)
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="25.00"
                    className="w-36 rounded-xl border border-ink-200 px-4 py-2.5 text-[14px] outline-none focus:border-brand"
                  />
                </label>
                <Button
                  size="md"
                  onClick={requestPayout}
                  disabled={requesting || loading}
                >
                  {requesting ? "Requesting…" : "Request Payout"}
                </Button>
              </div>
            </div>
            {msg && (
              <p className="mt-3 text-[14px] font-medium text-ink-700">{msg}</p>
            )}
            <div className="mt-6">
              <p className="mb-3 text-[15px] font-bold text-ink-900">
                Payout history
              </p>
              {payouts.length === 0 ? (
                <p className="text-[14px] text-ink-500">
                  No payout requests yet.
                </p>
              ) : (
                <ul className="divide-y divide-ink-100">
                  {payouts.map((p: any) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between py-3 text-[14px]"
                    >
                      <span className="font-semibold text-ink-900">
                        {fmt$(p.amountCents)}
                      </span>
                      <span className="text-ink-500">
                        {fmtDate(p.requestedAt)}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                          p.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : p.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : p.status === "approved"
                                ? "bg-brand-50 text-brand"
                                : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold text-ink-900">
                Commission History
              </h2>
              <ViewAllPill />
            </div>
            <CommissionHistory entries={commissionEntries} />
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold text-ink-900">
                Discount History
              </h2>
              <ViewAllPill />
            </div>
            <DiscountHistory entries={[]} />
          </section>
        </div>

        <SectionCard
          title="Leaderboard — Top Referrers"
          className="border-0 bg-transparent p-0 shadow-none"
          titleClassName="text-[22px] font-extrabold"
        >
          <Leaderboard entries={[]} />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
