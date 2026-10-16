"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-[13px] font-medium text-brand">
      {children}
    </span>
  );
}

export default function ProfessionalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .professionalProfile(id)
      .then((p) => setProfile(p))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-6 pb-20 pt-10 lg:px-12">
        <Link href="/professionals" className="text-[14px] font-medium text-brand hover:underline">
          ← Back to professionals
        </Link>
        {loading ? (
          <p className="mt-10 text-ink-500">Loading profile…</p>
        ) : notFound || !profile ? (
          <Card className="mt-10 p-10 text-center">
            <p className="text-lg font-bold text-ink-900">Professional not found</p>
            <p className="mt-2 text-ink-500">This profile may have been removed.</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <Card className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start gap-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatarUrl || "/assets/home/pro-1.jpg"}
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
                    <p className="mt-1 text-[15px] font-semibold text-ink-900">
                      {profile.title || "Social Media Professional"}
                    </p>
                    <p className="mt-1 text-[15px] text-ink-500">
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
                {profile.hourlyRate && (
                  <p className="mt-2 text-[15px] text-ink-700">
                    Hourly rate: <span className="font-bold text-ink-900">£{profile.hourlyRate}/hr</span>
                  </p>
                )}
                {profile.openToProjects === false && (
                  <p className="mt-2 text-[14px] font-medium text-amber-700">
                    Not currently open to new projects.
                  </p>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
