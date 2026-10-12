"use client";

import { useEffect } from "react";
import { cn } from "@/lib/cn";

// Slide-over panel  filter drawers
// ("Filter campagns" 411:58388, "Filter professional" 407:56824 — 318px wide).
export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink-950/40 transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute top-0 right-0 flex h-full w-[340px] max-w-[92vw] flex-col bg-white shadow-pop transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <p className="text-lg font-bold text-ink-900">{title}</p>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 hover:text-ink-900"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path
                d="M4.5 4.5l9 9m0-9-9 9"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  );
}
