"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/Stars";
import type {
  CreatorCardData,
  ProfessionalCardData,
  CampaignListing,
} from "@/lib/mock";

// Small brand glyphs for the platform icons shown on cards (design uses
// the real platform marks — supplied SVGs).
export function PlatformGlyph({ name, size = 28 }: { name: string; size?: number }) {
  const src =
    name === "Instagram"
      ? "/assets/icons/instagram.svg"
      : name === "TikTok"
        ? "/assets/icons/tiktok.svg"
        : name === "YouTube"
          ? "/assets/icons/youtube.svg"
          : name === "Twitch"
            ? "/assets/icons/twitch.svg"
            : name === "LinkedIn"
              ? "/assets/icons/linkedin.svg"
              : null;
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-[7px]"
      aria-hidden
    />
  );
}

function PhotoTags({ tags }: { tags: string[] }) {
  return (
    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
      {tags.map((t) => (
        <span
          key={t}
          className="inline-flex h-8 items-center rounded-full border border-white/60 bg-white/20 px-3.5 text-[13px] font-medium text-white backdrop-blur-sm"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

//: photo with niche tags
// overlaid, name + verified badge, followers + rating, "View Profile"
// pill button and platform glyphs.
export function CreatorCard({ creator }: { creator: CreatorCardData }) {
  return (
    <Card className="card-lift zoom-on-hover overflow-hidden p-0">
      <div className="relative h-[200px] w-full overflow-hidden bg-ink-50 sm:h-[300px]">
        <Image
          src={creator.photo}
          alt={creator.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 33vw"
        />
        <PhotoTags tags={creator.niches} />
      </div>
      <div className="p-3 sm:p-5">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-base font-bold text-ink-900 sm:text-xl">{creator.name}</p>
          <VerifiedBadge />
        </div>
        <div className="mt-1 flex items-center justify-between gap-1">
          <p className="truncate text-xs text-ink-600 sm:text-[15px]">{creator.followers}</p>
          <p className="shrink-0 text-xs font-medium text-ink-900 sm:text-[15px]">{creator.rating}</p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <Link
            href="/profile/creator"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-brand px-3 text-xs font-semibold text-white hover:bg-brand-dark sm:h-10 sm:gap-2 sm:px-5 sm:text-sm"
          >
            View Profile
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="sm:h-4 sm:w-4">
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            {creator.platforms.map((p) => (
              <span key={p} title={p}>
                <PlatformGlyph name={p} />
              </span>
            ))}
          </span>
        </div>
      </div>
    </Card>
  );
}

//: photo with category
// tag + heart, name + verified, experience + rating, "View Profile"
// pill and message icon.
export function ProfessionalCard({
  professional,
}: {
  professional: ProfessionalCardData;
}) {
  return (
    <Card className="card-lift zoom-on-hover overflow-hidden p-0">
      <div className="relative h-[300px] w-full overflow-hidden bg-ink-50">
        <Image
          src={professional.photo}
          alt={professional.name}
          fill
          className="object-cover object-top"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <PhotoTags tags={[professional.category]} />
        <button
          type="button"
          aria-label="Save"
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/20 text-white backdrop-blur-sm hover:bg-white/40"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M9 15.5S2.5 11.3 2.5 6.9C2.5 4.6 4.3 3 6.4 3c1 0 1.9.5 2.6 1.3C9.7 3.5 10.6 3 11.6 3c2.1 0 3.9 1.6 3.9 3.9 0 4.4-6.5 8.6-6.5 8.6Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2">
          <p className="truncate text-xl font-bold text-ink-900">{professional.name}</p>
          <VerifiedBadge />
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <p className="text-[15px] text-ink-600">
            {professional.experience} of experience
          </p>
          <p className="text-[15px] font-medium text-ink-900">{professional.rating}</p>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            href="/profile/professional"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            View Profile
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <button
            type="button"
            aria-label="Message"
            className="inline-flex h-10 w-10 items-center justify-center text-ink-700 hover:text-brand"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
              <rect x="2" y="4.5" width="18" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
              <path d="m4.5 7 6.5 4.5L17.5 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  );
}

//: 2-col grid of job cards —
// brand mark, title, company, location, description, outlined meta
// pills, "View Details" button and posted time.
export function CampaignCard({ job }: { job: CampaignListing }) {
  const router = useRouter();
  return (
    <Card className="p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="2.2" fill="currentColor" />
            <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" />
            <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" transform="rotate(120 12 12)" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold text-ink-900">{job.title}</p>
          <p className="text-[15px] text-ink-600">{job.brand}</p>
        </div>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[15px] text-ink-600">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M8 14.5S3.5 10 3.5 6.5a4.5 4.5 0 1 1 9 0C12.5 10 8 14.5 8 14.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        {job.location}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
        {job.description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[job.budget, job.timeline, job.type].map((m) => (
          <span
            key={m}
            className="inline-flex h-9 items-center rounded-full border border-ink-300 bg-white px-4 text-[13px] font-medium text-ink-700"
          >
            {m}
          </span>
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button onClick={() => router.push(`/campaigns/${job.id}`)}>
          View Details
        </Button>
        <span className="text-sm text-ink-400">{job.postedAt}</span>
      </div>
    </Card>
  );
}

export { Avatar };
