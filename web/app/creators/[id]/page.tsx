"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SendOpportunityModal } from "@/components/opportunities/SendOpportunityModal";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[13px] font-medium text-brand">
      {children}
    </span>
  );
}

export default function CreatorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .creatorProfile(id)
      .then((p) => setProfile(p))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const startConversation = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      const conv = await api.createConversation({
        otherUserId: profile.userId,
        subject: `Chat with ${profile.displayName}`,
      });
      router.push(`/dashboard/messages?conversation=${conv.id}`);
    } catch {
      router.push("/dashboard/messages");
    }
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-10 lg:px-12">
        <Link href="/creators" className="text-[14px] font-medium text-brand hover:underline">
          ← Back to creators
        </Link>
        {loading ? (
          <p className="mt-10 text-ink-500">Loading profile…</p>
        ) : notFound || !profile ? (
          <Card className="mt-10 p-10 text-center">
            <p className="text-lg font-bold text-ink-900">Creator not found</p>
            <p className="mt-2 text-ink-500">This profile may have been removed.</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || "/assets/marketplace/creator-theresa-webb.jpg"}
                    alt={profile.displayName}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-extrabold text-ink-900">
                        {profile.displayName}
                      </h1>
                      {profile.isVerified && (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[12px] font-bold text-green-700">
                          ✓ Verified
                        </span>
                      )}
                      {profile.availableNow !== false && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[12px] font-bold text-blue-700">
                          Available now
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[15px] text-ink-500">
                      {profile.followers ? `${profile.followers} followers` : ""}
                      {profile.rating
                        ? ` · ${Number(profile.rating).toFixed(1)}★ (${profile.reviewsCount ?? 0} reviews)`
                        : ""}
                      {profile.location ? ` · ${profile.location}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(profile.niches ?? []).map((n: string) => (
                        <Pill key={n}>{n}</Pill>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(profile.platforms ?? []).map((p: string) => (
                        <span
                          key={p}
                          className="inline-flex rounded-full border border-ink-200 px-3 py-1 text-[13px] font-medium text-ink-700"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-6">
                    <h2 className="text-lg font-bold text-ink-900">About</h2>
                    <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-700">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </Card>
            </div>
            <div>
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900">Work with {profile.displayName}</h2>
                {profile.rate && (
                  <p className="mt-2 text-[15px] text-ink-700">
                    Typical rate: <span className="font-bold text-ink-900">£{profile.rate}</span>
                  </p>
                )}
                {user?.role === "brand" && profile.userId && (
                  <div className="mt-4">
                    {sent ? (
                      <p className="rounded-lg bg-green-50 px-4 py-3 text-[14px] font-medium text-green-700">
                        Opportunity sent! They can accept or decline it from
                        their dashboard.
                      </p>
                    ) : (
                      <Button onClick={() => setModalOpen(true)} className="w-full">
                        Send direct opportunity
                      </Button>
                    )}
                  </div>
                )}
                <div className="mt-4 flex flex-col gap-3">
                  <Button onClick={startConversation} className="w-full" variant="outline">
                    Message
                  </Button>
                  {(!user || user.role === "brand") && profile.userId && (
                    <Link href={`/dashboard/deals/new?creatorId=${profile.userId}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Create Deal
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
      {modalOpen && (
        <SendOpportunityModal
          recipientName={profile.displayName}
          recipientId={profile.userId}
          onClose={() => setModalOpen(false)}
          onSent={() => {
            setModalOpen(false);
            setSent(true);
          }}
        />
      )}
      <Footer />
    </>
  );
}
