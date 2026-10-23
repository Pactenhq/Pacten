import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ProfileHero,
  StatsRow,
  AboutBlock,
  PortfolioGrid,
} from "@/components/profile/ProfileSections";
import { creatorProfile, profileReviews } from "@/lib/mock";

// 2-column layout:
// Row 1: About | Platforms, Row 2: Portfolio | Services, then Reviews (horizontal).
function PlatformsCard() {
  return (
    <Card className="h-full p-5 sm:p-8">
      <h3 className="text-xl font-extrabold text-ink-900">Platforms</h3>
      <div className="mt-6 space-y-7">
        {creatorProfile.platforms.map((p) => (
          <div key={p.platform}>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  p.platform === "TikTok"
                    ? "/assets/icons/tiktok.svg"
                    : "/assets/icons/instagram.svg"
                }
                alt={p.platform}
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg"
              />
              <div>
                <p className="text-[15px] font-bold text-ink-900">{p.platform}</p>
                <p className="text-[13px] text-ink-500">{p.handle}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 pl-[48px]">
              {p.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-ink-500">{s.label}</p>
                  <p className="mt-0.5 text-[15px] font-bold text-ink-900">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ServicesCard() {
  return (
    <Card className="h-full p-5 sm:p-8">
      <h3 className="text-xl font-extrabold text-ink-900">Services</h3>
      <div className="mt-6 space-y-3">
        {creatorProfile.services.map((s) => (
          <div
            key={s.title}
            className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 p-4"
          >
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-ink-900">{s.title}</p>
              <p className="mt-0.5 truncate text-[13px] text-ink-500">{s.description}</p>
            </div>
            <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-white">
              $0
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

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

export default function CreatorProfilePage() {
  return (
    <>
      <Navbar />
      <main className="pb-20">
        <div className="mx-auto max-w-[1380px] px-4 pt-6 sm:px-6 lg:px-12">
          <ProfileHero
            name={creatorProfile.name}
            handle={creatorProfile.handle}
            headline={creatorProfile.headline}
            tags={creatorProfile.tags}
            priceLabel={creatorProfile.priceLabel}
            ctaLabel="Request Collaboration"
            coverSeed={creatorProfile.name}
            photo={creatorProfile.photo}
          />
          <div className="mx-auto mt-8 max-w-[1240px]">
            <StatsRow stats={creatorProfile.stats} />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Card className="p-5 sm:p-8">
                <h3 className="text-xl font-extrabold text-ink-900">About</h3>
                <AboutBlock
                  text={creatorProfile.about}
                  location={creatorProfile.location}
                  website={creatorProfile.website}
                />
              </Card>
              <PlatformsCard />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card className="p-5 sm:p-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-ink-900">Portfolio</h3>
                  <Link
                    href="/profile/creator"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    View full portfolio
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                      <path d="M2.5 7h9M8 3.5 11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
                <div className="mt-6">
                  <PortfolioGrid count={8} />
                </div>
              </Card>
              <ServicesCard />
            </div>

            <div className="mt-10">
              <ReviewsRow />
              <div className="mt-5">
                <Button variant="outline">View All</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
