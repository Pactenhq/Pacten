"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { api } from "@/lib/api";

// desktop + "mob Campaign Request"
// (339:10337) mobile: a public page with the marketing navbar and footer.
// "Send a Collaboration Request" — "Fill in the details below and the
// creator will review your request." All labels and placeholders verbatim.
export default function CampaignRequestPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    // In-page validation: the form carries noValidate so the browser's
    // native bubble ("Please fill out this field") never blocks the
    // submit — empty required fields surface as visible errors on the
    // page itself instead.
    const form = new FormData(e.currentTarget);
    const title = ((form.get("title") as string) ?? "").trim();
    const description = ((form.get("description") as string) ?? "").trim();
    const errs: { title?: string; description?: string } = {};
    if (!title) errs.title = "Campaign title is required.";
    if (!description)
      errs.description = "Campaign description is required.";
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await api.createCampaign({
        title: form.get("title") as string,
        description: form.get("description") as string,
        deliverables: form.get("deliverables") as string,
        budget: form.get("budget") as string,
        deadline: form.get("deadline") as string,
        notes: form.get("notes") as string,
      });
      setSent(true);
    } catch (err: any) {
      // NEVER show the "Campaign published" success state after a failed
      // request: a failed POST means no row was created, and showing
      // success here made a failed first attempt look published (the
      // campaign then "never appeared" in /campaigns). Every error
      // surfaces as an error instead.
      // NOTE: apiFetch throws err.message = the API's message string,
      // NOT "Request failed (401/403)" — Nest returns "Unauthorized" /
      // "Forbidden resource" — so match those messages (plus the
      // status-code forms, for safety) rather than "401"/"403".
      const msg = err?.message ?? "";
      if (
        msg === "Unauthorized" ||
        msg === "Forbidden resource" ||
        msg.includes("401") ||
        msg.includes("403")
      ) {
        setError("Please log in as a brand to post campaigns.");
      } else {
        setError(
          msg ||
            "Something went wrong — your campaign was not published. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-ink-900">
      <Navbar />
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-12">
        <h1 className="text-[40px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          Create a Campaign
        </h1>
        <p className="mt-2 text-[16px] text-ink-500 dark:text-ink-300">
          Fill in the details below and publish your campaign — creators can
          then discover it and apply.
        </p>

        {sent ? (
          <Card className="mt-8 p-10 text-center">
            <p className="text-[22px] font-extrabold text-ink-900 dark:text-ink-50">
              Campaign published
            </p>
            <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-500 dark:text-ink-300">
              Your campaign is now live — creators can discover it and apply.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" onClick={() => setSent(false)}>
                Send Another Request
              </Button>
              <Link href="/dashboard/campaigns">
                <Button size="lg" variant="outline">
                  View My Campaigns
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="mt-8 p-6 sm:p-8">
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </p>
              )}
              <TextField
                label="Campaign Title"
                name="title"
                placeholder="e.g. Summer Collection Launch"
                error={fieldErrors.title}
                onChange={() =>
                  setFieldErrors((f) => ({ ...f, title: undefined }))
                }
              />
              <div>
                <label
                  htmlFor="req-description"
                  className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-50"
                >
                  Campaign Description
                </label>
                <textarea
                  id="req-description"
                  name="description"
                  rows={5}
                  placeholder="Describe your campaign, brand, and what you'd like the creator to do..."
                  onChange={() =>
                    setFieldErrors((f) => ({ ...f, description: undefined }))
                  }
                  className={`w-full rounded-xl border bg-white dark:bg-ink-900 px-4 py-3 text-[15px] text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:outline-none focus:ring-2 ${
                    fieldErrors.description
                      ? "border-danger focus:border-danger focus:ring-danger-bg"
                      : "border-ink-300 dark:border-ink-700 focus:border-brand focus:ring-brand-100"
                  }`}
                />
                {fieldErrors.description && (
                  <p className="mt-1.5 text-xs text-danger dark:text-danger-bright">
                    {fieldErrors.description}
                  </p>
                )}
              </div>
              <TextField
                label="Deliverables Needed"
                name="deliverables"
                placeholder="e.g. 2× TikTok videos, 3× Instagram Stories, 1× YouTube integration"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Budget"
                  name="budget"
                  placeholder="e.g. $500 – $1,000"
                  inputMode="decimal"
                />
                <TextField
                  label="Deadline"
                  name="deadline"
                  placeholder="e.g. Nov 30, 2026"
                />
              </div>
              <div>
                <label
                  htmlFor="req-notes"
                  className="mb-1.5 block text-sm font-medium text-ink-900 dark:text-ink-50"
                >
                  Additional Notes
                </label>
                <textarea
                  id="req-notes"
                  name="notes"
                  rows={5}
                  placeholder="Anything else the creator should know?"
                  className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-3 text-[15px] text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="mt-2 flex flex-col gap-3">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Publishing..." : "Publish Campaign →"}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
