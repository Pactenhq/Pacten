"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Filter panels rebuilt from the design marketplace frames
// ("Marketplace Creator" 278:4057, "Marketplace professional" 401:55119,
// "Marketplace campaign" 408:56995): category pill grids, sliders,
// toggles, checkbox groups, dropdowns and the "Apply All" button.

export type FilterKind = "creators" | "professionals" | "campaigns";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-ink-900 dark:text-ink-50">{children}</p>;
}

function CategoryPills({
  options,
  cols = 3,
  onChange,
}: {
  options: string[];
  cols?: 2 | 3;
  onChange?: (value: string) => void;
}) {
  const [active, setActive] = useState(options[0]);
  const select = (o: string) => {
    setActive(o);
    onChange?.(o);
  };
  return (
    <div>
      <SectionLabel>Category:</SectionLabel>
      <div className={cn("mt-2.5 grid gap-2", cols === 2 ? "grid-cols-2" : "grid-cols-3")}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => select(o)}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-full border px-2 text-[13px] font-medium transition-colors",
              active === o
                ? "border-brand bg-brand text-white"
                : "border-brand/60 bg-white dark:bg-ink-900 text-brand dark:text-brand-200 hover:bg-brand-50 dark:hover:bg-white/10"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeSlider({
  label,
  min,
  max,
  onChange,
}: {
  label: string;
  min: string;
  max: string;
  onChange?: (range: [number, number]) => void;
}) {
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(100);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<"lo" | "hi" | null>(null);

  // Map slider percent (0-100) onto the labelled scale, e.g. "0".."100K".
  const scaleOf = (s: string) => {
    const m = s.trim().match(/^([\d.]+)\s*([KMkm]?)$/);
    if (!m) return 0;
    const mult =
      m[2].toUpperCase() === "M" ? 1e6 : m[2].toUpperCase() === "K" ? 1e3 : 1;
    return parseFloat(m[1]) * mult;
  };
  const toValue = (pct: number) =>
    Math.round(scaleOf(min) + (pct / 100) * (scaleOf(max) - scaleOf(min)));
  // FINAL fix (Nov 12): the slider's values are percents (0-100) but
  // its labels claim the real scale (0..10M / 0..100K), so a probe
  // reading the slider saw "max 100" next to a "10M" label. Format the
  // scaled value compactly for the readout and the accessible value.
  const formatCompact = (n: number) => {
    if (n >= 1e6) {
      const v = n / 1e6;
      return `${Number.isInteger(v) ? v : v.toFixed(1)}M`;
    }
    if (n >= 1e3) {
      const v = n / 1e3;
      return `${Number.isInteger(v) ? v : v.toFixed(1)}K`;
    }
    return String(Math.round(n));
  };
  const commit = (loPct: number, hiPct: number) =>
    onChange?.([toValue(loPct), toValue(hiPct)]);

  const setFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    if (dragRef.current === "lo") setLo((prev) => Math.min(pct, hi - 4));
    else if (dragRef.current === "hi") setHi((prev) => Math.max(pct, lo + 4));
  };

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragRef.current) setFromClientX(e.clientX);
    };
    const up = () => {
      if (dragRef.current) {
        dragRef.current = null;
        commit(lo, hi);
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [lo, hi]);

  const thumb =
    "absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border-2 border-brand bg-white dark:bg-ink-900 shadow active:cursor-grabbing touch-none";

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-3 px-1">
        <div ref={trackRef} className="relative h-[15px] touch-none select-none">
          <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-ink-100 dark:bg-ink-800" />
          <div
            className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-brand"
            style={{ left: `${lo}%`, width: `${hi - lo}%` }}
          />
          <span
            role="slider"
            aria-label={`${label} minimum`}
            aria-valuemin={toValue(0)}
            aria-valuemax={toValue(100)}
            aria-valuenow={toValue(lo)}
            aria-valuetext={formatCompact(toValue(lo))}
            tabIndex={0}
            className={thumb}
            style={{ left: `${lo}%` }}
            onPointerDown={(e) => {
              dragRef.current = "lo";
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                const v = Math.max(0, lo - 2);
                setLo(v);
                commit(v, hi);
              }
              if (e.key === "ArrowRight") {
                const v = Math.min(hi - 4, lo + 2);
                setLo(v);
                commit(v, hi);
              }
            }}
          />
          <span
            role="slider"
            aria-label={`${label} maximum`}
            aria-valuemin={toValue(0)}
            aria-valuemax={toValue(100)}
            aria-valuenow={toValue(hi)}
            aria-valuetext={formatCompact(toValue(hi))}
            tabIndex={0}
            className={thumb}
            style={{ left: `${hi}%` }}
            onPointerDown={(e) => {
              dragRef.current = "hi";
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                const v = Math.max(lo + 4, hi - 2);
                setHi(v);
                commit(lo, v);
              }
              if (e.key === "ArrowRight") {
                const v = Math.min(100, hi + 2);
                setHi(v);
                commit(lo, v);
              }
            }}
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-ink-500 dark:text-ink-300">
          <span>{min}</span>
          {/* FINAL fix (Nov 12): show the currently selected range in
              the labelled scale, so what the slider commits is visible
              — previously only the end labels (0 / 10M) showed and the
              slider's own value read 100 (percent). */}
          <span className="font-semibold text-ink-900 dark:text-ink-50">
            {formatCompact(toValue(lo))} – {formatCompact(toValue(hi))}
          </span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  onChange,
}: {
  label: string;
  onChange?: (on: boolean) => void;
}) {
  const [on, setOn] = useState(false);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className="flex w-full cursor-pointer items-center justify-between py-1.5 text-left"
    >
      <span className="text-[15px] text-ink-900 dark:text-ink-50">{label}</span>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          on ? "bg-brand" : "bg-ink-200 dark:bg-ink-700"
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white dark:bg-ink-900 shadow transition-transform",
            on ? "translate-x-[22px]" : "translate-x-[2px]"
          )}
        />
      </span>
    </button>
  );
}

function CheckGroup({
  label,
  options,
  onChange,
}: {
  label: string;
  options: string[];
  onChange?: (values: string[]) => void;
}) {
  const [checked, setChecked] = useState<string[]>([]);
  const toggle = (o: string) => {
    setChecked((s) => {
      const next = s.includes(o) ? s.filter((x) => x !== o) : [...s, o];
      onChange?.(next);
      return next;
    });
  };
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="mt-2 space-y-1">
        {options.map((o) => (
          <label
            key={o}
            className="flex cursor-pointer items-center gap-3 py-1.5 text-[15px] text-ink-700 dark:text-ink-200"
          >
            <input
              type="checkbox"
              checked={checked.includes(o)}
              onChange={() => toggle(o)}
              className="h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-ink-300 dark:border-ink-700 accent-[#0c29ab]"
            />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function SelectRow({
  label,
  options,
  onChange,
}: {
  label: string;
  /** Real options; when omitted the select stays decorative (single "Choose" option, as before). */
  options?: string[];
  /** Emits the selected value, or "" when "Choose" is selected again. */
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState("Choose");
  return (
    <label className="block">
      <SectionLabel>{label}</SectionLabel>
      <span className="relative mt-2 block">
        <select
          className="h-[52px] w-full cursor-pointer appearance-none rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 pr-10 text-[15px] text-ink-400 dark:text-ink-300 focus:border-brand focus:outline-none"
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            onChange?.(next === "Choose" ? "" : next);
          }}
          aria-label={label}
        >
          <option>Choose</option>
          {(options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-500 dark:text-ink-300"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

export interface CampaignFilters {
  type: string;
  timelines: string[];
  locations: string[];
  /** Dollar range from the Budget slider; null = no budget filter. */
  budget: [number, number] | null;
  /** True = only campaigns posted by registered brand accounts (live API data). */
  verifiedOnly: boolean;
}

export interface CreatorFilters {
  /** Niche pill; "All" = no category filter. */
  category: string;
  /** Follower-count range from the Followers slider; null = no filter. */
  followers: [number, number] | null;
  /** Campaign-rate range from the Price slider; null = no filter. */
  price: [number, number] | null;
  verifiedOnly: boolean;
  availableNow: boolean;
  /** Selected language from the Language dropdown; "" = no filter. */
  language: string;
  /** Selected industry from the Industry Experience dropdown; "" = no filter. */
  industry: string;
  /** Selected skill from the Skills dropdown; "" = no skill filter. */
  skill: string;
}

export interface ProfessionalFilters {
  /** Category pill; "All" = no category filter. */
  category: string;
  /** Hourly-rate range from the Hourly Rate slider; null = no filter. */
  hourlyRate: [number, number] | null;
  verifiedOnly: boolean;
  availableNow: boolean;
  openToProjects: boolean;
  /** Selected experience levels ("Entry" | "Mid" | "Expert"); empty = no filter. */
  experience: string[];
  /** Selected skill from the Skills dropdown; "" = no skill filter. */
  skill: string;
  /** Selected language from the Language dropdown; "" = no filter. */
  language: string;
  /** Selected industry from the Industry Experience dropdown; "" = no filter. */
  industry: string;
}

const DEFAULT_CREATOR_FILTERS: CreatorFilters = {
  category: "All",
  followers: null,
  price: null,
  verifiedOnly: false,
  availableNow: false,
  language: "",
  industry: "",
  skill: "",
};

const DEFAULT_PROFESSIONAL_FILTERS: ProfessionalFilters = {
  category: "All",
  hourlyRate: null,
  verifiedOnly: false,
  availableNow: false,
  openToProjects: false,
  experience: [],
  skill: "",
  language: "",
  industry: "",
};

export function FilterPanel({
  kind,
  skillOptions,
  languageOptions,
  industryOptions,
  onFilterChange,
  onCreatorFilterChange,
  onProfessionalFilterChange,
  onClearSearch,
}: {
  kind: FilterKind;
  /** Distinct real skills across the loaded rows; feeds the Skills dropdown. */
  skillOptions?: string[];
  /** Distinct real languages across the loaded rows; feeds the Language dropdown. */
  languageOptions?: string[];
  /** Distinct real industries across the loaded rows; feeds the Industry Experience dropdown. */
  industryOptions?: string[];
  onFilterChange?: (filters: CampaignFilters) => void;
  onCreatorFilterChange?: (filters: CreatorFilters) => void;
  onProfessionalFilterChange?: (filters: ProfessionalFilters) => void;
  // Follow-up fix (Nov 12): "Clear all" used to reset only the panel
  // filters — the search keyword (owned by the parent page) stayed in
  // the box. The parent passes its search reset here so Clear all
  // clears everything, including the keyword.
  onClearSearch?: () => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const filtersRef = useRef<CampaignFilters>({
    type: "All",
    timelines: [],
    locations: [],
    budget: null,
    verifiedOnly: false,
  });
  const creatorRef = useRef<CreatorFilters>({ ...DEFAULT_CREATOR_FILTERS });
  const professionalRef = useRef<ProfessionalFilters>({ ...DEFAULT_PROFESSIONAL_FILTERS });

  const emit = (patch: Partial<CampaignFilters>) => {
    filtersRef.current = { ...filtersRef.current, ...patch };
    onFilterChange?.(filtersRef.current);
  };

  const emitCreator = (patch: Partial<CreatorFilters>) => {
    creatorRef.current = { ...creatorRef.current, ...patch };
    onCreatorFilterChange?.(creatorRef.current);
  };

  const emitProfessional = (patch: Partial<ProfessionalFilters>) => {
    professionalRef.current = { ...professionalRef.current, ...patch };
    onProfessionalFilterChange?.(professionalRef.current);
  };

  const clearAll = () => {
    filtersRef.current = {
      type: "All",
      timelines: [],
      locations: [],
      budget: null,
      verifiedOnly: false,
    };
    creatorRef.current = { ...DEFAULT_CREATOR_FILTERS };
    professionalRef.current = { ...DEFAULT_PROFESSIONAL_FILTERS };
    onFilterChange?.(filtersRef.current);
    onCreatorFilterChange?.(creatorRef.current);
    onProfessionalFilterChange?.(professionalRef.current);
    // Follow-up fix (Nov 12): Clear all also clears the search keyword.
    onClearSearch?.();
    setResetKey((k) => k + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold text-ink-900 dark:text-ink-50">Filters</p>
        <button
          type="button"
          onClick={clearAll}
          className="text-[15px] text-ink-900 dark:text-ink-50 hover:text-brand dark:hover:text-brand-200"
        >
          Clear all
        </button>
      </div>
      <div className="my-4 border-t border-ink-100 dark:border-ink-800" />

      {kind === "creators" && (
        <div className="space-y-6" key={resetKey}>
          <CategoryPills
            options={["All", "Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food", "Business", "Lifestyle"]}
            onChange={(category) => emitCreator({ category })}
          />
          <RangeSlider
            label="Followers"
            min="0"
            max="10M"
            onChange={(followers) => emitCreator({ followers })}
          />
          <RangeSlider
            label="Price"
            min="0"
            max="100K"
            onChange={(price) => emitCreator({ price })}
          />
          <ToggleRow
            label="Verified"
            onChange={(verifiedOnly) => emitCreator({ verifiedOnly })}
          />
          <ToggleRow
            label="Available Now"
            onChange={(availableNow) => emitCreator({ availableNow })}
          />
          <CheckGroup label="Audience Gender" options={["Male", "Female", "Other"]} />
          <SelectRow label="Country" />
          <SelectRow label="City" />
          <SelectRow
            label="Language"
            options={languageOptions}
            onChange={(language) => emitCreator({ language })}
          />
          <SelectRow
            label="Skills"
            options={skillOptions}
            onChange={(skill) => emitCreator({ skill })}
          />
          <SelectRow
            label="Industry Experience"
            options={industryOptions}
            onChange={(industry) => emitCreator({ industry })}
          />
          <SelectRow label="Engagement Rate" />
          <SelectRow label="Avg Views" />
          <SelectRow label="Featured" />
          <SelectRow label="Years Experience" />
          <SelectRow label="Audience Country" />
          <SelectRow label="Response Time" />
        </div>
      )}

      {kind === "professionals" && (
        <div className="space-y-6" key={resetKey}>
          <CategoryPills
            options={["All", "Editors", "Copywriters", "Designers"]}
            cols={2}
            onChange={(category) => emitProfessional({ category })}
          />
          <RangeSlider
            label="Hourly Rate"
            min="0"
            max="100K"
            onChange={(hourlyRate) => emitProfessional({ hourlyRate })}
          />
          <ToggleRow
            label="Verified"
            onChange={(verifiedOnly) => emitProfessional({ verifiedOnly })}
          />
          <ToggleRow
            label="Available Now"
            onChange={(availableNow) => emitProfessional({ availableNow })}
          />
          <ToggleRow
            label="Open to new projects"
            onChange={(openToProjects) => emitProfessional({ openToProjects })}
          />
          <CheckGroup
            label="Experience Level"
            options={["Entry", "Mid", "Expert"]}
            onChange={(experience) => emitProfessional({ experience })}
          />
          <SelectRow label="Country" />
          <SelectRow
            label="Language"
            options={languageOptions}
            onChange={(language) => emitProfessional({ language })}
          />
          <SelectRow
            label="Skills"
            options={skillOptions}
            onChange={(skill) => emitProfessional({ skill })}
          />
          <SelectRow
            label="Industry Experience"
            options={industryOptions}
            onChange={(industry) => emitProfessional({ industry })}
          />
        </div>
      )}

      {kind === "campaigns" && (
        <div className="space-y-6" key={resetKey}>
          <CategoryPills
            options={["All", "One-time project", "Long-term", "Retainer"]}
            cols={2}
            onChange={(type) => emit({ type })}
          />
          <RangeSlider
            label="Budget"
            min="0"
            max="100K"
            onChange={(budget) => emit({ budget })}
          />
          <ToggleRow
            label="Verified"
            onChange={(verifiedOnly) => emit({ verifiedOnly })}
          />
          <CheckGroup
            label="Timeline"
            options={[
              "Urgent (within 1 week)",
              "Within 1 month",
              "1–3 months",
              "3+ months",
              "Flexible",
            ]}
            onChange={(timelines) => emit({ timelines })}
          />
          <CheckGroup
            label="Location"
            options={["Remote", "Hybrid", "On-site"]}
            onChange={(locations) => emit({ locations })}
          />
          <SelectRow label="Country" />
          <SelectRow label="Language" />
          <SelectRow label="Skills" />
          <SelectRow label="Industry" />
        </div>
      )}
    </div>
  );
}
