import { cn } from "@/lib/cn";

// 5-star rating row,  review stars (16px, filled).
export function Stars({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label="5 out of 5 stars"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="text-[#f5a623]"
        >
          <path
            d="M8 1.5l1.85 3.75 4.15.6-3 2.93.7 4.12L8 10.9l-3.7 1.95.7-4.13-3-2.92 4.15-.6L8 1.5z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-label="Verified"
      className={cn("shrink-0 text-brand", className)}
    >
      <circle cx="11" cy="11" r="10" fill="currentColor" />
      <path
        d="m7.2 11.4 2.6 2.6 5-5.6"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
