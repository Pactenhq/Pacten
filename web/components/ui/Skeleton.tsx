import { cn } from "@/lib/cn";

// One shared loading placeholder for the whole site: a grey block with a
// slow light sweep, so a page that is still fetching reads as "loading"
// instead of "broken". Light and dark use the same ink tokens the Navbar's
// auth placeholders already use; the sweep itself lives in
// .skeleton-shimmer (app/globals.css).
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "skeleton-shimmer rounded-lg bg-ink-100 dark:bg-ink-800",
        className
      )}
    />
  );
}

// Stacked text-length bars.
export function SkeletonLines({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  const widths = ["w-full", "w-11/12", "w-3/4", "w-2/3", "w-1/2"];
  return (
    <div className={cn("flex flex-col gap-2.5", className)} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} className={cn("h-3", widths[i % widths.length])} />
      ))}
    </div>
  );
}

// Generic bordered card shaped like the site's content cards.
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-6",
        className
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-5 w-1/3" />
      <SkeletonLines lines={3} className="mt-5" />
      <Skeleton className="mt-6 h-9 w-32 rounded-xl" />
    </div>
  );
}

// Three plan cards, shaped like the pricing cards. The caller passes the
// grid classes so the skeleton matches the real grid on each page.
export function PlanCardsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        className ?? "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      )}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex flex-col rounded-2xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 p-6"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="mt-5 h-6 w-1/2" />
          <Skeleton className="mt-2 h-6 w-1/3" />
          <div className="my-5 border-t border-ink-100 dark:border-ink-800" />
          <SkeletonLines lines={4} />
          <Skeleton className="mt-7 h-12 w-full rounded-[14px]" />
        </div>
      ))}
    </div>
  );
}

// Deal detail page: header, two-column terms/parties cards, contract and
// payment cards — the same blocks the loaded page renders.
export function DealDetailSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-hidden="true">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-7 w-64 max-w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-[14px]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}

// Public profile page: avatar, name, meta lines, content card.
export function ProfileSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Skeleton className="h-6 w-56 max-w-full" />
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-3 w-64 max-w-full" />
        </div>
      </div>
      <CardSkeleton className="mt-8" />
    </div>
  );
}

// Detail page: title, meta row, content card.
export function DetailSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="h-7 w-72 max-w-full" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <CardSkeleton className="mt-6" />
    </div>
  );
}

// List rows, optionally with an avatar block.
export function RowsSkeleton({
  rows = 3,
  withAvatar = false,
  className,
}: {
  rows?: number;
  withAvatar?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4", className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          {withAvatar && (
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          )}
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="hidden h-8 w-20 rounded-[14px] sm:block" />
        </div>
      ))}
    </div>
  );
}

// Grid of marketplace cards (creators, professionals, campaigns).
export function GridCardsSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn(className ?? "grid gap-4 sm:gap-5")} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 p-5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
          <SkeletonLines lines={2} className="mt-4" />
          <Skeleton className="mt-4 h-9 w-full rounded-[14px]" />
        </div>
      ))}
    </div>
  );
}

// Messaging: conversation rows with avatars.
export function ConversationSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4 p-2" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

// Table-shaped placeholder (admin lists, billing history).
export function TableSkeleton({
  rows = 3,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)} aria-hidden="true">
      <Skeleton className="h-4 w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="h-3.5 w-1/4" />
          <Skeleton className="h-3.5 w-1/5" />
          <Skeleton className="h-3.5 w-1/6" />
        </div>
      ))}
    </div>
  );
}

// Form page: title, labelled field blocks, action row.
export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-7 w-72 max-w-full" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex gap-3">
        <Skeleton className="h-11 w-32 rounded-[14px]" />
        <Skeleton className="h-11 w-24 rounded-[14px]" />
      </div>
    </div>
  );
}
