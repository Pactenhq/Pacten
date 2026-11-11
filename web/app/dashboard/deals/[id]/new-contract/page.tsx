"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { Button } from "@/components/ui/Button";
import { brandNav, creatorNav, professionalNav, dashboardUser } from "@/lib/mock";
import { useAuth } from "@/components/auth/AuthProvider";
import { api } from "@/lib/api";
import {
  AGREEMENT_SECTIONS,
  STANDARD_AGREEMENT_FIELDS,
  visibleAgreementFields,
  type AgreementField,
} from "@/components/contracts/standardAgreementFields";

const inputCls =
  "w-full rounded-xl border border-gray-200 dark:border-ink-700 bg-white dark:bg-ink-900 px-4 py-2.5 text-[14px] disabled:bg-gray-50 dark:disabled:bg-ink-950 disabled:text-gray-500 dark:disabled:text-ink-300";

export default function NewStandardContractPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  const nav =
    user?.role === "creator"
      ? creatorNav
      : user?.role === "professional"
        ? professionalNav
        : brandNav;

  const [prefill, setPrefill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .contractPrefill(id)
      .then((res) => {
        setPrefill(res);
        const flat: Record<string, string> = {
          brandUserId: res?.brand?.id ?? "",
          brandEmail: res?.brand?.email ?? "",
          creatorUserId: res?.creator?.id ?? "",
          creatorEmail: res?.creator?.email ?? "",
          description: res?.description ?? "",
          deliverables: res?.deliverables ?? "",
          agreedBudget: res?.agreedBudget ?? "",
          deadline: res?.deadline ?? "",
          currency: res?.defaults?.currency ?? "USD",
          ownershipArrangement: res?.defaults?.ownershipArrangement ?? "",
        };
        const initial: Record<string, string> = {};
        for (const f of STANDARD_AGREEMENT_FIELDS) {
          if (f.prefill && flat[f.prefill] !== undefined) {
            initial[f.key] = flat[f.prefill];
          }
        }
        setValues(initial);
      })
      .catch(() => setError("Could not load the deal details for this form."))
      .finally(() => setLoading(false));
  }, [id]);

  const transactionType = values["GOODS_SERVICES_BOTH"] ?? "";
  const fields = useMemo(
    () => visibleAgreementFields(transactionType),
    [transactionType],
  );

  const setValue = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const submit = async () => {
    setError("");
    if (!transactionType) {
      setError("Please choose a transaction type.");
      return;
    }
    for (const key of ["PARTY_A_LEGAL_NAME", "PARTY_B_LEGAL_NAME"]) {
      if (!String(values[key] ?? "").trim()) {
        setError(
          key === "PARTY_A_LEGAL_NAME"
            ? "Party A legal name is required."
            : "Party B legal name is required.",
        );
        return;
      }
    }
    // Only visible fields are submitted: goods-only fields left out for
    // services-only agreements render as "Not applicable".
    const fieldValues: Record<string, string> = {};
    for (const f of fields) {
      fieldValues[f.key] = values[f.key] ?? "";
    }
    setSubmitting(true);
    try {
      const created = await api.generateContract(id, {
        template: "standard",
        fieldValues,
      });
      router.push(`/dashboard/contracts/${created.id}`);
    } catch (e: any) {
      setError(e?.message || "Failed to generate the contract.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (f: AgreementField) => {
    const value = values[f.key] ?? "";
    const common = {
      id: f.key,
      name: f.key,
      value,
      disabled: !!f.readOnly,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => setValue(f.key, e.target.value),
      className: inputCls,
    };
    return (
      <div key={f.key}>
        <label
          htmlFor={f.key}
          className="mb-1.5 block text-[14px] font-medium text-ink-900 dark:text-ink-50"
        >
          {f.label}
          {f.required ? " *" : ""}
          {f.readOnly ? " (auto-filled)" : ""}
        </label>
        {f.type === "textarea" ? (
          <textarea {...common} rows={3} />
        ) : f.type === "select" ? (
          <select {...common}>
            <option value="">Choose</option>
            {(f.options ?? []).map((opt) => (
              <option key={opt} value={opt}>
                {opt === "goods"
                  ? "Goods"
                  : opt === "services"
                    ? "Services"
                    : opt === "both"
                      ? "Goods and Services"
                      : opt}
              </option>
            ))}
          </select>
        ) : (
          <input {...common} type={f.type === "date" ? "date" : "text"} />
        )}
        {f.hint && (
          <p className="mt-1 text-[13px] text-ink-500 dark:text-ink-300">{f.hint}</p>
        )}
      </div>
    );
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

  if (loading) {
    return shell(<p className="text-gray-500 dark:text-ink-300">Loading agreement form...</p>);
  }

  return shell(
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink-900 dark:text-ink-50">
          Pacten Standard Transaction Agreement
        </h1>
        <p className="mt-1 text-[15px] text-ink-500 dark:text-ink-300">
          Complete the agreement details for the deal
          {prefill?.dealTitle ? ` “${prefill.dealTitle}”` : ""}. Fields left
          blank are shown as “Not applicable” in the completed agreement.
          Both parties must confirm they have read and agreed before the
          deal becomes active.
        </p>
        <Link
          href={`/dashboard/deals/${id}`}
          className="mt-2 inline-block text-[14px] text-blue-600 hover:underline"
        >
          Back to deal
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-[15px] font-medium text-red-600">
          {error}
        </p>
      )}

      {AGREEMENT_SECTIONS.map((section) => {
        const sectionFields = fields.filter((f) => f.section === section);
        if (section === "Delivery of goods" && sectionFields.length === 0) {
          return (
            <div
              key={section}
              className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6"
            >
              <h3 className="mb-2 text-lg font-semibold">
                Delivery of goods (§3.3)
              </h3>
              <p className="text-[15px] text-ink-500 dark:text-ink-300">
                Goods-only sections are marked “Not applicable” for
                services-only agreements. Choose “Goods” or “Goods and
                Services” above to complete the shipping and customs fields.
              </p>
            </div>
          );
        }
        if (sectionFields.length === 0) return null;
        return (
          <div
            key={section}
            className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6"
          >
            <h3 className="mb-4 text-lg font-semibold">{section}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {sectionFields.map(renderField)}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <Button onClick={submit} disabled={submitting}>
          {submitting ? "Generating…" : "Generate Standard Agreement"}
        </Button>
        <Link href={`/dashboard/deals/${id}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
    </div>
  );
}
