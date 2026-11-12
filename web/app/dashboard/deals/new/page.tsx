"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

// NOTE: No Figma design exists for New Deal — basic functional form.
type CreatorOption = { id: string; name: string; email?: string | null; detail?: string };

// D1: the form draft is preserved in sessionStorage so typed input
// survives any remount — the creator list resolving, navigating away
// and back, or an auth re-check. Plain direct deals only: conversion
// flows (?applicationId / ?opportunityId) have their own prefill and
// never read or write the draft, so a stale draft can never hijack a
// conversion.
const DRAFT_KEY = "pacten-new-deal-draft-v1";

type DealDraft = {
  form: {
    title: string;
    description: string;
    creatorId: string;
    agreedBudget: string;
    deadline: string;
    deliverables: string;
    terms: string;
  };
  manualCreator: boolean;
};

function loadDraft(): DealDraft | null {
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DealDraft>;
    if (!parsed || typeof parsed.form !== "object" || !parsed.form) return null;
    const f = parsed.form;
    if (
      typeof f.title !== "string" ||
      typeof f.description !== "string" ||
      typeof f.creatorId !== "string"
    ) {
      return null;
    }
    return {
      form: {
        title: f.title,
        description: f.description,
        creatorId: f.creatorId,
        agreedBudget: typeof f.agreedBudget === "string" ? f.agreedBudget : "",
        deadline: typeof f.deadline === "string" ? f.deadline : "",
        deliverables: typeof f.deliverables === "string" ? f.deliverables : "",
        terms: typeof f.terms === "string" ? f.terms : "",
      },
      manualCreator: parsed.manualCreator === true,
    };
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage unavailable */
  }
}

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const opportunityId = searchParams.get("opportunityId");
  const creatorParam = searchParams.get("creatorId");
  // Conversion/direct-link visits prefill from the server instead and
  // never restore a draft (see DRAFT_KEY note above).
  const hasPrefillParams = Boolean(applicationId || opportunityId || creatorParam);
  const [form, setForm] = useState(() => {
    const base = {
      title: "",
      description: "",
      creatorId: creatorParam ?? "",
      agreedBudget: "",
      deadline: "",
      deliverables: "",
      terms: "",
      applicationId: applicationId ?? "",
      opportunityId: opportunityId ?? "",
    };
    if (hasPrefillParams) return base;
    const draft = loadDraft();
    return draft ? { ...base, ...draft.form } : base;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // FINAL fix (Nov 12): the conversion pre-fill below fetches its
  // source async — on slow staging the form used to look ready (and
  // the banner already claimed "details pre-filled") while the fetch
  // was still in flight, so a deal could be submitted before the
  // values ever landed. While the source loads, the submit stays
  // disabled. True only for conversion visits (applicationId /
  // opportunityId); a plain direct deal never fetches.
  const [prefillLoading, setPrefillLoading] = useState(
    Boolean(applicationId || opportunityId)
  );
  // Set on successful creation: shows a success banner with a link to
  // the created deal even if the redirect below ever fails to navigate,
  // so the form never silently sits there after the deal exists.
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);
  // null = loading, [] = fetch failed/empty -> fall back to manual UUID entry
  const [creators, setCreators] = useState<CreatorOption[] | null>(null);
  // Manual entry lets a brand hire ANY creator by user ID. The dropdown
  // only carries the top 100 by rating, so without this toggle a
  // brand-new creator (or any creator past the 100th) could never be
  // selected for a direct deal once the directory grew past 100.
  const [manualCreator, setManualCreator] = useState(() => {
    if (hasPrefillParams) return false;
    return loadDraft()?.manualCreator ?? false;
  });

  // D1: persist the draft on every change so a remount restores it.
  useEffect(() => {
    if (hasPrefillParams) return;
    try {
      const { applicationId: _a, opportunityId: _o, ...rest } = form;
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ form: rest, manualCreator })
      );
    } catch {
      /* storage unavailable */
    }
  }, [form, manualCreator, hasPrefillParams]);

  useEffect(() => {
    // D2 (dropdown disambiguation): prefer the brand-only directory
    // WITH emails, so two creators sharing a display name are
    // distinguishable. Fall back to the public list (name + location /
    // rate as the distinguishing detail) if the authed call fails.
    const toOption = (c: any): CreatorOption => ({
      id: String(c.userId),
      name: c.displayName ?? "Creator",
      email: c.email ?? null,
      detail: [c.location, c.rate].filter(Boolean).join(" · ") || undefined,
    });
    api
      .creatorsForDeal("?limit=100")
      .then((data) => {
        if (Array.isArray(data)) {
          setCreators(
            data.filter((c: any) => c?.userId).map(toOption)
          );
        } else {
          setCreators([]);
        }
      })
      .catch(() =>
        api
          .creators("?limit=100")
          .then((data) => {
            if (Array.isArray(data)) {
              setCreators(
                data
                  .filter((c: any) => c?.userId)
                  .map(toOption)
              );
            } else {
              setCreators([]);
            }
          })
          .catch(() => {
            // API unavailable — fall back to manual UUID entry
            setCreators([]);
          })
      );
  }, []);

  // Pre-fill from an accepted application (application-to-deal conversion)
  useEffect(() => {
    if (!applicationId) return;
    let alive = true;
    api
      .receivedApplications()
      .then((apps: any[]) => {
        if (!alive) return;
        const app = (Array.isArray(apps) ? apps : []).find((a: any) => a.id === applicationId);
        if (!app) return;
        setForm((f) => ({
          ...f,
          title: app.campaign?.title ? app.campaign.title : f.title,
          creatorId: app.applicantId ?? f.creatorId,
          // FINAL fix (Nov 12): the budget used to come only from
          // app.proposedBudget — but the apply form never sends one
          // (it posts only { coverLetter }), so it was always empty
          // and the created deal showed Agreed Budget "-". The
          // campaign's own budget is the real source; the deadline
          // and deliverables come from the campaign too
          // (receivedApplications attaches the full campaign object).
          agreedBudget: app.proposedBudget || app.campaign?.budget || f.agreedBudget,
          deadline: app.campaign?.deadline || f.deadline,
          deliverables: app.campaign?.deliverables || f.deliverables,
          description: app.coverLetter ?? f.description,
          applicationId,
        }));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setPrefillLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [applicationId]);

  // Pre-fill from an accepted opportunity (opportunity-to-deal progression)
  useEffect(() => {
    if (!opportunityId) return;
    let alive = true;
    api
      .sentOpportunities()
      .then((opps: any[]) => {
        if (!alive) return;
        const opp = (Array.isArray(opps) ? opps : []).find((o: any) => o.id === opportunityId);
        if (!opp) return;
        setForm((f) => ({
          ...f,
          title: opp.title ? opp.title : f.title,
          creatorId: opp.recipientId ?? f.creatorId,
          agreedBudget: opp.budget ?? f.agreedBudget,
          description: opp.description ?? f.description,
          opportunityId,
          // NOTE (Nov 12): an opportunity carries NO deadline — the
          // entity, the DTO and the send form have no deadline field
          // anywhere. The deadline input stays empty by design (never
          // a fake value); the banner below says exactly what IS
          // pre-filled instead of claiming "details pre-filled".
        }));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setPrefillLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [opportunityId]);

  const set =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, unknown> = { ...form };
      if (!payload.applicationId) delete payload.applicationId;
      if (!payload.opportunityId) delete payload.opportunityId;
      const deal = await api.createDeal(payload);
      // Success: the draft is spent — clear it before leaving so a
      // later New Deal visit starts empty instead of resurrecting it.
      clearDraft();
      // Success: show a message AND leave the form — redirect to the
      // created deal (its page repeats the message via ?created=1).
      // Guard the id: if the response ever carries none, fall back to
      // the Deals list instead of pushing to /deals/undefined.
      const dealId = (deal as any)?.id ? String((deal as any).id) : null;
      if (dealId) setCreatedDealId(dealId);
      if (dealId) {
        router.push(`/dashboard/deals/${dealId}?created=1`);
      } else {
        router.push(`/dashboard/deals?created=1`);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 dark:border-ink-700 px-4 py-2.5 focus:border-blue-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
      {applicationId && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Creating deal from an accepted application — details pre-filled.
        </p>
      )}
      {opportunityId && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Creating deal from an accepted opportunity — title, creator and
          budget pre-filled. An opportunity has no deadline, so add one
          below if needed.
        </p>
      )}
      {prefillLoading && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Loading pre-filled details…
        </p>
      )}
      {creatorParam && !applicationId && !opportunityId && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Direct deal — creator pre-selected from their profile.
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Deal Title *</label>
        <input className={inputCls} value={form.title} onChange={set("title")} required placeholder="Summer Fashion Collab" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea className={inputCls} value={form.description} onChange={set("description")} rows={3} placeholder="What is this collaboration about?" />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Creator *</label>
        {creators === null ? (
          <input className={inputCls} disabled placeholder="Loading creators…" />
        ) : creators.length > 0 && !manualCreator ? (
          <>
            <select className={inputCls} value={form.creatorId} onChange={set("creatorId")} required>
              <option value="">Select a creator…</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.email ? ` — ${c.email}` : c.detail ? ` — ${c.detail}` : ""}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setManualCreator(true)}
              className="mt-1 cursor-pointer text-xs font-semibold text-brand dark:text-brand-200 hover:underline"
            >
              Can&apos;t find the creator? Enter creator ID manually
            </button>
          </>
        ) : (
          <>
            <input className={inputCls} value={form.creatorId} onChange={set("creatorId")} required placeholder="Creator user ID or profile ID" />
            <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
              Paste the creator&apos;s user ID or profile ID — both work.
              The profile ID is the one in the creator&apos;s page address.
            </p>
            {creators.length > 0 && (
              <button
                type="button"
                onClick={() => setManualCreator(false)}
                className="mt-1 cursor-pointer text-xs font-semibold text-brand dark:text-brand-200 hover:underline"
              >
                Back to creator list
              </button>
            )}
          </>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-ink-300">
          Direct deal with this creator — no campaign needed.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Agreed Budget</label>
          <input className={inputCls} value={form.agreedBudget} onChange={set("agreedBudget")} placeholder="$500" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Deadline</label>
          <input className={inputCls} value={form.deadline} onChange={set("deadline")} placeholder="2026-12-31" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Deliverables</label>
        <textarea className={inputCls} value={form.deliverables} onChange={set("deliverables")} rows={2} placeholder="3 Instagram posts, 1 Reel..." />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Terms</label>
        <textarea className={inputCls} value={form.terms} onChange={set("terms")} rows={3} placeholder="Payment terms, usage rights, etc." />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {createdDealId && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700"
        >
          Deal created successfully.{" "}
          <Link
            href={`/dashboard/deals/${createdDealId}`}
            className="font-semibold underline"
          >
            View deal
          </Link>
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving || prefillLoading}>
          {saving ? "Creating..." : prefillLoading ? "Loading details…" : "Create Deal"}
        </Button>
        <Link href="/dashboard/deals" onClick={clearDraft}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}

export default function NewDealPage() {
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex max-w-2xl flex-col gap-8">
        <WelcomeHeader
          title="New Deal"
          subtitle="Propose a collaboration deal with a creator."
        />
        <Suspense fallback={<p className="text-sm text-gray-500 dark:text-ink-300">Loading…</p>}>
          <NewDealForm />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
