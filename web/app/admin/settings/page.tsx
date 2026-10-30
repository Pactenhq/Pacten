"use client";

import { useEffect, useState } from "react";
import {
  SectionCard,
  WelcomeHeader,
} from "@/components/dashboard/widgets";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [rules, setRules] = useState<any[]>([]);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyRule, setBusyRule] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, r] = await Promise.all([
        api.adminSettings(),
        api.adminCommissionRules(),
      ]);
      setSettings(s || []);
      setValues(
        Object.fromEntries((s || []).map((x: any) => [x.key, String(x.value)])),
      );
      setRules(r || []);
      setRates(
        Object.fromEntries(
          (r || []).map((x: any) => [x.id, String(x.rateBasisPoints / 100)]),
        ),
      );
    } catch {
      setError("Could not load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const parsed: Record<string, number> = {};
      for (const [k, v] of Object.entries(values)) {
        const n = parseInt(v, 10);
        if (!Number.isInteger(n) || n < 0) {
          throw new Error(`${k} must be a whole number of 0 or more.`);
        }
        parsed[k] = n;
      }
      await api.adminSaveSettings(parsed);
      setMessage("Free-plan limits saved. They apply to new actions immediately.");
      load();
    } catch (e: any) {
      setError(e?.message || "Could not save settings.");
    } finally {
      setSaving(false);
    }
  };

  const saveRule = async (rule: any) => {
    const pct = parseFloat(rates[rule.id] ?? "");
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      setError("Commission rate must be between 0 and 100%.");
      return;
    }
    setBusyRule(rule.id);
    setMessage("");
    setError("");
    try {
      await api.adminSaveCommissionRule(rule.id, Math.round(pct * 100));
      setMessage(
        `Commission for ${rule.role} / ${rule.tier} saved. It applies to new payments immediately.`,
      );
      load();
    } catch {
      setError("Could not save the commission rate.");
    } finally {
      setBusyRule(null);
    }
  };

  return (
    <div>
      <WelcomeHeader
        title="Settings"
        subtitle="Platform limits and commission rates. Changes apply immediately."
      />
      {message && (
        <p className="mt-4 text-[14px] font-medium text-green-700">{message}</p>
      )}
      {error && (
        <p className="mt-4 text-[14px] font-medium text-red-700">{error}</p>
      )}
      <SectionCard title="Free-plan limits" className="mt-6">
        {loading ? (
          <p className="mt-3 text-[14px] text-ink-500">Loading…</p>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              {settings.map((s: any) => (
                <div key={s.key} className="flex flex-wrap items-center gap-4">
                  <div className="min-w-64 flex-1">
                    <p className="text-[14px] font-semibold text-ink-900">
                      {s.label}
                    </p>
                    <p className="text-[13px] text-ink-500">{s.description}</p>
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={values[s.key] ?? ""}
                    onChange={(e) =>
                      setValues({ ...values, [s.key]: e.target.value })
                    }
                    className="w-28 rounded-xl border border-ink-200 px-4 py-2.5 text-[14px] outline-none focus:border-brand"
                  />
                </div>
              ))}
            </div>
            <Button size="md" onClick={saveSettings} disabled={saving}>
              {saving ? "Saving…" : "Save limits"}
            </Button>
          </>
        )}
      </SectionCard>
      <SectionCard title="Commission rates" className="mt-6">
        <p className="mt-1 text-[13px] text-ink-500">
          Share of each payment kept by the platform, by payee role and
          subscription tier. Brands are never charged.
        </p>
        {loading ? (
          <p className="mt-3 text-[14px] text-ink-500">Loading…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="border-b border-ink-100 text-[12px] uppercase text-ink-400">
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Tier</th>
                  <th className="py-3 pr-4">Rate (%)</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rules.map((r: any) => {
                  const isBrand = r.role === "brand";
                  return (
                    <tr key={r.id}>
                      <td className="py-3 pr-4 capitalize text-ink-700">
                        {r.role}
                      </td>
                      <td className="py-3 pr-4 capitalize text-ink-700">
                        {r.tier}
                      </td>
                      <td className="py-3 pr-4">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          step={0.5}
                          disabled={isBrand}
                          value={rates[r.id] ?? ""}
                          onChange={(e) =>
                            setRates({ ...rates, [r.id]: e.target.value })
                          }
                          className="w-28 rounded-xl border border-ink-200 px-4 py-2.5 text-[14px] outline-none focus:border-brand disabled:bg-ink-50"
                        />
                      </td>
                      <td className="py-3">
                        {isBrand ? (
                          <span className="text-[13px] text-ink-500">
                            Fixed at 0%
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyRule === r.id}
                            onClick={() => saveRule(r)}
                          >
                            Save
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
