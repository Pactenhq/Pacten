"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

export default function ContractDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
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

  useEffect(() => {
    api
      .contractDetail(id)
      .then(setContract)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const act = async (kind: "accept" | "decline") => {
    setActing(true);
    try {
      const updated =
        kind === "accept"
          ? await api.acceptContract(id)
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

  if (loading) return shell(<p className="text-gray-500">Loading contract...</p>);
  if (!contract)
    return shell(
      <div>
        <p className="text-gray-500">Contract not found.</p>
        <Link href="/dashboard/contracts" className="text-blue-600 hover:underline">
          Back to contracts
        </Link>
      </div>
    );

  const isGenerator = user?.id === contract.generatedById;
  const canAct = contract.status === "sent" && !isGenerator;

  return shell(
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900">
            {String(contract.title ?? "")
              .replace(/^Deal:\s*/i, "")
              .replace(/—\s*Deal:\s*/i, "— ")}
          </h1>
          <p className="mt-1 text-[15px] text-ink-500">
            Status: <span className="font-bold capitalize">{contract.status}</span>
          </p>
        </div>
        <Link href="/dashboard/contracts">
          <Button variant="outline">Back to Contracts</Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Agreed Deal Terms</h3>
        <pre className="whitespace-pre-wrap text-[15px] text-ink-900">
          {contract.termsSnapshot}
        </pre>
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">Legal Wording</h3>
        <pre className="whitespace-pre-wrap text-sm text-ink-700">
          {contract.legalWording}
        </pre>
      </div>

      {canAct && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => act("accept")} disabled={acting}>
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
      )}
      {contract.status === "sent" && isGenerator && (
        <p className="text-[15px] text-ink-500">
          Waiting for the other party to accept or decline.
        </p>
      )}
    </div>
  );
}
