"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import type {
  BrandApplicationRow,
  CreatorApplicationRow,
} from "@/lib/mock-campaigns";

// Rebuilt from the  (352:16430)
// verbatim: "Applications" section, the "Search deliverables..." field,
// Job Title / Status / Date Applied dropdowns, "Clear Filters", and the
// CREATOR / JOB TITLE / APPLIED / STATUS / ACTIONS table.
export function BrandApplicationsTable({
  rows,
}: {
  rows: BrandApplicationRow[];
}) {
  const [query, setQuery] = useState("");
  const filtered = rows.filter((r) =>
    (r.name + r.handle + r.campaign + r.brand)
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 p-6">
        <h2 className="text-[18px] font-bold text-ink-900">Applications</h2>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-[50px] flex-1 items-center gap-2.5 rounded-xl border border-ink-300 px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-400">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search deliverables..."
              className="h-full flex-1 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="Job Title" options={["Job Title", "Summer Collection", "Hydrating Serum Launch"]} />
            <FilterSelect label="Status" options={["Status", "Under Review", "Shortlisted", "Rejected"]} />
            <FilterSelect label="Date Applied" options={["Date Applied", "Newest First", "Oldest First"]} />
            <button
              onClick={() => setQuery("")}
              className="cursor-pointer text-[14px] font-semibold text-brand hover:underline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-[1.4fr_1fr_1fr_130px_150px] items-center gap-4 border-b border-ink-100 px-6 py-3 text-[12px] font-bold tracking-wide text-ink-400 uppercase md:grid">
        <span>Creator</span>
        <span>Job Title</span>
        <span>Applied</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="divide-y divide-ink-100">
        {filtered.map((r) => (
          <li
            key={r.handle + r.campaign}
            className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 md:grid-cols-[1.4fr_1fr_1fr_130px_150px]"
          >
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand"
              >
                {r.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
              <div>
                <p className="text-[15px] font-bold text-ink-900">{r.name}</p>
                <p className="text-[13px] text-ink-500">{r.handle}</p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-[15px] font-bold text-ink-900">{r.campaign}</p>
              <p className="text-[13px] text-ink-500">{r.brand}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[14px] font-semibold text-ink-900">{r.appliedDate}</p>
              <p className="text-[13px] text-ink-400">{r.appliedAgo}</p>
            </div>
            <div className="hidden md:block">
              <StatusTag status={r.status} />
            </div>
            <div className="col-span-2 md:col-span-1 md:text-right">
              <Button variant="outline" size="sm" className="w-full md:w-auto">
                View Application
              </Button>
            </div>
            <div className="col-span-2 flex flex-wrap items-center gap-x-6 gap-y-1 md:hidden">
              <span className="text-[13px] text-ink-500">
                {r.campaign} · {r.brand}
              </span>
              <span className="text-[13px] text-ink-500">
                {r.appliedDate} · {r.appliedAgo}
              </span>
              <StatusTag status={r.status} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// Rebuilt from the 
// (357:18550) verbatim: "Application" section, "Search by job title or
// company", Employment Type / Status / Date Applied dropdowns,
// "Clear Filters", and the identical "Social Media Creator" rows.
export function CreatorApplicationsTable({
  rows,
}: {
  rows: CreatorApplicationRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filtered = rows.filter((r) =>
    (r.company + r.jobTitle).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 p-6">
        <h2 className="text-[18px] font-bold text-ink-900">Application</h2>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex h-[50px] flex-1 items-center gap-2.5 rounded-xl border border-ink-300 px-4">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ink-400">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by job title or company"
              className="h-full flex-1 bg-transparent text-[15px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <FilterSelect label="Employment Type" options={["Employment Type", "Part-time", "Contract"]} />
            <FilterSelect label="Status" options={["Status", "Under Review", "Shortlisted", "Rejected"]} />
            <FilterSelect label="Date Applied" options={["Date Applied", "Newest First", "Oldest First"]} />
            <button
              onClick={() => setQuery("")}
              className="cursor-pointer text-[14px] font-semibold text-brand hover:underline"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-ink-100">
        {filtered.map((r, i) => (
          <li
            key={r.jobTitle + i}
            className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-4">
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-sm font-bold text-white"
              >
                {r.initials}
              </span>
              <div>
                <p className="text-[15px] font-bold text-ink-900">{r.jobTitle}</p>
                <p className="text-[13px] text-ink-500">{r.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag tone="neutral" className="h-8 px-3 text-[13px]">
                {r.jobType}
              </Tag>
              <Tag tone="neutral" className="h-8 px-3 text-[13px]">
                {r.location}
              </Tag>
            </div>
            <StatusTag status={r.status} />
            <Button
              variant="outline"
              size="sm"
              className="sm:w-auto"
              onClick={() =>
                r.campaignId
                  ? router.push(`/campaigns/${r.campaignId}`)
                  : router.push("/campaigns")
              }
            >
              View Job
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function StatusTag({ status }: { status: string }) {
  const tone =
    status === "Shortlisted"
      ? ("success" as const)
      : status === "Rejected"
        ? ("danger" as const)
        : ("warning" as const);
  return <Tag tone={tone}>{status}</Tag>;
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  const [value, setValue] = useState(label);
  return (
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label={label}
      className="h-[50px] cursor-pointer rounded-xl border border-ink-300 bg-white px-3 text-[14px] font-medium text-ink-700 focus:border-brand focus:outline-none"
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
