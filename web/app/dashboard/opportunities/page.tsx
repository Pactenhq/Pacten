"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { WelcomeHeader } from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

// Direct opportunities (M2): brand → creator/professional.
// Role-aware single page: brands see what they sent,
// creators/professionals see what they received (accept/decline).
const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-green-100 text-green-700",
  declined: "bg-ink-100 text-ink-500",
};

export default function OpportunitiesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const isBrand = user?.role === "brand";
  const nav =
    user?.role === "professional"
      ? professionalNav
      : isBrand
        ? brandNav
        : creatorNav;

  const load = () => {
    setLoading(true);
    const fetcher = isBrand
      ? api.sentOpportunities()
      : api.receivedOpportunities();
    fetcher
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const respond = async (id: string, action: "accept" | "decline") => {
    setActing(id);
    try {
      await api.respondOpportunity(id, action);
      load();
    } catch {
      // keep list as-is on failure
    } finally {
      setActing(null);
    }
  };

  return (
    <DashboardShell
      nav={nav}
      userName={dashboardUser.name}
      userInitials={dashboardUser.initials}
    >
      <WelcomeHeader
        title={isBrand ? "Sent opportunities" : "Direct opportunities"}
        subtitle={
          isBrand
            ? "Creators and professionals you reached out to directly."
            : "Brands that sent you a direct opportunity. Accept the ones you like."
        }
      />
      {loading ? (
        <p className="mt-8 text-ink-500">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="mt-8 p-10 text-center">
          <p className="text-lg font-bold text-ink-900">Nothing here yet</p>
          <p className="mt-2 text-ink-500">
            {isBrand
              ? "Open a creator or professional profile and send them a direct opportunity."
              : "When a brand sends you a direct opportunity, it will appear here."}
          </p>
        </Card>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {items.map((o) => {
            const other = isBrand ? o.recipient : o.brand;
            const personName = [other?.firstName, other?.lastName]
              .filter(Boolean)
              .join(" ")
              .trim();
            const otherName =
              other?.displayName ||
              other?.companyName ||
              personName ||
              other?.email ||
              "Unknown";
            const budgetNum = Number(
              String(o.budget ?? "").replace(/[^0-9.]/g, "")
            );
            const budgetLabel =
              o.budget && Number.isFinite(budgetNum) && budgetNum > 0
                ? `$${budgetNum.toLocaleString()}`
                : o.budget;
            return (
              <Card key={o.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-bold text-ink-900">
                        {o.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[12px] font-bold capitalize ${STATUS_STYLE[o.status] ?? STATUS_STYLE.pending}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <p className="mt-1 text-[14px] text-ink-500">
                      {isBrand ? "To: " : "From: "}
                      <span className="font-semibold text-ink-700">
                        {otherName}
                      </span>
                      {o.budget ? ` · Budget: ${budgetLabel}` : ""}
                    </p>
                    {o.description && (
                      <p className="mt-2 whitespace-pre-line text-[15px] text-ink-700">
                        {o.description}
                      </p>
                    )}
                  </div>
                  {!isBrand && o.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={acting === o.id}
                        onClick={() => respond(o.id, "decline")}
                      >
                        Decline
                      </Button>
                      <Button
                        disabled={acting === o.id}
                        onClick={() => respond(o.id, "accept")}
                      >
                        {acting === o.id ? "…" : "Accept"}
                      </Button>
                    </div>
                  )}
                  {isBrand && o.status === "accepted" && (
                    <div className="flex gap-2">
                      {o.dealId ? (
                        <Link href={`/dashboard/deals/${o.dealId}`}>
                          <Button variant="outline">View Deal</Button>
                        </Link>
                      ) : (
                        <Link
                          href={`/dashboard/deals/new?creatorId=${o.recipientId}&opportunityId=${o.id}`}
                        >
                          <Button>Create Deal</Button>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
