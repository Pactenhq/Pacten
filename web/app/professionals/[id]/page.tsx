"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { SendOpportunityModal } from "@/components/opportunities/SendOpportunityModal";
import { useAuth } from "@/components/auth/AuthProvider";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-brand-50 dark:bg-white/10 px-3 py-1 text-[13px] font-medium text-brand dark:text-brand-200">
      {children}
    </span>
  );
}

export default function ProfessionalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api
      .professionalProfile(id)
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
        <Link href="/professionals" className="text-[14px] font-medium text-brand dark:text-brand-200 hover:underline">
          ← Back to professionals
        </Link>
        {loading ? (
          <p className="mt-10 text-ink-500 dark:text-ink-300">Loading profile…</p>
        ) : notFound || !profile ? (
          <Card className="mt-10 p-10 text-center">
            <p className="text-lg font-bold text-ink-900 dark:text-ink-50">Professional not found</p>
            <p className="mt-2 text-ink-500 dark:text-ink-300">This profile may have been removed.</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start gap-5">
                  {/* No stock-photo fallback: without a real avatar the
                      initials Avatar renders (same as marketplace cards).
                      The old fallback showed a stranger's photo
                      (pro-1.jpg) as the person's face. */}
                  {profile.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="h-24 w-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-ink-50 dark:bg-ink-900">
                      <Avatar name={profile.displayName} size="lg" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-extrabold text-ink-900 dark:text-ink-50">
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
                    <p className="mt-1 text-[15px] font-semibold text-ink-900 dark:text-ink-50">
                      {profile.title || "Social Media Professional"}
                    </p>
                    <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">
                      {profile.rating
                        ? `${Number(profile.rating).toFixed(1)}★ (${profile.reviewsCount ?? 0} reviews)`
                        : ""}
                      {profile.yearsExperience != null ? ` · ${profile.yearsExperience} yrs experience` : ""}
                      {profile.location ? ` · ${profile.location}` : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(profile.skills ?? []).map((s: string) => (
                        <Pill key={s}>{s}</Pill>
                      ))}
                    </div>
                    {/* Languages / Industries / Platforms (Nov 2026): the
                        settings form saves them and the marketplace
                        filters on them, but the public profile never
                        showed them — a visitor could not see them. */}
                    {(profile.languages ?? []).length > 0 && (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">Languages</p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {profile.languages.map((l: string) => (
                            <Pill key={l}>{l}</Pill>
                          ))}
                        </div>
                      </div>
                    )}
                    {(profile.industries ?? []).length > 0 && (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">Industries</p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {profile.industries.map((v: string) => (
                            <Pill key={v}>{v}</Pill>
                          ))}
                        </div>
                      </div>
                    )}
                    {(profile.platforms ?? []).length > 0 && (
                      <div className="mt-4">
                        <p className="text-[13px] font-semibold text-ink-500 dark:text-ink-300">Platforms</p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {profile.platforms.map((p: string) => (
                            <span
                              key={p}
                              className="inline-flex rounded-full border border-ink-200 dark:border-ink-700 px-3 py-1 text-[13px] font-medium text-ink-700 dark:text-ink-200"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {profile.bio && (
                  <div className="mt-6">
                    <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">About</h2>
                    <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </Card>
            </div>
            <div>
              <Card className="p-6">
                <h2 className="text-lg font-bold text-ink-900 dark:text-ink-50">Work with {profile.displayName}</h2>
                {profile.hourlyRate && (
                  <p className="mt-2 text-[15px] text-ink-700 dark:text-ink-200">
                    {/* Was `\${profile.hourlyRate}` in JSX text — rendered
                        literally as "${...}" instead of the value. */}
                    Hourly rate: <span className="font-bold text-ink-900 dark:text-ink-50">{`$${String(profile.hourlyRate).replace(/^\$/, "")}/hr`}</span>
                  </p>
                )}
                {profile.openToProjects === false && (
                  <p className="mt-2 text-[14px] font-medium text-amber-700">
                    Not currently open to new projects.
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
                  {!user && (
                    <p className="text-[13px] text-ink-500 dark:text-ink-300">
                      <Link href="/login" className="font-medium text-brand dark:text-brand-200 hover:underline">
                        Log in
                      </Link>{" "}
                      to message this professional.
                    </p>
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
