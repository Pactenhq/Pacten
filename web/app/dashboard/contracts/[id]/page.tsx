"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

function formatSignedAt(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 19)} UTC`;
}

export default function ContractDetailPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [signatoryName, setSignatoryName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [signatoryTitle, setSignatoryTitle] = useState("");
  const [confirmRead, setConfirmRead] = useState(false);

  useEffect(() => {
    api
      .contractDetail(id)
      .then(setContract)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  // Prefill the signatory name from the viewer's display name (the user
  // confirms or edits it — display names are never recorded as legal
  // names without confirmation).
  useEffect(() => {
    if (!nameEdited && user) {
      const display = [user.firstName, user.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      setSignatoryName(display || user.email || "");
    }
  }, [user, nameEdited]);

  const act = async (kind: "accept" | "decline") => {
    setActing(true);
    try {
      const updated =
        kind === "accept"
          ? await api.acceptContract(id, {
              signatoryName: signatoryName.trim() || undefined,
              signatoryTitle: signatoryTitle.trim() || undefined,
            })
          : await api.declineContract(id);
      setContract(updated);
    } catch (e: any) {
      alert(e?.message || `Failed to ${kind} contract`);
    } finally {
      setActing(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      {children}
    </DashboardShell>
  );

  if (loading) return shell(<p className="text-gray-500 dark:text-ink-300">Loading contract...</p>);
  if (!contract)
    return shell(
      <div>
        <p className="text-gray-500 dark:text-ink-300">Contract not found.</p>
        <Link href="/dashboard/contracts" className="text-blue-600 hover:underline">
          Back to contracts
        </Link>
      </div>
    );

  const isBrand = user?.id === contract.brandId;
  const isCreator = user?.id === contract.creatorId;
  const mySignedAt = isBrand
    ? contract.brandSignedAt
    : isCreator
      ? contract.creatorSignedAt
      : null;
  const canConfirm = contract.status === "sent" && !mySignedAt;
  const canDecline = contract.status === "sent";
  const isStandard = contract.template === "standard";
  const otherSigned = isBrand
    ? contract.creatorSignedAt
    : contract.brandSignedAt;

  return shell(
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
            {String(contract.title ?? "")
              .replace(/^Deal:\s*/i, "")
              .replace(/—\s*Deal:\s*/i, "— ")}
          </h1>
          <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">
            Status: <span className="font-bold capitalize">{contract.status}</span>
            {isStandard && contract.templateVersion
              ? ` · Pacten Standard Transaction Agreement (${contract.templateVersion})`
              : " · Simple contract"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            Download / Print
          </Button>
          <Link href="/dashboard/contracts">
            <Button variant="outline">Back to Contracts</Button>
          </Link>
        </div>
      </div>

      {/* Signature status for both parties (two-signature flow). */}
      <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
        <h3 className="mb-4 text-lg font-semibold">Signatures</h3>
        <p className="mb-4 text-[15px] text-ink-500 dark:text-ink-300">
          Both parties must confirm they have read and agreed. The deal
          becomes active only after both have confirmed.
        </p>
        <dl className="space-y-3 text-[15px]">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-500 dark:text-ink-300">
              Party A — Client / Buyer ({contract.brandName || "—"})
            </dt>
            <dd className="font-medium">
              {contract.brandSignedAt ? (
                <>
                  Signed by {contract.brandSignatoryName || "—"}
                  {contract.brandSignatoryTitle
                    ? ` (${contract.brandSignatoryTitle})`
                    : ""}{" "}
                  · {formatSignedAt(contract.brandSignedAt)}
                </>
              ) : (
                "Awaiting signature"
              )}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="text-ink-500 dark:text-ink-300">
              Party B — Provider / Seller ({contract.creatorName || "—"})
            </dt>
            <dd className="font-medium">
              {contract.creatorSignedAt ? (
                <>
                  Signed by {contract.creatorSignatoryName || "—"}
                  {contract.creatorSignatoryTitle
                    ? ` (${contract.creatorSignatoryTitle})`
                    : ""}{" "}
                  · {formatSignedAt(contract.creatorSignedAt)}
                </>
              ) : (
                "Awaiting signature"
              )}
            </dd>
          </div>
        </dl>
        {contract.status === "sent" && mySignedAt && !otherSigned && (
          <p className="mt-4 text-[15px] text-ink-500 dark:text-ink-300">
            You have confirmed this contract. Waiting for the other party to
            confirm.
          </p>
        )}
      </div>

      {/* The agreement itself — the print area for Download / Print. */}
      <div id="agreement-print-area">
        {isStandard && contract.renderedAgreement ? (
          <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Pacten Standard Transaction Agreement
            </h3>
            <pre className="whitespace-pre-wrap text-[15px] text-ink-900 dark:text-ink-50">
              {contract.renderedAgreement}
            </pre>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Agreed Deal Terms</h3>
              <pre className="whitespace-pre-wrap text-[15px] text-ink-900 dark:text-ink-50">
                {contract.termsSnapshot}
              </pre>
            </div>

            <div className="mt-8 rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
              <h3 className="mb-4 text-lg font-semibold">Legal Wording</h3>
              <pre className="whitespace-pre-wrap text-sm text-ink-700 dark:text-ink-200">
                {contract.legalWording}
              </pre>
            </div>
          </>
        )}
      </div>

      {canConfirm && (
        <div className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Confirm you have read and agreed
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="signatory-name"
                className="mb-1.5 block text-[14px] font-medium text-ink-900 dark:text-ink-50"
              >
                Your name
              </label>
              <input
                id="signatory-name"
                name="signatoryName"
                value={signatoryName}
                onChange={(e) => {
                  setNameEdited(true);
                  setSignatoryName(e.target.value);
                }}
                className="w-full rounded-xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-[14px]"
              />
            </div>
            <div>
              <label
                htmlFor="signatory-title"
                className="mb-1.5 block text-[14px] font-medium text-ink-900 dark:text-ink-50"
              >
                Your title (optional)
              </label>
              <input
                id="signatory-title"
                name="signatoryTitle"
                value={signatoryTitle}
                onChange={(e) => setSignatoryTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-[14px]"
              />
            </div>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-2 text-[15px] text-ink-900 dark:text-ink-50">
            <input
              id="confirm-read"
              type="checkbox"
              checked={confirmRead}
              onChange={(e) => setConfirmRead(e.target.checked)}
              className="mt-1"
            />
            <span>
              I have read and understood this agreement and I agree to its
              terms.
            </span>
          </label>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => act("accept")}
              disabled={acting || !confirmRead || !signatoryName.trim()}
            >
              Accept Contract
            </Button>
            <Button
              variant="danger-outline"
              onClick={() => act("decline")}
              disabled={acting}
            >
              Decline
            </Button>
          </div>
        </div>
      )}
      {canDecline && !canConfirm && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="danger-outline"
            onClick={() => act("decline")}
            disabled={acting}
          >
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}
