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
type CreatorOption = { id: string; name: string };

function NewDealForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const opportunityId = searchParams.get("opportunityId");
  const creatorParam = searchParams.get("creatorId");
  const [form, setForm] = useState({
    title: "",
    description: "",
    creatorId: creatorParam ?? "",
    agreedBudget: "",
    deadline: "",
    deliverables: "",
    terms: "",
    applicationId: applicationId ?? "",
    opportunityId: opportunityId ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // null = loading, [] = fetch failed/empty -> fall back to manual UUID entry
  const [creators, setCreators] = useState<CreatorOption[] | null>(null);

  useEffect(() => {
    api
      .creators("?limit=100")
      .then((data) => {
        if (Array.isArray(data)) {
          setCreators(
            data
              .filter((c: any) => c?.userId)
              .map((c: any) => ({
                id: String(c.userId),
                name: c.displayName ?? "Creator",
              }))
          );
        } else {
          setCreators([]);
        }
      })
      .catch(() => {
        // API unavailable — fall back to manual UUID entry
        setCreators([]);
      });
  }, []);

  // Pre-fill from an accepted application (application-to-deal conversion)
  useEffect(() => {
    if (!applicationId) return;
    api
      .receivedApplications()
      .then((apps: any[]) => {
        const app = (Array.isArray(apps) ? apps : []).find((a: any) => a.id === applicationId);
        if (!app) return;
        setForm((f) => ({
          ...f,
          title: app.campaign?.title ? `Deal: ${app.campaign.title}` : f.title,
          creatorId: app.applicantId ?? f.creatorId,
          agreedBudget: app.proposedBudget ?? f.agreedBudget,
          description: app.coverLetter ?? f.description,
          applicationId,
        }));
      })
      .catch(() => {});
  }, [applicationId]);

  // Pre-fill from an accepted opportunity (opportunity-to-deal progression)
  useEffect(() => {
    if (!opportunityId) return;
    api
      .sentOpportunities()
      .then((opps: any[]) => {
        const opp = (Array.isArray(opps) ? opps : []).find((o: any) => o.id === opportunityId);
        if (!opp) return;
        setForm((f) => ({
          ...f,
          title: opp.title ? `Deal: ${opp.title}` : f.title,
          creatorId: opp.recipientId ?? f.creatorId,
          agreedBudget: opp.budget ?? f.agreedBudget,
          description: opp.description ?? f.description,
          opportunityId,
        }));
      })
      .catch(() => {});
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
      router.push(`/dashboard/deals/${deal.id}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create deal");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none";

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6">
      {applicationId && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Creating deal from an accepted application — details pre-filled.
        </p>
      )}
      {opportunityId && (
        <p className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-800">
          Creating deal from an accepted opportunity — details pre-filled.
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
        ) : creators.length > 0 ? (
          <select className={inputCls} value={form.creatorId} onChange={set("creatorId")} required>
            <option value="">Select a creator…</option>
            {creators.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        ) : (
          <input className={inputCls} value={form.creatorId} onChange={set("creatorId")} required placeholder="Creator's user UUID" />
        )}
        <p className="mt-1 text-xs text-gray-500">
          Direct deal with this creator — no campaign needed.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Agreed Budget</label>
          <input className={inputCls} value={form.agreedBudget} onChange={set("agreedBudget")} placeholder="£500" />
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

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create Deal"}
        </Button>
        <Link href="/dashboard/deals">
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
        <Suspense fallback={<p className="text-sm text-gray-500">Loading…</p>}>
          <NewDealForm />
        </Suspense>
      </div>
    </DashboardShell>
  );
}
