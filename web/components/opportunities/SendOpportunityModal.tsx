"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { api } from "@/lib/api";

// Modal for a brand to send a direct opportunity to a creator/professional.
// Shown from the public profile detail pages.
export function SendOpportunityModal({
  recipientName,
  recipientId,
  onClose,
  onSent,
}: {
  recipientName: string;
  recipientId: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError("Please give the opportunity a title (min 3 characters).");
      return;
    }
    setSending(true);
    try {
      await api.sendOpportunity({
        recipientId,
        title: title.trim(),
        description: description.trim() || undefined,
        budget: budget.trim() || undefined,
      });
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-extrabold text-ink-900">
          Send opportunity to {recipientName}
        </h2>
        <p className="mt-1 text-[14px] text-ink-500">
          They will see this in their dashboard and can accept or decline.
        </p>
        <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">
              {error}
            </p>
          )}
          <TextField
            label="Opportunity title"
            placeholder="e.g. Summer skincare launch collab"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-semibold text-ink-900">Details</span>
            <textarea
              className="min-h-[110px] rounded-xl border border-ink-200 px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-400 focus:border-brand focus:outline-none"
              placeholder="What is the collaboration about? Deliverables, timeline…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <TextField
            label="Budget (optional)"
            placeholder="e.g. $500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <div className="mt-2 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={sending} className="flex-1">
              {sending ? "Sending…" : "Send opportunity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
