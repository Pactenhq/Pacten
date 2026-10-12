import { DashboardShell } from "@/components/dashboard/DashboardShell";
import {
  CampaignCard,
  EmptyState,
  ProfileCompleteness,
  QuickActions,
  RequestRowCard,
  SectionCard,
  ServicesCard,
  StatCard,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
import {
  dashboardUser,
  professionalNav,
  professionalStatCards,
} from "@/lib/mock";

// desktop +
// "mob Professional dashboard" (365:23596) mobile.

const activeCampaign = {
  title: "New Product Launch",
  handle: "Brand",
  budget: "0£",
  status: "Active" as const,
  deadline: "Nov 2, 2026",
  submitted: "Sep 2, 2026",
};

const completedCampaign = {
  title: "New Product Launch",
  handle: "Brand",
  budget: "0£",
  status: "Completed" as const,
  deadline: "Nov 2, 2025",
  submitted: "Sep 2, 2025",
};

export default function ProfessionalDashboardPage() {
  return (
    <DashboardShell
      nav={professionalNav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        <WelcomeHeader
          title="Welcome back"
          subtitle="Manage your profile, services and hiring requests."
          action={
            <label className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-ink-700">
              Availability
              <span
                role="switch"
                aria-checked="false"
                tabIndex={0}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-ink-200"
              >
                <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow" />
              </span>
            </label>
          }
        />

        <ProfileCompleteness pct={65} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {professionalStatCards.map((s) => (
            <StatCard key={s.label} {...s} sub="vs. last month" />
          ))}
        </div>

        <section>
          <h2 className="text-[22px] font-extrabold text-ink-900">
            Hiring Requests
          </h2>
          <div className="mt-4">
            <RequestRowCard
              name="Brand"
              location="London"
              budget="0£"
              status="Active"
              date="Nov 2, 2026"
            />
          </div>
          <div className="mt-4">
            <EmptyState
              title="No hiring requests yet"
              body="When creators or brands send you a request, you'll be able to review and manage it here."
            />
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <ServicesCard filledAdd />
          <QuickActions
            buttons={[
              "Edit Profile",
              "Add Portfolio Work",
              "Messages",
              "Browse Marketplace",
            ]}
          />
        </div>

        <SectionCard
          title="Active Campaigns"
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <CampaignCard key={i} campaign={activeCampaign} />
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Review Your Brand Partners"
          className="border-0 bg-transparent p-0 shadow-none"
        >
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <CampaignCard key={i} campaign={completedCampaign} />
            ))}
          </div>
        </SectionCard>
      </div>
    </DashboardShell>
  );
}
