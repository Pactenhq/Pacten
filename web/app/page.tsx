"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { Reveal, Stagger } from "@/components/ui/Reveal";
import { TiltCard } from "@/components/ui/TiltCard";
import { GlowOrb } from "@/components/ui/Animated";
import { cn } from "@/lib/cn";
import {
  testimonials,
  platformStats,
  homeCreators,
  homeProfessionals,
  homeTrustedLogos,
  homePricingPlans,
  homeSearchChips,
  homeProChips,
} from "@/lib/mock";

// Home page sections in order.

/* ------------------------------ icons ------------------------------ */

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M8 1.5 9.7 6.3 14.5 8 9.7 9.7 8 14.5 6.3 9.7 1.5 8 6.3 6.3 8 1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M13 1.5l.7 1.8 1.8.7-1.8.7L13 6.5l-.7-1.8-1.8-.7 1.8-.7L13 1.5Z" fill="currentColor" />
    </svg>
  );
}

function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <path d="M11 1.8 13.6 4l3.2-.4 1 3.1 2.8 1.7-1.4 2.9 1.4 2.9-2.8 1.7-1 3.1-3.2-.4L11 20.2l-2.6-2.2-3.2.4-1-3.1-2.8-1.7L2.8 11 1.4 8.1l2.8-1.7 1-3.1 3.2.4L11 1.8Z" fill="#0c29ab" />
      <path d="m7.8 11.2 2.3 2.3 4.2-4.7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className={className}>
      <path d="M7 1.2 8.7 4.9 12.8 5.4 9.7 8.3 10.5 12.4 7 10.4 3.5 12.4 4.3 8.3 1.2 5.4 5.3 4.9 7 1.2Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <path d="M2.5 9h13m0 0-4.5-4.5M15.5 9 11 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="2.5" width="15" height="15" rx="4.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="14.6" cy="5.4" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden className={className}>
      <path d="M13.5 3v9.8a3.9 3.9 0 1 1-3.9-3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13.5 3c.4 2.3 1.9 3.6 4 3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className={className}>
      <rect x="2.5" y="5" width="17" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4.5 7.5 6.5 5 6.5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <path d="M9 15.5S2.8 11.3 2.8 6.9A3.6 3.6 0 0 1 6.4 3.3c1.1 0 2 .6 2.6 1.4a3.6 3.6 0 0 1 2.6-1.4 3.6 3.6 0 0 1 3.6 3.6c0 4.4-6.2 8.6-6.2 8.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className={className}>
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="m6 9.3 2.2 2.2L12.2 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden className={className}>
      <path d="M6 18.5c-1.8 0-3-1.4-3-3.2C3 10.8 6.6 7 11 5.4l.9 1.9C8.9 8.6 7 10.6 6.7 13H10v5.5H6Zm12 0c-1.8 0-3-1.4-3-3.2 0-4.5 3.6-8.3 8-9.9l.9 1.9c-3 1.3-4.9 3.3-5.2 5.7H22v5.5h-4Z" fill="currentColor" />
    </svg>
  );
}

function RocketIcon({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden className={className}>
      <path d="M20 4c5 4.5 7.5 10.5 7.5 17l-4.5 4.5c-1.5-1-2.5-2.5-3-4.5-2 0-3.5 1.5-4.5 3L11 20c6.5 0 12.5-2.5 17-7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="15" r="2.6" stroke="currentColor" strokeWidth="2.2" />
      <path d="M11 20 6.5 25.5M27.5 25.5 32 30M20 30v6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden className={className}>
      <circle cx="13" cy="8.5" r="4.5" stroke="currentColor" strokeWidth="2" />
      <path d="M4.5 22c1.5-4.5 5-6.8 8.5-6.8s7 2.3 8.5 6.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden className={className}>
      <rect x="3.5" y="8" width="19" height="13" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M9 8V6.5A2.5 2.5 0 0 1 11.5 4h3A2.5 2.5 0 0 1 17 6.5V8M3.5 13h19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden className={className}>
      <path d="M5 22V8.5L13 3l8 5.5V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 22h19M9.5 22v-5h7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GiftIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect x="4" y="9" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 6.5h18M12 6.5V20M12 6.5S12 3 8.8 3 6 5.2 8.2 6.5H12Zm0 0s0-3.5 3.2-3.5S18 5.2 15.8 6.5H12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarPersonIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="10" cy="8" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19.5c1.2-3.6 3.9-5.4 6.5-5.4 1 0 2 .3 2.9.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="m17.5 14 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3 1-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------- hero ------------------------------ */

const searchTabs = [
  { icon: PersonIcon, title: "Creators", sub: "Find creators & collaborations", active: true },
  { icon: BriefcaseIcon, title: "Professionals", sub: "Find experts & specialists", active: false },
  { icon: BuildingIcon, title: "Campaigns", sub: "Discover campaigns & opportunities", active: false },
];

function Hero() {
  return (
    <section className="relative mx-auto max-w-[1380px] overflow-hidden px-6 pt-12 text-center lg:px-12 lg:pt-16">
      {/* ambient background orbs */}
      <GlowOrb className="-left-20 top-10" color="rgba(12, 41, 171, 0.08)" size={480} />
      <GlowOrb className="-right-24 top-64" color="rgba(255, 150, 180, 0.1)" size={420} duration={10} />
      <div className="relative">
      <div className="fade-up fade-up-1 flex justify-center">
        <Tag className="gap-2">
          <SparkleIcon />
          The Global Creator Marketplace
        </Tag>
      </div>
      <h1 className="fade-up fade-up-2 mx-auto mt-6 max-w-[900px] break-words text-[28px] font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-[68px] lg:leading-[1.05]">
        <span className="text-gradient-blue text-gradient-animated">One marketplace.</span>
        <br />
        <span className="text-ink-900">Every side of social.</span>
      </h1>
      <p className="fade-up fade-up-3 mx-auto mt-5 max-w-[990px] text-lg leading-relaxed text-ink-500">
        Connect with creators, social professionals, and business in one place.
        Discover new opportunities, find the right talent, launch campaigns,
        and build partnerships that grow.
      </p>
      <div className="fade-up fade-up-4 mt-8 flex flex-col items-stretch justify-center gap-3 px-4 sm:flex-row sm:flex-wrap sm:items-center sm:px-0">
        <Link href="/signup/creator" className="sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">Join as a Creator</Button>
        </Link>
        <Link href="/signup/brand" className="sm:w-auto">
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Join as a Business
          </Button>
        </Link>
        <Link href="/signup/professional" className="sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">Join as a Professional</Button>
        </Link>
      </div>

      {/* search tab panel */}
      <div className="fade-up fade-up-5 mx-auto mt-10 w-full max-w-[1248px] rounded-2xl border border-ink-200 bg-white p-4 text-left shadow-card sm:p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {searchTabs.map((t) => (
            <button
              key={t.title}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-colors",
                t.active
                  ? "border-brand bg-white"
                  : "border-ink-200 bg-white hover:border-ink-300"
              )}
            >
              <t.icon className={t.active ? "text-brand" : "text-ink-900"} />
              <span>
                <span className={cn("block text-[17px] font-bold", t.active ? "text-brand" : "text-ink-900")}>
                  {t.title}
                </span>
                <span className="block text-sm text-ink-500">{t.sub}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="relative mt-4">
          <input
            placeholder="Search creators, niches or platforms..."
            className="h-[56px] w-full rounded-xl border border-ink-200 bg-white px-5 pr-[140px] text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none"
          />
          <Button size="lg" className="bottom-2 right-2 top-2 h-auto gap-2 px-6" style={{ position: "absolute" }}>
            Search
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M8.25 14.25a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM16.5 16.5l-3.9-3.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {homeSearchChips.map((chip, i) => (
            <button
              key={chip}
              className={cn(
                "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-colors",
                i === 0
                  ? "bg-brand text-white"
                  : "border border-ink-300 bg-white text-ink-700 hover:border-brand hover:text-brand"
              )}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* verified creator photo cards */}
      <Stagger className="mx-auto mt-8 grid max-w-[1248px] gap-5 text-left sm:grid-cols-2 lg:grid-cols-4" from="scale">
        {homeCreators.map((c) => (
          <Card key={c.id} className="card-lift zoom-on-hover overflow-hidden p-0">
            <div className="relative aspect-[282/320] w-full overflow-hidden">
              <Image src={c.photo} alt={c.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              <div className="absolute left-3 top-3 flex gap-2">
                {c.tags.map((t) => (
                  <span key={t} className="inline-flex h-8 items-center rounded-full border border-white/60 bg-black/20 px-3 text-[13px] font-medium text-white">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-5">
              <p className="flex items-center gap-2 text-[19px] font-bold text-ink-900">
                {c.name}
                <VerifiedBadge />
              </p>
              <p className="mt-1 flex items-center justify-between text-sm text-ink-500">
                {c.followers}
                <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                  {c.rating}
                  <StarIcon />
                </span>
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Link href="/creators">
                  <span className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white">
                    View Profile
                    <ArrowIcon />
                  </span>
                </Link>
                <span className="flex items-center gap-2 text-ink-900">
                  <InstagramIcon />
                  <TikTokIcon />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </Stagger>
      </div>
    </section>
  );
}

/* --------------------------- trusted strip -------------------------- */

function TrustedStrip() {
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-16 text-center lg:px-12">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-ink-500">
        Trusted by Teams at
      </p>
      <div className="mx-auto mt-8 grid max-w-[1100px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {homeTrustedLogos.map((b, i) => (
          <div
            key={b}
            className="flex h-[120px] flex-col items-center justify-center gap-2 rounded-2xl bg-mist"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/assets/home/logos/logo-${i + 1}.svg`}
              alt={b}
              className="h-[64px] w-auto max-w-[120px] object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------ pricing ----------------------------- */

function PlanIcon({ icon }: { icon: "gift" | "star" | "briefcase" }) {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand">
      {icon === "gift" && <GiftIcon />}
      {icon === "star" && <StarPersonIcon />}
      {icon === "briefcase" && <BriefcaseIcon />}
    </span>
  );
}

function PricingSection() {
  const toggles = ["For Business", "For Creator", "For Professional"];
  const [active, setActive] = useState(0);
  return (
    <section id="pricing" className="mx-auto max-w-[1380px] px-6 py-16 text-center lg:px-12">
      <Reveal>
      <div className="flex justify-center">
        <Tag>
          <SparkleIcon />
          Pricing
        </Tag>
      </div>
      <h2 className="mx-auto mt-6 max-w-[760px] text-4xl font-extrabold tracking-tight lg:text-[52px] lg:leading-[1.1]">
        <span className="text-gradient-blue text-gradient-animated">Simple pricing.</span>
        <br />
        <span className="text-ink-900">Built for creators and brands.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-[640px] text-lg text-ink-500">
        Start for free and scale as you grow. No hidden fees. Cancel anytime.
      </p>
      </Reveal>
      <div className="mx-auto mt-8 flex max-w-full justify-start overflow-x-auto px-1 sm:justify-center">
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-ink-200 bg-white p-1.5">
        {toggles.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-all duration-300 hover:scale-105 sm:px-5 sm:text-sm",
              i === active ? "bg-brand text-white shadow-lg" : "text-ink-700 hover:text-ink-900"
            )}
          >
            {t}
          </button>
        ))}
        </div>
      </div>
      <Stagger className="mx-auto mt-10 grid max-w-[1100px] gap-5 text-left md:grid-cols-3" from="scale">
        {homePricingPlans.map((plan) => (
          <div key={plan.name} className="relative">
            {plan.tag && (
              <span className="animate-glow absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand px-3 py-1 text-xs font-bold text-white">
                {plan.tag}
              </span>
            )}
            <Card className={cn("card-lift h-full p-7", plan.filled && "border-2 border-brand")}>
              <PlanIcon icon={plan.icon} />
              <p className="mt-5 text-[22px] font-extrabold text-ink-900">{plan.name}</p>
              <p className="mt-1 text-[15px] font-bold text-brand">{plan.price}</p>
              <div className="my-5 border-t border-ink-100" />
              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-[15px] text-ink-700">
                    <CheckIcon className="shrink-0 text-brand" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup/brand" className="block">
                <Button variant={plan.filled ? "primary" : "outline"} className="mt-7 w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          </div>
        ))}
      </Stagger>
      <Reveal className="mt-10" from="up">
        <Link href="/pricing">
          <Button size="lg" className="min-w-[171px]">
            View All Plans
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}

/* --------------------- more than a marketplace ---------------------- */

function MarketplaceSection() {
  return (
    <section className="mx-auto max-w-[1380px] px-4 py-16 sm:px-6 lg:px-12">
      <Reveal>
      <div className="grid items-center gap-8 overflow-hidden rounded-[24px] bg-mist p-5 sm:p-8 lg:grid-cols-2 lg:gap-10 lg:p-14">
        <div className="min-w-0">
          <h2 className="break-words text-[28px] font-extrabold leading-[1.2] tracking-tight sm:text-4xl lg:text-[52px] lg:leading-[1.1]">
            <span className="text-ink-900">More than a</span>
            <br />
            <span className="text-gradient-blue text-gradient-animated">marketplace.</span>
          </h2>
          <p className="mt-6 max-w-full break-words text-[16px] leading-relaxed text-ink-700 sm:max-w-[560px] sm:text-[17px]">
            The way people discover, create, and grow online is constantly
            changing. Creators are building businesses from their content,
            brands are looking for authentic voices, and social professionals
            are helping turn ideas into meaningful campaigns.
          </p>
          <p className="mt-4 max-w-full break-words text-[16px] leading-relaxed text-ink-700 sm:max-w-[560px] sm:text-[17px]">
            Pacten brings these communities together in one place — making it
            easier to discover the right people, find new opportunities, build
            genuine partnerships, and create work that delivers real value.
          </p>
        </div>
        <div className="relative mt-4 min-w-0 lg:mt-0">
          {/* Mobile: exact desktop-composite image for pixel-match */}
          <div className="zoom-on-hover overflow-hidden rounded-2xl lg:hidden">
            <Image
              src="/assets/home/marketplace-mobile.webp"
              alt="Creators collaborating on Pacten"
              width={690}
              height={570}
              className="w-full object-cover"
            />
          </div>
          {/* Desktop: composite image supplied for this section */}
          <div className="relative hidden lg:block">
            <div className="zoom-on-hover overflow-hidden rounded-2xl">
              <Image
                src="/assets/home/marketplace-desktop.webp"
                alt="Creators collaborating on Pacten"
                width={886}
                height={610}
                className="w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      </Reveal>
    </section>
  );
}

/* ----------------------------- how it works ------------------------- */

function HowItWorks() {
  const toggles = ["For Business", "For Creator"];
  const [active, setActive] = useState(0);
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-16 text-center lg:px-12">
      <Reveal>
      <div className="flex justify-center">
        <Tag>
          <SparkleIcon />
          How it Works
        </Tag>
      </div>
      <h2 className="mx-auto mt-6 max-w-[800px] text-4xl font-extrabold tracking-tight lg:text-[52px] lg:leading-[1.1]">
        <span className="text-ink-900">Launch your next campaign</span>
        <br />
        <span className="text-gradient-blue text-gradient-animated">in 3 simple steps</span>
      </h2>
      </Reveal>
      <div className="mx-auto mt-8 flex max-w-full justify-start overflow-x-auto px-1 sm:justify-center">
        <div className="inline-flex shrink-0 items-center gap-1 rounded-full border border-ink-200 bg-white p-1.5">
        {toggles.map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors sm:px-5 sm:text-sm",
              i === active ? "bg-brand text-white" : "text-ink-700 hover:text-ink-900"
            )}
          >
            {t}
          </button>
        ))}
        </div>
      </div>

      <Stagger className="mx-auto mt-10 max-w-[1248px] text-left" from="up">
        {/* step 01 — full width */}
        <Card className="card-lift grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-10">
          <div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-lg font-extrabold text-white">
              01
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-ink-900">Post Your Brief</h3>
            <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-ink-500">
              Describe your campaign goals, budget, and the type of creator
              you&apos;re looking for.
            </p>
          </div>
          <div className="relative rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <p className="mt-4 text-xs font-semibold text-ink-700">Campaign Goal</p>
            <div className="mt-1.5 rounded-lg border border-ink-200 px-3 py-2.5 text-[13px] text-ink-700">
              Increase brand awareness
            </div>
            <p className="mt-3 text-xs font-semibold text-ink-700">Budget</p>
            <div className="mt-1.5 rounded-lg border border-ink-200 px-3 py-2.5 text-[13px] text-ink-700">
              $ 5,000
            </div>
            <Button className="mt-4 w-full" size="md">
              Post Brief
            </Button>
            <span aria-hidden className="absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:block">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="26" fill="#eef2ff" />
                <path d="M28 36l16-8-6 16-4-6-6-2Z" fill="#0c29ab" />
                <path d="M52 18c8 2 14 8 16 16" stroke="#0c29ab" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                <path d="M64 28l4 6-7 1" stroke="#0c29ab" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </Card>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {/* step 02 */}
          <Card className="card-lift p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-lg font-extrabold text-brand">
              02
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-ink-900">Match with Creators</h3>
            <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-ink-500">
              Browse verified creator profiles or let our smart matching
              surface the best fits.
            </p>
            <div className="mt-6">
              <Image
                src="/assets/home/how-it-works-creators.webp"
                alt="Matched creators: Sophie, Alex, Mia, Jordan"
                width={407}
                height={137}
                className="w-full max-w-[420px] object-contain"
              />
            </div>
          </Card>
          {/* step 03 */}
          <Card className="card-lift p-8">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-lg font-extrabold text-white">
              03
            </span>
            <h3 className="mt-5 text-2xl font-extrabold text-ink-900">Launch &amp; Measure</h3>
            <p className="mt-2 max-w-[420px] text-[15px] leading-relaxed text-ink-500">
              Collaborate, approve content, and track real-time campaign
              performance.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-ink-100 p-4">
                <p className="text-[11px] font-medium text-ink-500">Performance Overview</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900">128K</p>
                <p className="text-[11px] text-ink-500">Views</p>
                <svg width="100%" height="44" viewBox="0 0 120 44" fill="none" aria-hidden className="mt-2">
                  <path d="M2 36 18 30l14-10 16 8 18-14 16 6 18-10 18 4" stroke="#0c29ab" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex flex-col items-center justify-center rounded-xl border border-ink-100 p-4">
                <p className="text-[11px] font-medium text-ink-500">Engagement</p>
                <div className="relative mt-2 h-20 w-20">
                  <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#e8edfd" strokeWidth="9" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#0c29ab" strokeWidth="9" strokeLinecap="round" strokeDasharray="213.6" strokeDashoffset="200" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-ink-900">
                    4.8%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Stagger>
    </section>
  );
}

/* ------------------------------ CTA banner -------------------------- */

function CtaBanner() {
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-8 lg:px-12">
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-brand px-8 py-10 sm:flex-row lg:px-14">
        <div className="flex items-center gap-5">
          <RocketIcon className="shrink-0 text-white" />
          <div>
            <p className="text-2xl font-extrabold text-white">Ready to get started?</p>
            <p className="mt-1 text-[15px] text-brand-100">
              Join thousands of brands and creators growing together.
            </p>
          </div>
        </div>
        <Link href="/signup/brand">
          <Button size="lg" className="shrink-0 bg-white text-brand hover:bg-brand-50">
            Get Started
          </Button>
        </Link>
      </div>
    </section>
  );
}

/* ---------------------------- professionals ------------------------- */

function Professionals() {
  const chips = homeProChips;
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-16 lg:px-12">
      <Reveal>
      <div className="flex justify-start">
        <Tag>
          <SparkleIcon />
          Featured Creators
        </Tag>
      </div>
      <h2 className="mt-6 max-w-[700px] text-4xl font-extrabold tracking-tight lg:text-[52px] lg:leading-[1.1]">
        <span className="text-ink-900">Work with the world&apos;s</span>
        <br />
        <span className="text-gradient-blue text-gradient-animated">best Professionals</span>
      </h2>
      </Reveal>
      <div className="mt-6 flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <button
            key={chip}
            className={cn(
              "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium transition-all duration-300 hover:scale-105",
              i === 0
                ? "bg-brand text-white shadow-md"
                : "border border-ink-300 bg-white text-ink-700 hover:border-brand hover:text-brand"
            )}
          >
            {chip}
          </button>
        ))}
      </div>
      <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" from="scale">
        {homeProfessionals.map((p) => (
          <Card key={p.id} className="card-lift zoom-on-hover overflow-hidden p-0">
            <div className="relative aspect-[290/303] w-full overflow-hidden">
              <Image src={p.photo} alt={p.name} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
              <span className="absolute left-3 top-3 inline-flex h-8 items-center rounded-full border border-white/60 bg-black/20 px-3 text-[13px] font-medium text-white">
                Editors
              </span>
              <span className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white">
                <HeartIcon />
              </span>
            </div>
            <div className="p-5">
              <p className="flex items-center gap-2 text-[19px] font-bold text-ink-900">
                {p.name}
                <VerifiedBadge />
              </p>
              <p className="mt-1 flex items-center justify-between text-sm text-ink-500">
                {p.experience}
                <span className="inline-flex items-center gap-1 font-medium text-ink-700">
                  {p.rating}
                  <StarIcon />
                </span>
              </p>
              <div className="mt-4 flex items-center justify-between">
                <Link href="/professionals">
                  <span className="inline-flex h-10 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-white">
                    View Profile
                    <ArrowIcon />
                  </span>
                </Link>
                <span className="text-ink-900">
                  <EnvelopeIcon />
                </span>
              </div>
            </div>
          </Card>
        ))}
      </Stagger>
      <Reveal className="mt-8" from="up">
        <Button size="lg" className="min-w-[200px]">
          View All Profiles
        </Button>
      </Reveal>
    </section>
  );
}

/* ----------------------------- testimonials ------------------------- */

function Testimonials() {
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-16 lg:px-12">
      <Reveal>
      <div className="flex justify-center">
        <Tag>
          <SparkleIcon />
          Trusted by brands
        </Tag>
      </div>
      <h2 className="mx-auto mt-6 text-center text-4xl font-extrabold tracking-tight text-ink-900 lg:text-[52px]">
        Brands love Pacten
      </h2>
      </Reveal>
      <div className="mx-auto mt-12 grid max-w-[1100px] gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Stagger className="grid gap-5" from="up">
          {platformStats.map((s) => (
            <Card key={s.label} className="card-lift p-8 text-center">
              <p className="text-5xl font-extrabold tracking-tight text-brand">
                {s.value}
              </p>
              <p className="mt-2 text-[15px] text-ink-500">{s.label}</p>
            </Card>
          ))}
        </Stagger>
        <Stagger className="grid gap-5" from="up" stagger={0.15}>
          {testimonials.map((t) => (
            <div key={t.name} className="card-lift rounded-2xl bg-mist p-7">
              <QuoteIcon className="text-brand" />
              <p className="mt-3 text-[16px] leading-relaxed text-ink-900">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="relative block h-11 w-11 overflow-hidden rounded-full">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover" sizes="44px" />
                </span>
                <p className="text-sm font-semibold text-ink-900">
                  {t.name}, {t.role}
                </p>
              </div>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ----------------------------- bottom CTA --------------------------- */

function BottomCta() {
  const copy = (
    <>
      <h2 className="text-4xl font-extrabold tracking-tight text-white lg:whitespace-nowrap lg:text-[4.32cqi] lg:leading-[1.05]">
        Ready to grow with Pacten?
      </h2>
      <p className="mt-4 max-w-[520px] text-lg text-brand-100 lg:whitespace-nowrap lg:text-[1.35cqi]">
        Join the marketplace built for creators and brands to connect,
        collaborate and grow.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 lg:flex-nowrap lg:mt-[2.2cqi]">
        <Link href="/signup/creator">
          <Button size="lg" className="bg-white text-brand hover:bg-brand-50 lg:px-[3.04cqi]">
            Join as a Creator
          </Button>
        </Link>
        <Link href="/signup/brand">
          <Button
            size="lg"
            variant="outline"
            className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white lg:px-[3.04cqi]"
          >
            Join as a Business
          </Button>
        </Link>
        <Link href="/signup/professional">
          <Button size="lg" className="bg-white text-brand hover:bg-brand-50 lg:px-[3.04cqi]">
            Join as a Professional
          </Button>
        </Link>
      </div>
    </>
  );
  return (
    <section className="mx-auto max-w-[1380px] px-6 py-16 lg:px-12 lg:pb-28">
      <Reveal from="scale">
      {/* Desktop: fixed panel proportions, phone visual positioned to the right */}
      <div className="relative hidden rounded-[24px] bg-brand lg:block lg:aspect-[1480/360] lg:[container-type:inline-size]">
        <div className="absolute inset-y-0 left-0 flex w-[62%] flex-col px-14 lg:pt-[7.5cqi]">
          {copy}
        </div>
        <div
          aria-hidden
          className="absolute animate-floaty-slow"
          style={{ left: "60.9%", top: "-15.6%", width: "40.8%" }}
        >
          <Image
            src="/assets/home/cta-visual-v4.webp"
            alt=""
            width={553}
            height={475}
            className="h-auto w-full"
          />
        </div>
      </div>
      </Reveal>
      {/* Mobile: stacked layout with centered text and phone below */}
      <div className="relative rounded-[24px] bg-gradient-to-r from-[#0d2bb5] via-[#0e2090] to-[#0a1748] px-6 pb-0 pt-14 text-center lg:hidden">
        <h2 className="text-[30px] font-extrabold leading-[1.2] tracking-tight text-white">
          Ready to grow with
          <br />
          Pacten?
        </h2>
        <p className="mx-auto mt-4 max-w-[290px] text-[14px] leading-relaxed text-white/90">
          Join the marketplace built for creators and brands to connect,
          collaborate and grow.
        </p>
        <div className="mt-6 flex items-stretch justify-center gap-3">
          <Link href="/signup/creator" className="flex-1">
            <Button className="h-[52px] w-full bg-white px-4 text-[15px] font-semibold text-brand hover:bg-brand-50">
              Join as a Creator
            </Button>
          </Link>
          <Link href="/signup/brand" className="flex-1">
            <Button
              variant="outline"
              className="h-[52px] w-full border-white/70 bg-white/10 px-4 text-[15px] font-semibold text-white hover:bg-white/20 hover:text-white"
            >
              Join as a Business
            </Button>
          </Link>
        </div>
        <div className="relative -mb-10 mt-4">
          <Image
            src="/assets/home/cta-visual-mobile-v4.webp"
            alt="Pacten dashboard on phone with earnings and payable card"
            width={553}
            height={475}
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- page ------------------------------ */

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustedStrip />
        <PricingSection />
        <MarketplaceSection />
        <HowItWorks />
        <CtaBanner />
        <Professionals />
        <Testimonials />
        <BottomCta />
      </main>
      <Footer logoTone="brand" />
    </>
  );
}
