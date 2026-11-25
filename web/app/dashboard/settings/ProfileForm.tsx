"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Combobox, MultiCombobox } from "@/components/ui/Combobox";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { AuthError } from "@/components/auth/auth-forms";

// Profile panel of /dashboard/settings. layout and copy kept as designed;
// fields are pre-filled from the real profile when logged in and saved via
// PATCH /profiles/me. Logged-out visitors see the original mock defaults.
export function SettingsProfileForm() {
  const { user, profile, loading, refresh } = useAuth();
  const router = useRouter();
  // Start EMPTY and fill from the real session profile (the useEffect
  // below).
  const [values, setValues] = useState({
    fullName: "",
    location: "",
    website: "",
    bio: "",
    // Platforms and Niches stay comma-separated free text (out of the
    // dataset scope, unchanged). Languages/Industries/Skills moved to
    // dataset multi-selects below; Country/City to dataset dropdowns.
    platforms: "",
    // Creator-only: niches feed the Category pills; rate is the
    // "Typical rate" the public profile shows. For professionals the
    // same `rate` form state carries `hourlyRate` — the professional
    // profile has no `rate` column, only `hourlyRate` (rendered as
    // "$X/hr" on the public profile), and the API allowlist accepts
    // `hourlyRate` for professionals.
    niches: "",
    rate: "",
  });
  // Dataset-backed fields. Stored shape is UNCHANGED (country/city
  // strings, languages/industries/skills text[] arrays) — no migration.
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [datasets, setDatasets] = useState<{
    countries: { code: string; name: string }[];
    languages: string[];
    skills: string[];
    industries: string[];
  } | null>(null);
  const [cityOptions, setCityOptions] = useState<string[]>([]);

  // Load the standardized dataset once (countries/languages/skills/
  // industries); cities load per selected country, below.
  useEffect(() => {
    api.datasets().then(setDatasets).catch(() => {});
  }, []);

  // Cities narrow to the chosen country. On first load this just
  // populates the list (a stored city outside the dataset still shows
  // as a legacy value in the dropdown); when the USER changes the
  // country, handleCountryChange clears a city that is not in the new
  // country's list.
  useEffect(() => {
    if (!country) {
      setCityOptions([]);
      return;
    }
    let cancelled = false;
    api
      .datasetCities(country)
      .then((d) => {
        if (!cancelled) setCityOptions(d.cities);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [country]);

  const handleCountryChange = (next: string) => {
    setCountry(next);
    if (!next) {
      setCity("");
      return;
    }
    // Clear the city if it is not in the new country's list.
    api
      .datasetCities(next)
      .then((d) => {
        setCityOptions(d.cities);
        setCity((cur) => (cur && !d.cities.includes(cur) ? "" : cur));
      })
      .catch(() => {});
  };
  const [initials, setInitials] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      const p = profile || {};
      const name =
        user.role === "brand"
          ? p.companyName || `${user.firstName}'s Company`
          : p.displayName || `${user.firstName} ${user.lastName}`;
      setValues({
        fullName: name,
        location: p.location || "",
        website: p.website || "",
        bio: user.role === "brand" ? p.description || "" : p.bio || "",
        platforms: Array.isArray(p.platforms) ? p.platforms.join(", ") : "",
        niches: Array.isArray(p.niches) ? p.niches.join(", ") : "",
        // Creators store `rate`; professionals store `hourlyRate`.
        rate:
          p.rate != null
            ? String(p.rate)
            : p.hourlyRate != null
              ? String(p.hourlyRate)
              : "",
      });
      setCountry(p.country || "");
      setCity(p.city || "");
      setLanguages(Array.isArray(p.languages) ? p.languages : []);
      setIndustries(Array.isArray(p.industries) ? p.industries : []);
      setSkills(Array.isArray(p.skills) ? p.skills : []);
      setInitials(
        name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      );
    }
  }, [loading, user, profile]);

  const field = (name: keyof typeof values) => ({
    name,
    value: values[name],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setValues((v) => ({ ...v, [name]: e.target.value })),
  });

  // "English, Urdu" -> ["English", "Urdu"]; blanks and duplicates dropped.
  const parseList = (raw: string): string[] => {
    const seen = new Set<string>();
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !seen.has(s) && (seen.add(s), true));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        location: values.location,
      };
      if (user.role !== "brand") {
        payload.country = country.trim();
        payload.city = city.trim();
      }
      if (user.role === "brand") {
        payload.companyName = values.fullName;
        payload.website = values.website;
        payload.description = values.bio;
      } else {
        payload.displayName = values.fullName;
        payload.bio = values.bio;
        payload.languages = languages;
        payload.industries = industries;
        payload.skills = skills;
        payload.platforms = parseList(values.platforms);
        if (user.role === "creator") {
          payload.niches = parseList(values.niches);
          payload.rate = values.rate.trim();
        } else if (user.role === "professional") {
          // Professional profiles carry `hourlyRate`, not `rate` —
          // the API allowlist accepts it for professionals.
          payload.hourlyRate = values.rate.trim();
        }
      }
      await api.updateProfile(payload);
      await refresh();
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">
        Manage your public profile information.
      </p>
      <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
        <AuthError message={error} />
        <div>
          <p className="text-sm font-medium text-ink-900 dark:text-ink-50">Profile Photo</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span
              aria-hidden
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-100 dark:bg-brand/25 text-2xl font-bold text-brand dark:text-brand-200"
            >
              {initials}
            </span>
            <p className="mt-2 text-xs text-ink-400 dark:text-ink-300">
              Your initials show until a photo is added.
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full Name"
            placeholder="Full Name"
            {...field("fullName")}
          />
          <TextField label="Location" {...field("location")} />
          {user?.role !== "brand" && (
            <>
              <Combobox
                label="Country"
                placeholder="e.g. United Kingdom"
                hint="Feeds the marketplace Country filter."
                value={country}
                options={(datasets?.countries ?? []).map((c) => c.name)}
                onChange={handleCountryChange}
              />
              <Combobox
                label="City"
                placeholder={country ? "e.g. London" : "Select a country first"}
                hint="Feeds the marketplace City filter."
                value={city}
                options={cityOptions}
                onChange={setCity}
                disabled={!country}
              />
            </>
          )}
          {/* Website is a brand-profile field only: creator/professional
              profiles have no website column, so the input was silently
              discarded for them (same class as the removed Username
              field). Brand keeps it — its allowlist carries `website`. */}
          {user?.role === "brand" && (
            <TextField label="Website" {...field("website")} />
          )}
          {user?.role !== "brand" && (
            <>
              <MultiCombobox
                label="Languages"
                placeholder="English, Urdu, Spanish"
                hint="Pick from the list — these feed the marketplace Language filter."
                values={languages}
                options={datasets?.languages ?? []}
                onChange={setLanguages}
              />
              <MultiCombobox
                label="Industries"
                placeholder="Fashion, Beauty, Fitness"
                hint="Pick from the list — these feed the marketplace Industry Experience filter."
                values={industries}
                options={datasets?.industries ?? []}
                onChange={setIndustries}
              />
              <MultiCombobox
                label="Skills"
                placeholder="Video Editing, Photography"
                hint="Pick from the list — these feed the marketplace Skills filter."
                values={skills}
                options={datasets?.skills ?? []}
                onChange={setSkills}
              />
              <TextField
                label="Platforms"
                placeholder="TikTok, Instagram, YouTube"
                hint="Separate with commas."
                {...field("platforms")}
              />
            </>
          )}
          {user?.role === "creator" && (
            <>
              <TextField
                label="Niches"
                placeholder="Fashion, Beauty, Fitness"
                hint="Separate with commas — these feed the Category filter."
                {...field("niches")}
              />
              <TextField
                label="Rate"
                placeholder="500"
                hint="Your typical rate, e.g. 500 — shown on your public profile."
                {...field("rate")}
              />
            </>
          )}
          {user?.role === "professional" && (
            <TextField
              label="Hourly Rate"
              placeholder="50"
              hint="Your hourly rate, e.g. 50 — shown on your public profile as $50/hr."
              {...field("rate")}
            />
          )}
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="bio"
            className="text-sm font-medium text-ink-900 dark:text-ink-50"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Tell businesses and clients a little about yourself..."
            className="w-full resize-none rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 text-[15px] text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
            {...field("bio")}
          />
        </div>
        <div>
          <Button type="submit" className="min-w-[161px]" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          {saved && (
            <p className="mt-3 text-sm font-medium text-success dark:text-success-bright">
              Profile updated.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
