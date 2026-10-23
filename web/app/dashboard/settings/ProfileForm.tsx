"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
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
  // below). The form previously initialised with the design-mock user
  // ("Olivia Martinez"), which flashed as a stranger's data on load.
  const [values, setValues] = useState({
    fullName: "",
    username: "",
    location: "",
    website: "",
    bio: "",
  });
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
        username: "",
        location: p.location || "",
        website: p.website || "",
        bio: user.role === "brand" ? p.description || "" : p.bio || "",
      });
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
      if (user.role === "brand") {
        payload.companyName = values.fullName;
        payload.website = values.website;
        payload.description = values.bio;
      } else {
        payload.displayName = values.fullName;
        payload.bio = values.bio;
        payload.website = values.website;
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
      <p className="mt-1 text-[15px] text-ink-500">
        Manage your public profile information.
      </p>
      <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
        <AuthError message={error} />
        <div>
          <p className="text-sm font-medium text-ink-900">Profile Photo</p>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <span
              aria-hidden
              className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand"
            >
              {initials}
            </span>
            <div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="sm">
                  Upload
                </Button>
                <Button type="button" variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
              <p className="mt-2 text-xs text-ink-400">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full Name"
            placeholder="Full Name"
            {...field("fullName")}
          />
          <TextField
            label="Username"
            placeholder="Username"
            {...field("username")}
          />
          <TextField label="Location" {...field("location")} />
          <TextField label="Website" {...field("website")} />
        </div>
        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="bio"
            className="text-sm font-medium text-ink-900"
          >
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            placeholder="Tell brands and clients a little about yourself..."
            className="w-full resize-none rounded-xl border border-ink-300 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
            {...field("bio")}
          />
        </div>
        <div>
          <Button type="submit" className="min-w-[161px]" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
          {saved && (
            <p className="mt-3 text-sm font-medium text-success">
              Profile updated.
            </p>
          )}
        </div>
      </form>
    </>
  );
}
