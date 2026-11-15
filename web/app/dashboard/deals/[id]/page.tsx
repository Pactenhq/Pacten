"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import { formatBudgetDisplay } from "@/lib/budget";

// NOTE: No Figma design exists for Deal Detail — basic functional page.
// NEXT_ACTIONS must mirror the backend VALID_TRANSITIONS exactly
// (api/src/deals/deals.service.ts) — the backend 400s any transition
// not in the map, so offering one is a dead button. In particular
// SUBMITTED allows approved/active/disputed (NO cancelled) and APPROVED
// allows completed/disputed (NO cancelled).
const NEXT_ACTIONS: Record<string, string[]> = {
  proposed: ["negotiating", "cancelled"],
  negotiating: ["agreed", "cancelled"],
  agreed: ["active", "cancelled"],
  active: ["submitted", "completed", "disputed", "cancelled"],
  submitted: ["approved", "active", "disputed"],
  approved: ["completed", "disputed"],
  completed: [],
  cancelled: [],
  disputed: ["active", "cancelled"],
};

export default function DealDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [commission, setCommission] = useState<any>(null);
  const [payout, setPayout] = useState<any>(null);
  const [m4busy, setM4busy] = useState(false);
  const [dealDisputes, setDealDisputes] = useState<any[]>([]);
  const [disputeReason, setDisputeReason] = useState("quality");
  const [disputeDesc, setDisputeDesc] = useState("");
  const [disputeBusy, setDisputeBusy] = useState(false);
  const [disputeMsg, setDisputeMsg] = useState<string | null>(null);
  // Shown when arriving from the New Deal form (?created=1).
  const [createdNotice, setCreatedNotice] = useState(false);

  const refreshDisputes = async () => {
    try {
      const all = await api.myDisputes();
      setDealDisputes(
        (Array.isArray(all) ? all : []).filter((d: any) => d.dealId === id)
      );
    } catch {
      setDealDisputes([]);
    }
  };

  const fileDispute = async () => {
    if (disputeDesc.trim().length < 10) {
      setDisputeMsg("Please describe the issue (at least 10 characters).");
      return;
    }
    setDisputeBusy(true);
    setDisputeMsg(null);
    try {
      await api.fileDispute(id, disputeReason, disputeDesc.trim());
      setDisputeDesc("");
      setDisputeMsg("Dispute filed — our team will review it.");
      // Follow-up fix (Nov 12): the backend moves the deal to DISPUTED
      // on filing (API-verified), but the page only refreshed the
      // disputes list — the header status stayed "Active" until a
      // manual reload. Re-read the deal too, same pattern as
      // updateStatus above, so the header flips to DISPUTED in place.
      await refreshDeal();
      refreshDisputes();
    } catch (e: any) {
      setDisputeMsg(e?.message || "Could not file dispute.");
    } finally {
      setDisputeBusy(false);
    }
  };

  const refreshM4 = async () => {
    try {
      const contracts = await api.contracts();
      setContract(
        (Array.isArray(contracts) ? contracts : []).find(
          (c: any) => c.dealId === id
        ) ?? null
      );
    } catch {}
    try {
      // Deal-scoped read: visible to both parties. (myPayments only lists
      // payments the caller made, so the creator never saw the payment.)
      // The endpoint answers an empty 200 when no payment exists yet,
      // which apiFetch surfaces as {} — only a body with an id is real.
      const p = await api.paymentForDeal(id).catch(() => null);
      setPayment(p && p.id ? p : null);
      if (p && p.id) {
        try {
          setCommission(await api.paymentCommission(p.id));
        } catch {}
      }
    } catch {}
    try {
      // Same empty-200 contract as the payment read: require an id.
      const po = await api.payoutForDeal(id);
      setPayout(po && po.id ? po : null);
    } catch {
      setPayout(null);
    }
  };

  useEffect(() => {
    api
      .dealDetail(id)
      .then((data) => setDeal(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    refreshM4();
    refreshDisputes();

    // Live-mode return from Stripe Checkout (?payment=success|cancelled):
    // settle the pending payment via the sync endpoint, refresh, then
    // strip the query param so a reload doesn't repeat the sync.
    const returnState = new URLSearchParams(window.location.search).get(
      "payment"
    );
    // New-deal return (?created=1): show the success message the form
    // promised, then strip the param so a reload doesn't repeat it.
    // (Skipped when a Stripe return is also present — that path owns
    // the URL cleanup below.)
    if (
      new URLSearchParams(window.location.search).get("created") === "1"
    ) {
      setCreatedNotice(true);
      if (!returnState) router.replace(`/dashboard/deals/${id}`);
    }
    if (returnState === "success" || returnState === "cancelled") {
      (async () => {
        if (returnState === "success") {
          try {
            const payments = await api.myPayments();
            const pending = (Array.isArray(payments) ? payments : []).find(
              (p: any) => p.dealId === id && p.status === "pending"
            );
            if (pending) await api.syncPayment(pending.id);
          } catch {}
          await refreshM4();
        }
        router.replace(`/dashboard/deals/${id}`);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status: string) => {
    setUpdating(true);
    try {
      const updated = await api.updateDealStatus(id, status);
      // Re-read the deal from the server after the change (same pattern
      // as the contract page's refetch-after-accept): the mutation
      // response is applied first, then the fresh GET wins. If the
      // refetch fails, the mutation response stands instead of the page
      // going stale until a manual reload.
      setDeal(updated);
      await refreshDeal(updated);
    } catch {
      alert("Failed to update deal status");
    } finally {
      setUpdating(false);
    }
  };

  // Re-read the deal + its contract/payment/payout rows after any
  // state-changing action. Falls back to the current deal state when
  // the refetch fails (never blanks the page).
  const refreshDeal = async (fallback?: any) => {
    try {
      setDeal(await api.dealDetail(id));
    } catch {
      if (fallback !== undefined) setDeal(fallback);
    }
    await refreshM4();
  };

  // GAP-3: the deal's status (and its contract) can also change
  // elsewhere — the other party signing the contract on the contract
  // page, or an action taken in another tab. This page previously
  // refetched only after its OWN actions, so those changes stayed
  // invisible until a manual reload. Refetch whenever the page regains
  // focus or becomes visible again, on top of refresh-after-action.
  useEffect(() => {
    const onFocus = () => {
      void refreshDeal();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshDeal();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const m4action = async (fn: () => Promise<any>, failMsg: string) => {
    setM4busy(true);
    try {
      await fn();
      await refreshDeal();
    } catch (e: any) {
      alert(e?.message || failMsg);
    } finally {
      setM4busy(false);
    }
  };

  const generateContract = () =>
    m4action(() => api.generateContract(id), "Failed to generate contract");

  const payUpfront = () =>
    m4action(async () => {
      const key = `upfront-${id}-${Date.now()}`;
      const res = await api.createUpfrontPayment(id, undefined, key);
      if (res?.checkoutUrl) {
        // Live mode: hand off to Stripe's hosted checkout. Settlement
        // happens on the return path (see the ?payment=success effect).
        window.location.href = res.checkoutUrl;
        return;
      }
      if (res?.demoMode && res?.payment?.id) {
        await api.demoConfirmPayment(res.payment.id);
      }
    }, "Failed to create payment");

  const submitWork = () =>
    m4action(() => api.submitDealWork(id), "Failed to submit work");

  const approveWork = () =>
    m4action(() => api.approveDealWork(id), "Failed to approve work");

  const isBrand = user?.role === "brand";
  const isCreator = user?.role === "creator" || user?.role === "professional";

  // Payment terms come from the signed contract, not from a platform
  // default. The standard agreement's §4 fields govern: a deposit
  // amount means an upfront payment is part of the deal; a blank
  // deposit (rendered "Not applicable" in the agreement) with
  // milestones such as "100% after work" means NO upfront payment is
  // due. The simple contract's placeholder wording (§2) requires
  // upfront funding, so the upfront copy stays correct there — and
  // with no contract yet there are no agreed terms to follow, so the
  // platform's upfront flow still applies.
  const contractFieldValues = (contract?.fieldValues ?? {}) as Record<
    string,
    string
  >;
  const isStandardContract = contract?.template === "standard";
  const depositRaw = String(
    contractFieldValues.DEPOSIT_AMOUNT ?? ""
  ).trim();
  const noUpfrontRequired =
    isStandardContract &&
    (depositRaw === "" ||
      /^not applicable$/i.test(depositRaw) ||
      /^n\/a$/i.test(depositRaw) ||
      depositRaw === "$0" ||
      depositRaw === "0");
  const paymentMilestones = String(
    contractFieldValues.PAYMENT_MILESTONES ?? ""
  ).trim();
  const paymentRelease = String(
    contractFieldValues.PAYMENT_RELEASE_CONDITIONS ?? ""
  ).trim();

  const fmtMoney = (cents: number, currency = "usd") =>
    Number.isFinite(cents)
      ? `$${(cents / 100).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "—";

  const personName = (u: any) =>
    [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim() ||
    u?.email ||
    "-";

  if (loading) {
    return (
      <DashboardShell
        nav={nav}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        <p className="text-gray-500 dark:text-ink-300">Loading deal...</p>
      </DashboardShell>
    );
  }

  if (!deal) {
    return (
      <DashboardShell
        nav={nav}
        userName={dashboardUser.name}
        userInitials={dashboardUser.initials}
      >
        <p className="text-gray-500 dark:text-ink-300">Deal not found.</p>
        <Link href="/dashboard/deals" className="text-blue-600 hover:underline">
          Back to deals
        </Link>
      </DashboardShell>
    );
  }

  const actions = NEXT_ACTIONS[deal.status] ?? [];

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <div className="flex flex-col gap-8">
        {createdNotice && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            Deal created successfully.
          </div>
        )}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <WelcomeHeader
            title={String(deal.title ?? "").replace(/^Deal:\s*/i, "")}
            subtitle={`Status: ${String(deal.status ?? "").charAt(0).toUpperCase()}${String(deal.status ?? "").slice(1)}`}
          />
          <Link href="/dashboard/deals">
            <Button variant="outline">Back to Deals</Button>
          </Link>
        </div>

        {/* TOS §6.8: auto-completion after 14 working days without a
            response. Defensive read — the field is null until the
            backend sets it. */}
        {deal.autoCompletedAt ? (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200"
          >
            Automatically completed after 14 working days without a response
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">Deal Terms</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Description</dt>
                <dd className="font-medium">{deal.description ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Agreed Budget</dt>
                <dd className="font-medium">
                  {formatBudgetDisplay(deal.agreedBudget)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Deadline</dt>
                <dd className="font-medium">{deal.deadline ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Deliverables</dt>
                <dd className="font-medium">{deal.deliverables ?? "-"}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Terms</dt>
                <dd className="font-medium">{deal.terms ?? "-"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">Parties</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Brand</dt>
                <dd className="font-medium">{personName(deal.brand)}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-ink-300">Creator</dt>
                <dd className="font-medium">{personName(deal.creator)}</dd>
              </div>
            </dl>

            {actions.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-ink-200">
                  Update Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {actions.map((action) => (
                    <Button
                      key={action}
                      onClick={() => updateStatus(action)}
                      disabled={updating}
                      variant={action === "cancelled" ? "outline" : "primary"}
                      size="sm"
                      className="capitalize"
                    >
                      Mark as {action}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* M4: Contract */}
        <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
          <h3 className="mb-4 text-lg font-semibold">Contract</h3>
          {contract ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px]">
                <span className="font-semibold">{contract.title}</span>
                {" — "}
                <span className="capitalize text-gray-600 dark:text-ink-200">{contract.status}</span>
              </p>
              <Link href={`/dashboard/contracts/${contract.id}`}>
                <Button size="sm" variant="outline">
                  View Contract
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px] text-gray-600 dark:text-ink-200">
                No contract yet. Generate one automatically from the agreed
                deal terms.
              </p>
              {(deal.status === "agreed" || deal.status === "active") && (
                <div className="flex flex-wrap gap-2">
                  <Link href={`/dashboard/deals/${id}/new-contract`}>
                    <Button size="sm" disabled={m4busy}>
                      Use Standard Agreement
                    </Button>
                  </Link>
                  <Button size="sm" onClick={generateContract} disabled={m4busy}>
                    Generate Contract
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* M4: Payment — wording follows the signed contract's §4 terms
            (no upfront promise when the agreement requires none). The
            payment flow itself (Stripe upfront payment) is unchanged. */}
        <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
          <h3 className="mb-4 text-lg font-semibold">Payment</h3>
          {payment ? (
            <dl className="space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-ink-300">Amount paid</dt>
                <dd className="font-semibold">
                  {fmtMoney(payment.amountCents, payment.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500 dark:text-ink-300">Status</dt>
                <dd className="font-semibold capitalize">{payment.status}</dd>
              </div>
              {commission && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 dark:text-ink-300">
                    Platform commission ({(commission.rateBasisPoints / 100).toFixed(1)}%)
                  </dt>
                  <dd className="font-semibold">
                    {fmtMoney(commission.amountCents, commission.currency)}
                  </dd>
                </div>
              )}
              <p className="pt-2 text-sm text-gray-500 dark:text-ink-300">
                Stripe test mode — no real money moved.
              </p>
            </dl>
          ) : noUpfrontRequired ? (
            <div className="space-y-2">
              <p className="text-[15px] text-gray-600 dark:text-ink-200">
                No upfront payment is required — payment is due as set out
                in the agreement.
              </p>
              {paymentMilestones && (
                <p className="text-[15px] text-gray-600 dark:text-ink-200">
                  Payment milestones: {paymentMilestones}
                </p>
              )}
              {paymentRelease && (
                <p className="text-[15px] text-gray-600 dark:text-ink-200">
                  Release conditions: {paymentRelease}
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-[15px] text-gray-600 dark:text-ink-200">
                {isBrand
                  ? "Fund this deal upfront to get work started."
                  : "Awaiting upfront payment from the brand."}
              </p>
              {isBrand &&
                (deal.status === "agreed" || deal.status === "active") && (
                  <Button size="sm" onClick={payUpfront} disabled={m4busy}>
                    Pay Upfront
                    {deal.agreedBudget
                      ? ` (${formatBudgetDisplay(deal.agreedBudget)})`
                      : ""}
                  </Button>
                )}
            </div>
          )}
        </div>

        {/* M4: Completion → approval → payout */}
        {(deal.status === "active" ||
          deal.status === "submitted" ||
          deal.status === "approved" ||
          deal.status === "completed") && (
          <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">Completion & Payout</h3>
            <div className="flex flex-wrap items-center gap-4">
              {isCreator && deal.status === "active" && (
                <Button size="sm" onClick={submitWork} disabled={m4busy}>
                  Submit Work for Approval
                </Button>
              )}
              {isBrand && deal.status === "submitted" && (
                <Button size="sm" onClick={approveWork} disabled={m4busy}>
                  Approve Work
                </Button>
              )}
              {deal.status === "approved" && (
                <p className="text-[15px] text-gray-600 dark:text-ink-200">
                  Work approved — mark the deal completed to release the payout.
                </p>
              )}
              {payout && (
                <dl className="w-full space-y-2 pt-2 text-[15px]">
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-ink-300">Payout amount</dt>
                    <dd className="font-semibold">
                      {fmtMoney(payout.amountCents, payout.currency)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500 dark:text-ink-300">Payout status</dt>
                    <dd className="font-semibold capitalize">{payout.status}</dd>
                  </div>
                  {payout.failureReason && (
                    <p className="text-sm text-gray-500 dark:text-ink-300">{payout.failureReason}</p>
                  )}
                </dl>
              )}
            </div>
          </div>
        )}
        {/* M5: Disputes */}
        <div className="rounded-2xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6">
          <h3 className="mb-4 text-lg font-semibold">Disputes</h3>
          {dealDisputes.length > 0 ? (
            <ul className="mb-6 divide-y divide-gray-100">
              {dealDisputes.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between py-3 text-[15px]">
                  <span>
                    <span className="font-semibold capitalize">
                      {d.reason.replace(/_/g, " ")}
                    </span>
                    <span className="ml-2 text-gray-500 dark:text-ink-300">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="rounded-full bg-gray-100 dark:bg-ink-900 px-3 py-1 text-[12px] font-semibold capitalize">
                      {d.status.replace(/_/g, " ")}
                    </span>
                    <Link
                      href={`/dashboard/disputes/${d.id}`}
                      className="text-[14px] font-semibold text-brand dark:text-brand-200 hover:underline"
                    >
                      View
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-6 text-[15px] text-gray-500 dark:text-ink-300">
              No disputes on this deal.
            </p>
          )}
          <div className="rounded-xl bg-gray-50 dark:bg-ink-950 p-4">
            <p className="mb-3 text-[15px] font-semibold">File a dispute</p>
            <div className="flex flex-wrap gap-3">
              <select
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-[14px]"
              >
                <option value="quality">Quality issue</option>
                <option value="late_delivery">Late delivery</option>
                <option value="payment">Payment issue</option>
                <option value="scope">Scope disagreement</option>
                <option value="other">Other</option>
              </select>
              <input
                value={disputeDesc}
                onChange={(e) => setDisputeDesc(e.target.value)}
                placeholder="Describe the issue (min 10 characters)"
                className="min-w-[240px] flex-1 rounded-xl border border-gray-200 dark:border-ink-700 px-4 py-2.5 text-[14px]"
              />
              <Button size="sm" onClick={fileDispute} disabled={disputeBusy}>
                {disputeBusy ? "Filing…" : "File Dispute"}
              </Button>
            </div>
            {disputeMsg && (
              <p className="mt-2 text-[14px] text-gray-600 dark:text-ink-200">{disputeMsg}</p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
