"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Combobox } from "@/components/ui/Combobox";
import { api } from "@/lib/api";

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
  onChange,
}: {
  options: string[];
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
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => select(o)}
            className={cn(
              "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
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
    if (dragRef.current === "lo") setLo(Math.min(pct, hi - 4));
    else if (dragRef.current === "hi") setHi(Math.max(pct, lo + 4));
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
  /** Dollar range from the Budget slider; null = no budget filter. */
  budget: [number, number] | null;
  /** Selected country from the Country dropdown; "" = no filter. */
  country: string;
  /** Selected city from the City dropdown; "" = no filter. */
  city: string;
  /** Selected language from the Language dropdown; "" = no filter. */
  language: string;
  /** Selected skill from the Skills dropdown; "" = no skill filter. */
  skill: string;
  /** Selected industry from the Industry dropdown; "" = no filter. */
  industry: string;
}

export interface CreatorFilters {
  /** Niche pill; "All" = no category filter. */
  category: string;
  /** Follower-count range from the Followers slider; null = no filter. */
  followers: [number, number] | null;
  /** Campaign-rate range from the Price slider; null = no filter. */
  price: [number, number] | null;
  availableNow: boolean;
  /** Selected country from the Country dropdown; "" = no filter. */
  country: string;
  /** Selected city from the City dropdown; "" = no filter. */
  city: string;
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
  availableNow: boolean;
  /** Selected country from the Country dropdown; "" = no filter. */
  country: string;
  /** Selected city from the City dropdown; "" = no filter. */
  city: string;
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
  availableNow: false,
  country: "",
  city: "",
  language: "",
  industry: "",
  skill: "",
};

const DEFAULT_PROFESSIONAL_FILTERS: ProfessionalFilters = {
  category: "All",
  hourlyRate: null,
  availableNow: false,
  country: "",
  city: "",
  openToProjects: false,
  experience: [],
  skill: "",
  language: "",
  industry: "",
};

export function FilterPanel({
  kind,
  countryOptions,
  cityOptions,
  skillOptions,
  languageOptions,
  industryOptions,
  onFilterChange,
  onCreatorFilterChange,
  onProfessionalFilterChange,
  onClearSearch,
}: {
  kind: FilterKind;
  /** Distinct real countries across the loaded rows; feeds the Country dropdown. */
  countryOptions?: string[];
  /** Legacy prop, kept for call-site compatibility: cities are now
      fetched per-country inside this panel (GET /profiles/datasets/
      cities?country=...) and this value is ignored. */
  cityOptions?: string[];
  /** Distinct real skills across the loaded rows; feeds the Skills dropdown. */
  skillOptions?: string[];
  /** Distinct real languages across the loaded rows; feeds the Language dropdown. */
  languageOptions?: string[];
  /** Distinct real industries across the loaded rows; feeds the Industry Experience dropdown. */
  industryOptions?: string[];
  onFilterChange?: (filters: CampaignFilters) => void;
  onCreatorFilterChange?: (filters: CreatorFilters) => void;
  onProfessionalFilterChange?: (filters: ProfessionalFilters) => void;
  onClearSearch?: () => void;
}) {
  const [resetKey, setResetKey] = useState(0);
  const filtersRef = useRef<CampaignFilters>({
    type: "All",
    budget: null,
    country: "",
    city: "",
    language: "",
    skill: "",
    industry: "",
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

  // Country/City are searchable dataset dropdowns (not native selects):
  // the City list narrows to the chosen country's cities, fetched from
  // GET /profiles/datasets/cities?country=... . Picking a country
  // clears the city (it cannot belong to the new country). With no
  // country picked the City list is empty by design.
  const [countryValue, setCountryValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [cityOptionsState, setCityOptionsState] = useState<string[]>([]);
  const onCountry = (country: string) => {
    setCountryValue(country);
    setCityValue("");
    setCityOptionsState([]);
    if (kind === "creators") emitCreator({ country, city: "" });
    else if (kind === "professionals") emitProfessional({ country, city: "" });
    else emit({ country, city: "" });
    if (country) {
      api.datasetCities(country).then((d) => setCityOptionsState(d.cities)).catch(() => {});
    }
  };
  const onCity = (city: string) => {
    setCityValue(city);
    if (kind === "creators") emitCreator({ city });
    else if (kind === "professionals") emitProfessional({ city });
    else emit({ city });
  };

  const clearAll = () => {
    filtersRef.current = {
      type: "All",
      budget: null,
      country: "",
      city: "",
      language: "",
      skill: "",
      industry: "",
    };
    creatorRef.current = { ...DEFAULT_CREATOR_FILTERS };
    professionalRef.current = { ...DEFAULT_PROFESSIONAL_FILTERS };
    setCountryValue("");
    setCityValue("");
    setCityOptionsState([]);
    onFilterChange?.(filtersRef.current);
    onCreatorFilterChange?.(creatorRef.current);
    onProfessionalFilterChange?.(professionalRef.current);
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
          className="cursor-pointer text-[15px] text-ink-900 dark:text-ink-50 hover:text-brand dark:hover:text-brand-200"
        >
          Clear all
        </button>
      </div>
      <div className="my-4 border-t border-ink-100 dark:border-ink-800" />

      {kind === "creators" && (
        <div className="space-y-6" key={resetKey}>
          <CategoryPills
            options={["All", ...(industryOptions ?? ["Fashion", "Beauty", "Fitness", "Gaming", "Travel", "Food", "Business", "Lifestyle"])]}
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
            label="Available Now"
            onChange={(availableNow) => emitCreator({ availableNow })}
          />
          <Combobox
            label="Country"
            placeholder="Search countries…"
            value={countryValue}
            options={countryOptions ?? []}
            onChange={onCountry}
          />
          <Combobox
            label="City"
            placeholder={countryValue ? "Search cities…" : "Select a country first"}
            value={cityValue}
            options={cityOptionsState}
            onChange={onCity}
            disabled={!countryValue}
          />
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
        </div>
      )}

      {kind === "professionals" && (
        <div className="space-y-6" key={resetKey}>
          <CategoryPills
            options={["All", "Editors", "Copywriters", "Designers"]}
            onChange={(category) => emitProfessional({ category })}
          />
          <RangeSlider
            label="Hourly Rate"
            min="0"
            max="100K"
            onChange={(hourlyRate) => emitProfessional({ hourlyRate })}
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
          <Combobox
            label="Country"
            placeholder="Search countries…"
            value={countryValue}
            options={countryOptions ?? []}
            onChange={onCountry}
          />
          <Combobox
            label="City"
            placeholder={countryValue ? "Search cities…" : "Select a country first"}
            value={cityValue}
            options={cityOptionsState}
            onChange={onCity}
            disabled={!countryValue}
          />
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
            onChange={(type) => emit({ type })}
          />
          <RangeSlider
            label="Budget"
            min="0"
            max="100K"
            onChange={(budget) => emit({ budget })}
          />
          <Combobox
            label="Country"
            placeholder="Search countries…"
            value={countryValue}
            options={countryOptions ?? []}
            onChange={onCountry}
          />
          <Combobox
            label="City"
            placeholder={countryValue ? "Search cities…" : "Select a country first"}
            value={cityValue}
            options={cityOptionsState}
            onChange={onCity}
            disabled={!countryValue}
          />
          <SelectRow
            label="Language"
            options={languageOptions}
            onChange={(language) => emit({ language })}
          />
          <SelectRow
            label="Skills"
            options={skillOptions}
            onChange={(skill) => emit({ skill })}
          />
          <SelectRow
            label="Industry"
            options={industryOptions}
            onChange={(industry) => emit({ industry })}
          />
        </div>
      )}
    </div>
  );
}
