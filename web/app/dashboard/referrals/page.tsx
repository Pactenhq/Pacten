import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  AnalyticsGrid,
  CommissionHistory,
  DiscountHistory,
  Leaderboard,
  RecentReferrals,
  ReferralHero,
  RewardMilestones,
  RewardsCards,
  SectionCard,
  StatCard,
  ViewAllPill,
} from "@/components/dashboard/widgets";
import {
  commissionHistory,
  dashboardUser,
  discountHistory,
  leaderboard,
  recentReferrals,
  referralAnalytics,
  referralInfo,
  referralNav,
  referralStats,
  rewardMilestones,
} from "@/lib/mock";

// desktop +
// "mob Referral dashboard" (374:34045) mobile. Invite header, referral
// link/code cards, five stat cards, recent referrals, analytics, rewards,
// milestones, commission/discount history and the top-referrers
// leaderboard. All copy is .

export default function ReferralsDashboardPage() {
  return (
    <DashboardShell
      nav={referralNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <ReferralHero info={referralInfo} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {referralStats.map((s) => (
            <StatCard key={s.label} {...s} sub="vs. last month" />
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold text-ink-900">
              Recent Referrals
            </h2>
            <ViewAllPill />
          </div>
          <RecentReferrals rows={recentReferrals} />
        </section>

        <section>
          <h2 className="text-[22px] font-extrabold text-ink-900">
            Referral Analytics
          </h2>
          <p className="mt-1 text-[15px] text-ink-500">
            Track your referral performance
          </p>
          <div className="mt-4">
            <AnalyticsGrid items={referralAnalytics} />
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[22px] font-extrabold text-ink-900">Rewards</h2>
            <ViewAllPill />
          </div>
          <RewardsCards />
        </section>

        <RewardMilestones milestones={rewardMilestones} />

        <div className="grid gap-8 lg:grid-cols-2">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold text-ink-900">
                Commission History
              </h2>
              <ViewAllPill />
            </div>
            <CommissionHistory entries={commissionHistory} />
          </section>
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[22px] font-extrabold text-ink-900">
                Discount History
              </h2>
              <ViewAllPill />
            </div>
            <DiscountHistory entries={discountHistory} />
          </section>
        </div>

        <SectionCard
          title="Leaderboard — Top Referrers"
          className="border-0 bg-transparent p-0 shadow-none"
          titleClassName="text-[22px] font-extrabold"
        >
          <Leaderboard entries={leaderboard} />
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
