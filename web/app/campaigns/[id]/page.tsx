"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { campaignListings } from "@/lib/mock";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

// Public campaign detail — opened by the "View Details" button on
// marketplace cards. Same visual language as /campaigns (Navbar/Footer,
// Card, meta pills). No Figma frame exists for this view; layout reuses
// existing components only. Data comes from the real API with mock fallback.
function CampaignDetailContent() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Apply-to-campaign state (creators/professionals only)
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  useEffect(() => {
    api
      .campaignDetail(id)
      .then((data) => {
        if (data && data.id) {
          setCampaign({
            id: data.id,
            title: data.title,
            brand: data.brand?.email ?? data.brand?.name ?? "Brand",
            description: data.description ?? "",
            budget: data.budget ?? "",
            timeline: data.deadline ?? "",
            type: data.status ?? "",
            location: "",
            postedAt: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString()
              : "",
            deliverables: data.deliverables ?? "",
            notes: data.notes ?? "",
            niches: data.niches ?? [],
          });
        }
      })
      .catch(() => {
        // API unavailable — fall back to mock listing
        const mock = campaignListings.find((c) => c.id === id);
        if (mock) setCampaign(mock);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || (user.role !== "creator" && user.role !== "professional")) return;
    api
      .myApplications()
      .then((apps: any[]) => {
        if (Array.isArray(apps) && apps.some((a: any) => (a.campaignId ?? a.campaign?.id) === id)) {
          setAlreadyApplied(true);
        }
      })
      .catch(() => {});
  }, [user, id]);

  const canApply = !!user && (user.role === "creator" || user.role === "professional");

  const submitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setApplyError("");
    try {
      await api.applyToCampaign(id, { coverLetter });
      setApplySuccess(true);
      setAlreadyApplied(true);
      setApplyOpen(false);
    } catch (err: any) {
      setApplyError(err?.message ?? "Could not submit your application. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const pills = campaign
    ? [campaign.budget, campaign.timeline, campaign.type].filter(Boolean)
    : [];

  return (
    <>
      <Navbar />
      <main className="pb-20">
        <div className="mx-auto mt-10 max-w-[1380px] px-6 lg:px-12">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path
                d="M14 8H2M6 3.5 2.5 8 6 12.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to campaigns
          </Link>

          {loading ? (
            <p className="mt-8 text-ink-500">Loading campaign...</p>
          ) : !campaign ? (
            <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-12 text-center shadow-card">
              <p className="text-lg font-medium text-ink-900">Campaign not found</p>
              <p className="mt-2 text-[15px] text-ink-600">
                This campaign may have been removed.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-card lg:p-10">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                    <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" />
                    <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" transform="rotate(60 12 12)" />
                    <ellipse cx="12" cy="12" rx="9.5" ry="3.8" stroke="currentColor" strokeWidth="1.6" transform="rotate(120 12 12)" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-ink-900 lg:text-3xl">
                    {campaign.title}
                  </h1>
                  <p className="mt-1 text-[15px] text-ink-600">{campaign.brand}</p>
                </div>
              </div>

              {pills.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {pills.map((m: string) => (
                    <span
                      key={m}
                      className="inline-flex h-9 items-center rounded-full border border-ink-300 bg-white px-4 text-[13px] font-medium text-ink-700"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {campaign.niches?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {campaign.niches.map((n: string) => (
                    <span
                      key={n}
                      className="inline-flex h-8 items-center rounded-full bg-brand-50 px-3 text-[13px] font-medium text-brand"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-8">
                <h2 className="text-lg font-bold text-ink-900">About this campaign</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
                  {campaign.description}
                </p>
              </div>

              {campaign.deliverables && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-ink-900">Deliverables</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
                    {campaign.deliverables}
                  </p>
                </div>
              )}

              {campaign.notes && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-ink-900">Notes</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-900">
                    {campaign.notes}
                  </p>
                </div>
              )}

              {campaign.postedAt && (
                <p className="mt-8 text-sm text-ink-400">
                  Posted {campaign.postedAt}
                </p>
              )}

              {/* Apply to this campaign — creators & professionals only */}
              {canApply && (
                <div className="mt-8 rounded-2xl border border-brand/25 bg-brand-50/50 p-6">
                  {applySuccess || alreadyApplied ? (
                    <div>
                      <h2 className="text-lg font-bold text-ink-900">
                        {applySuccess ? "Application sent!" : "Already applied"}
                      </h2>
                      <p className="mt-2 text-[15px] text-ink-600">
                        {applySuccess
                          ? "The brand has received your application and will review it shortly."
                          : "You have already applied to this campaign. The brand will review it shortly."}
                      </p>
                      <Link
                        href="/dashboard/applications"
                        className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
                      >
                        View my applications
                      </Link>
                    </div>
                  ) : applyOpen ? (
                    <form onSubmit={submitApplication}>
                      <h2 className="text-lg font-bold text-ink-900">Apply to this campaign</h2>
                      <p className="mt-2 text-[15px] text-ink-600">
                        Tell the brand why you&apos;re a great fit.
                      </p>
                      <textarea
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder="Write a short cover letter (optional)..."
                        rows={4}
                        className="mt-4 w-full resize-none rounded-xl border border-ink-300 bg-white px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                      {applyError && (
                        <p className="mt-2 text-sm font-medium text-red-600">{applyError}</p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button type="submit" disabled={applying}>
                          {applying ? "Sending..." : "Submit application"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setApplyOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-ink-900">
                          Interested in this campaign?
                        </h2>
                        <p className="mt-1 text-[15px] text-ink-600">
                          Send the brand your application in one click.
                        </p>
                      </div>
                      <Button size="lg" onClick={() => setApplyOpen(true)}>
                        Apply Now
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {!user && (
                <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 text-center shadow-card">
                  <p className="text-[15px] text-ink-600">
                    Want to apply?{" "}
                    <Link href="/login" className="font-semibold text-brand hover:underline">
                      Log in
                    </Link>{" "}
                    as a creator or professional to send your application.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CampaignDetailPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="pb-20">
            <div className="mx-auto mt-10 max-w-[1380px] px-6 lg:px-12">
              <p className="text-ink-500">Loading campaign...</p>
            </div>
          </main>
          <Footer />
        </>
      }
    >
      <CampaignDetailContent />
    </Suspense>
  );
}
