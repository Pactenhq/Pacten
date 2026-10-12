import Image from "next/image";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ProfileHero,
  StatsRow,
  Section,
  AboutBlock,
} from "@/components/profile/ProfileSections";
import { brandProfile, profileReviews } from "@/lib/mock";
import { cn } from "@/lib/cn";

// 
// Section order and copy come from the cached layout page.
function RecentCampaigns() {
  return (
    <div className="space-y-3">
      {brandProfile.recentCampaigns.map((c) => (
        <Card
          key={c.title}
          className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <p className="text-[17px] font-bold text-ink-900">{c.title}</p>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-ink-500">
              Status{" "}
              <span
                className={cn(
                  "ml-1 inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold",
                  c.status === "Active"
                    ? "bg-success-bg text-success"
                    : "bg-ink-100 text-ink-700"
                )}
              >
                {c.status}
              </span>
            </span>
            <span className="text-ink-500">
              Deadline <span className="font-semibold text-ink-900">{c.deadline}</span>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}

function OpenJobs() {
  return (
    <div className="space-y-3">
      {brandProfile.openJobs.map((j) => (
        <Card
          key={j.title}
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <p className="text-[17px] font-bold text-ink-900">{j.title}</p>
            <p className="mt-1 max-w-[560px] text-sm leading-relaxed text-ink-500">
              {j.description}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink-900">{j.budget}</p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-center">
            Explore Jobs
          </Button>
        </Card>
      ))}
    </div>
  );
}

function HiringActivity() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {brandProfile.hiringActivity.map((s) => (
        <Card key={s.label} className="p-5 text-center">
          <p className="text-2xl font-extrabold text-ink-900">{s.value}</p>
          <p className="mt-1 text-sm text-ink-500">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}

// Horizontal reviews row — same pattern as the creator and professional
// profile rebuilds (approved 2026-10-08): horizontal scroll, supplied
// reviewer avatar,  review cards.
function ReviewsRow() {
  return (
    <div>
      <h3 className="text-xl font-extrabold text-ink-900">Reviews</h3>
      <div className="mt-6 flex gap-5 overflow-x-auto pb-2">
        {profileReviews.map((r, i) => (
          <Card key={i} className="w-[340px] shrink-0 p-5 sm:w-[380px] sm:p-6">
            <div className="flex gap-0.5 text-brand" aria-label="5 star rating">
              {[0, 1, 2, 3, 4].map((s) => (
                <svg key={s} width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 1.5 9.8 5.6 14.2 6.1 10.9 9.2 11.8 13.5 8 11.3 4.2 13.5 5.1 9.2 1.8 6.1 6.2 5.6 8 1.5Z" />
                </svg>
              ))}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
              &ldquo;{r.quote}&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <Image
                  src="/assets/profile/avatar-reviewer.jpg"
                  alt={r.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{r.name}</p>
                <p className="text-xs text-ink-400">{r.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function BrandProfilePage() {
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6 lg:px-12">
          <ProfileHero
            name={brandProfile.name}
            handle={brandProfile.handle}
            headline="Glow & Co. is a modern skincare brand creating simple, effective products."
            tags={brandProfile.tags}
            ctaLabel="Send Campaign Request"
            coverSeed={brandProfile.name}
          />
          <div className="mx-auto mt-8 max-w-[1240px] space-y-12">
            <StatsRow stats={brandProfile.stats} />
            <Section title="About">
              <AboutBlock
                text={brandProfile.about}
                location={brandProfile.location}
                website={brandProfile.website}
              />
            </Section>
            <Section title="Recent Campaigns">
              <RecentCampaigns />
            </Section>
            <Section title="Open Jobs">
              <OpenJobs />
            </Section>
            <Section title="Hiring Activity">
              <HiringActivity />
            </Section>
            <div className="mt-10">
              <ReviewsRow />
              <div className="mt-5">
                <Button variant="outline">See All Reviews</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
