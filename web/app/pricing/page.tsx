"use client";

import { useState } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger } from "@/components/ui/Reveal";
import { PricingCards } from "@/components/pricing/PricingCards";
import { pricingComparison, pricingFaqs, rateCalculatorTiers } from "@/lib/mock-billing";
import { cn } from "@/lib/cn";

// 
// Sections: hero ("Pricing that rewards growth.") with For Business /
// For Creator / For Professional tabs, 4 plan cards, "Why Pacten?"
// comparison table vs Collabstr, Creator Rate Calculator, FAQ
// ("Pricing questions, answered"), footer.

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5 9.7 6.3l4.8 1.7-4.8 1.7L8 14.5 6.3 9.7 1.5 8l4.8-1.7L8 1.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PLAN_TABS = [
  { label: "For Business", role: "brand" },
  { label: "For Creator", role: "creator" },
  { label: "For Professional", role: "professional" },
] as const;

function PlanTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (role: "brand" | "creator" | "professional") => void;
}) {
  return (
    <div className="mt-8 flex max-w-full justify-center overflow-x-auto px-1">
      <div className="inline-flex shrink-0 rounded-full border border-ink-200 bg-white p-1">
      {PLAN_TABS.map((t) => (
        <button
          key={t.role}
          type="button"
          onClick={() => onChange(t.role)}
          aria-pressed={active === t.role}
          className={cn(
            "h-11 shrink-0 rounded-full px-4 text-[13px] font-semibold transition-colors sm:px-6 sm:text-[15px]",
            active === t.role
              ? "bg-brand text-white"
              : "text-ink-500 hover:text-ink-900"
          )}
        >
          {t.label}
        </button>
      ))}
      </div>
    </div>
  );
}

function BlueCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="Included" className="mx-auto text-brand">
      <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m7.4 11.3 2.5 2.5 4.7-5.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RedCross() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-label="Not included" className="mx-auto text-danger">
      <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8.5 8.5 5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ComparisonTable() {
  return (
    <section className="mx-auto max-w-[1061px] px-6 py-16 lg:py-20">
      <div className="text-center">
        <Tag>
          <span className="inline-flex items-center gap-1.5">
            <SparkleIcon /> Compare
          </span>
        </Tag>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-900">
          Why Pacten?
        </h2>
      </div>
      <div className="mt-10 overflow-x-auto rounded-2xl border border-ink-100 shadow-card">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="bg-brand-50/70">
              <th className="px-5 py-4 text-[15px] font-semibold text-ink-900">
                Feature
              </th>
              <th className="px-5 py-4 text-center text-[15px] font-semibold text-ink-900">
                Pacten
              </th>
              <th className="px-5 py-4 text-center text-[15px] font-semibold text-ink-900">
                Collabstr
              </th>
            </tr>
          </thead>
          <tbody>
            {pricingComparison.map((row, i) => (
              <tr
                key={row.feature}
                className={cn(i % 2 === 1 && "bg-brand-50/40")}
              >
                <td className="px-5 py-4 text-[15px] font-medium text-ink-900">
                  {row.feature}
                </td>
                <td className="px-5 py-4 text-center text-[15px] font-semibold text-ink-900">
                  {row.pacten === true ? <BlueCheck /> : row.pacten}
                </td>
                <td className="px-5 py-4 text-center text-[15px] text-ink-700">
                  {row.collabstr === true || row.collabstr === "check" ? (
                    <BlueCheck />
                  ) : row.collabstr === "x" ? (
                    <RedCross />
                  ) : (
                    row.collabstr
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ResultIcon({ kind }: { kind: string }) {
  const paths: Record<string, React.ReactNode> = {
    money: (
      <>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 5.5v5M6 7h3.2a1.3 1.3 0 0 1 0 2.6H6.8a1.3 1.3 0 0 0 0 2.6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </>
    ),
    target: (
      <>
        <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="8" cy="8" r="0.8" fill="currentColor" />
      </>
    ),
    diamond: (
      <path d="M8 2 13.5 6 8 14 2.5 6 8 2Z M2.5 6h11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    ),
    chart: (
      <path d="M2.5 13.5 6 10l2.5 2.5L13.5 7M9 7h4.5V11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ),
  };
  return (
    <span aria-hidden className="mx-auto flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-brand-50 text-brand">
      <svg width="26" height="26" viewBox="0 0 16 16" fill="none">
        {paths[kind]}
      </svg>
    </span>
  );
}

const PLATFORM_FACTOR: Record<string, number> = {
  Instagram: 1,
  TikTok: 0.9,
  YouTube: 1.3,
  "X (Twitter)": 0.7,
};
const CONTENT_FACTOR: Record<string, number> = {
  "Sponsored post": 1,
  "Story set": 0.5,
  "Video review": 1.4,
  "UGC content": 0.8,
};

function RateCalculator() {
  const icons = ["money", "target", "diamond", "chart"];
  const [result, setResult] = useState<string | null>(null);
  const [platform, setPlatform] = useState("Instagram");
  const [followers, setFollowers] = useState("");
  const [views, setViews] = useState("");
  const [engagement, setEngagement] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [contentType, setContentType] = useState("Sponsored post");
  const [niche, setNiche] = useState("");
  const [tiers, setTiers] = useState<[string, string, string] | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || 0;

  const calculate = () => {
    const f = num(followers);
    if (f <= 0) {
      setResult("Enter your follower count to see an estimate.");
      setTiers(null);
      setConfidence(null);
      return;
    }
    const e = num(engagement);
    const v = num(views);
    const d = Math.max(1, Math.round(num(deliverables)) || 1);
    const base =
      (f / 1000) *
      10 *
      (PLATFORM_FACTOR[platform] ?? 1) *
      (CONTENT_FACTOR[contentType] ?? 1);
    const engMult = e > 0 ? 1 + Math.min(e, 10) / 10 : 1;
    const viewMult = v > 0 ? 1 + Math.min(v / f, 1) * 0.25 : 1;
    const mid = base * engMult * viewMult;
    const low = Math.round(mid * 0.8);
    const high = Math.round(mid * 1.2);
    const rec = Math.round(mid);
    setTiers([
      `$${low.toLocaleString()}`,
      `$${rec.toLocaleString()}`,
      `$${high.toLocaleString()}`,
    ]);
    let conf = 45;
    if (v > 0) conf += 15;
    if (e > 0) conf += 15;
    if (num(deliverables) > 0) conf += 10;
    if (niche) conf += 10;
    setConfidence(Math.min(conf, 95));
    setResult(
      `Estimated rate: $${low.toLocaleString()} – $${high.toLocaleString()} per post` +
        (d > 1
          ? ` · $${(low * d).toLocaleString()} – $${(high * d).toLocaleString()} for ${d} deliverables`
          : "")
    );
  };

  const inputCls =
    "h-[52px] w-full rounded-xl border border-ink-200 bg-white px-4 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none";
  const labelCls = "mb-1.5 block text-sm font-medium text-ink-700";

  return (
    <section className="mx-auto max-w-[1025px] px-6 py-16 lg:py-20">
      <div className="text-center">
        <Tag>
          <span className="inline-flex items-center gap-1.5">
            <SparkleIcon /> Calculator
          </span>
        </Tag>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-900 lg:text-[44px] lg:leading-[1.15]">
          Creator Rate
          <br />
          <span className="text-gradient-blue">Calculator</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[640px] text-lg text-ink-500">
          Estimate your ideal rate based on your platform, audience, and
          content type.
        </p>
      </div>

      <Card className="mt-10 p-6 lg:p-10">
        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>Platform</label>
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
              {Object.keys(PLATFORM_FACTOR).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Followers</label>
              <input
                value={followers}
                onChange={(e) => setFollowers(e.target.value)}
                placeholder="e.g. 50000"
                inputMode="numeric"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Average Views per Post</label>
              <input
                value={views}
                onChange={(e) => setViews(e.target.value)}
                placeholder="e.g. 20000"
                inputMode="numeric"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Engagement Rate (%)</label>
              <input
                value={engagement}
                onChange={(e) => setEngagement(e.target.value)}
                placeholder="e.g. 4.5"
                inputMode="decimal"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Number of Deliverables</label>
              <input
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="e.g. 3"
                inputMode="numeric"
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Content Type</label>
            <select value={contentType} onChange={(e) => setContentType(e.target.value)} className={inputCls}>
              {Object.keys(CONTENT_FACTOR).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Industry / Niche</label>
            <select value={niche} onChange={(e) => setNiche(e.target.value)} className={inputCls}>
              <option value="">Choose…</option>
              {["Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food", "Business", "Lifestyle", "Technology"].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <Button size="lg" className="mt-2 w-full" onClick={calculate}>
            Calculate My Rate
          </Button>
          {result && (
            <p className="rounded-xl bg-brand-50 px-4 py-3 text-center text-[15px] font-semibold text-brand">
              {result}
            </p>
          )}
        </div>
      </Card>

      <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" from="scale">
        {rateCalculatorTiers.map((tier, i) => (
          <Card key={tier.label} className="card-lift p-6 text-center">
            <ResultIcon kind={icons[i] ?? "money"} />
            <p className="mt-4 text-4xl font-extrabold text-ink-900">
              {tiers ? tiers[i] ?? tier.price : tier.price}
            </p>
            <p className="mt-2 text-[15px] font-bold text-ink-900">
              {tier.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              {tier.blurb}
            </p>
          </Card>
        ))}
        <Card className="card-lift p-6 text-center">
          <ResultIcon kind="chart" />
          <p className="mt-4 text-4xl font-extrabold text-ink-900">
            {confidence !== null ? `${confidence}%` : "0%"}
          </p>
          <p className="mt-2 text-[15px] font-bold text-ink-900">
            Confidence Score
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-500">
            Based on inputs provided
          </p>
        </Card>
      </Stagger>

      <p className="mt-8 text-center text-sm text-ink-400">
        Rates are estimates only and not financial advice. Actual rates depend
        on negotiation, usage rights, and market conditions.
      </p>
    </section>
  );
}

function PricingFaq() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="mx-auto max-w-[846px] px-6 py-16 lg:py-20">
      <div className="text-center">
        <Tag>FAQ</Tag>
        <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-ink-900">
          Pricing questions, answered
        </h2>
      </div>
      <div className="mt-10 flex flex-col gap-3">
        {pricingFaqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-[16px] font-semibold text-ink-900">
                  {item.q}
                </span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                  className={cn(
                    "shrink-0 text-ink-500 transition-transform",
                    isOpen && "rotate-180"
                  )}
                >
                  <path
                    d="m4 7 5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {isOpen && (
                <p className="px-6 pb-6 text-[15px] leading-relaxed text-ink-500">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function PricingPage() {
  const [role, setRole] = useState<"brand" | "creator" | "professional">("brand");
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="mx-auto max-w-[1185px] px-6 pb-4 pt-16 text-center lg:pt-20">
          <Tag>Pricing</Tag>
          <h1 className="mx-auto mt-6 max-w-[724px] break-words text-[28px] font-extrabold leading-[1.2] tracking-tight text-ink-900 sm:text-4xl lg:text-[52px] lg:leading-[1.1]">
            Pricing that rewards growth.
          </h1>
          <p className="mx-auto mt-5 max-w-[724px] text-lg leading-relaxed text-ink-500">
            Creators and professionals join free. Brands can start free and
            upgrade as they grow. Pacten only succeeds when our community
            succeeds.
          </p>
          <PlanTabs active={role} onChange={setRole} />
          <div className="mt-12 text-left">
            <PricingCards role={role} />
          </div>
        </section>
        <ComparisonTable />
        <RateCalculator />
        <PricingFaq />
      </main>
      <Footer />
    </div>
  );
}
