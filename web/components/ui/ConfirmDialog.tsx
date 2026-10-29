"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

// In-website confirmation dialog, styled on the existing site modal
// pattern (see SendOpportunityModal). Replaces browser-native
// confirm() dialogs so confirmations look like part of the site.
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  busy = false,
  danger = false,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  // Escape closes, unless an action is in flight.
  useEffect(() => {
    if (busy) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/50 p-4"
      onClick={() => {
        if (!busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-[520px] rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-xl font-extrabold text-ink-900"
        >
          {title}
        </h2>
        <p className="mt-1 text-[14px] text-ink-500">{message}</p>
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="outline"
            autoFocus
            onClick={onCancel}
            disabled={busy}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "danger-outline" : "primary"}
            onClick={onConfirm}
            disabled={busy}
            className="flex-1"
          >
            {busy ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
