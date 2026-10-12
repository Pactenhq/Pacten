import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Stars, VerifiedBadge } from "@/components/ui/Stars";
import type { ProfileStat, Review, Service } from "@/lib/mock";

function IconButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-ink-300 bg-white text-ink-700 hover:border-brand hover:text-brand"
    >
      {children}
    </button>
  );
}

// Profile header — from the design profile frames (260:10983 etc.):
// cover, photo avatar, name + verified mark, handle, headline, niche
// tags, message/save icon buttons, price label + primary CTA.
export function ProfileHero({
  name,
  handle,
  headline,
  tags,
  priceLabel,
  ctaLabel,
  coverSeed,
  photo,
}: {
  name: string;
  handle: string;
  headline: string;
  tags: string[];
  priceLabel?: string;
  ctaLabel: string;
  coverSeed: string;
  photo?: string;
}) {
  let h = 0;
  for (let i = 0; i < coverSeed.length; i++) h = (h * 31 + coverSeed.charCodeAt(i)) % 997;
  const covers = [
    "from-brand-200 via-brand-100 to-mist",
    "from-[#e6dcfb] via-[#f1eafc] to-mist",
    "from-[#f9d8e8] via-[#fbe9f1] to-mist",
  ];
  return (
    <div>
      <div
        aria-hidden
        className={`h-[180px] rounded-2xl bg-gradient-to-br sm:h-[245px] ${covers[h % covers.length]}`}
      />
      <div className="mx-auto -mt-16 max-w-[1240px] px-4 sm:-mt-20 sm:px-6">
        <Card className="p-5 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <span className="relative -mt-16 block h-[120px] w-[120px] shrink-0 overflow-hidden rounded-3xl border-4 border-white bg-ink-100 sm:-mt-24 sm:h-[160px] sm:w-[160px]">
                {photo ? (
                  <Image src={photo} alt={name} fill className="object-cover object-top" sizes="160px" />
                ) : (
                  <Avatar name={name} className="h-full w-full border-0 text-3xl" />
                )}
              </span>
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                    {name}
                  </h1>
                  <VerifiedBadge />
                </div>
                <p className="mt-1 text-[15px] text-ink-500">{handle}</p>
                <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-700">
                  {headline}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex h-8 items-center rounded-full border border-brand/60 bg-white px-3.5 text-[13px] font-medium text-brand"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
              {priceLabel && (
                <p className="text-lg font-bold text-brand">{priceLabel}</p>
              )}
              <div className="flex items-center gap-2.5">
                <IconButton label="Message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <rect x="2" y="4" width="16" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m4.5 6.5 5.5 3.8 5.5-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </IconButton>
                <IconButton label="Save">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                    <path
                      d="M10 16.8S3.6 12.9 3.6 8.2C3.6 6 5.3 4.5 7.3 4.5c1 0 1.9.5 2.7 1.3.8-.8 1.7-1.3 2.7-1.3 2 0 3.7 1.5 3.7 3.7 0 4.7-6.4 8.6-6.4 8.6Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
                <Button size="lg">{ctaLabel}</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

const STAT_ICONS: Record<string, React.ReactNode> = {
  users: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="8" cy="7.5" r="3.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M2.5 18c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M15 4.8a3.2 3.2 0 0 1 0 5.7M17.5 13.6c1.4.7 2.3 2 2.6 3.9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  heart: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M11 18.5S4 14.2 4 9.3C4 6.9 5.9 5.2 8.1 5.2c1 0 2 .5 2.9 1.4.9-.9 1.9-1.4 2.9-1.4 2.2 0 4.1 1.7 4.1 4.1 0 4.9-7 9.2-7 9.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  eye: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <path d="M2.5 11S5.5 5.8 11 5.8 19.5 11 19.5 11 16.5 16.2 11 16.2 2.5 11 2.5 11Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  check: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m7.5 11.2 2.4 2.4 4.6-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export function StatsRow({ stats }: { stats: ProfileStat[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="p-5 text-center sm:p-6">
          {s.icon && STAT_ICONS[s.icon] && (
            <span className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand">
              {STAT_ICONS[s.icon]}
            </span>
          )}
          <p className="text-2xl font-extrabold text-ink-900 sm:text-[32px]">
            {s.value}
          </p>
          <p className="mt-1 text-sm text-ink-500">{s.label}</p>
        </Card>
      ))}
    </div>
  );
}

export function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AboutBlock({
  text,
  location,
  website,
}: {
  text: string;
  location: string;
  website: string;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <p className="text-[15px] leading-relaxed text-ink-700">{text}</p>
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 text-ink-700">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-400">
            <path
              d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          {location}
        </span>
        <span className="font-medium text-brand">{website}</span>
      </div>
    </Card>
  );
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  return (
    <div className="space-y-4">
      {reviews.map((r, i) => (
        <Card key={i} className="p-5 sm:p-6">
          <Stars />
          <p className="mt-3 text-[15px] leading-relaxed text-ink-700">
            &ldquo;{r.quote}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3">
            <Avatar name={r.name} size="sm" />
            <p className="text-sm font-semibold text-ink-900">{r.name}</p>
            <span className="text-xs text-ink-400">{r.time}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function PortfolioGrid({ count = 5 }: { count?: number }) {
  const tiles = [
    "from-brand-200 to-brand-50",
    "from-[#f9d8e8] to-[#fbe9f1]",
    "from-[#d8f3e3] to-[#e9f8ef]",
    "from-[#e6dcfb] to-[#f1eafc]",
    "from-[#fde8c9] to-[#fdf1dd]",
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          aria-hidden
          className={`h-[150px] rounded-xl bg-gradient-to-br sm:h-[170px] ${tiles[i % tiles.length]}`}
        />
      ))}
    </div>
  );
}

export function ServicesList({ services }: { services: Service[] }) {
  return (
    <div className="space-y-3">
      {services.map((s) => (
        <Card
          key={s.title}
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
        >
          <div>
            <p className="text-[17px] font-bold text-ink-900">{s.title}</p>
            <p className="mt-1 text-sm text-ink-500">{s.description}</p>
          </div>
          {s.price ? (
            <span className="inline-flex shrink-0 cursor-pointer items-center gap-1 self-start text-[15px] font-semibold text-brand hover:text-brand-dark sm:self-center">
              {s.price}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M5 2.5 9.5 7 5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          ) : (
            <Button variant="outline" size="sm" className="shrink-0 self-start sm:self-center">
              Book
            </Button>
          )}
        </Card>
      ))}
    </div>
  );
}

export function LinkAction({ label }: { label: string }) {
  return (
    <span className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
      {label}
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M5 2.5 9.5 7 5 11.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
