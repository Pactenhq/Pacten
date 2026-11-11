import { cn } from "@/lib/cn";

export function Tag({
  children,
  tone = "brand",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[38px] items-center rounded-full px-4 text-sm font-semibold whitespace-nowrap",
        tone === "neutral" && "bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200",
        tone === "brand" && "bg-brand-50 dark:bg-white/10 text-brand dark:text-brand-200",
        tone === "success" && "bg-success-bg dark:bg-success/15 text-success dark:text-success-bright",
        tone === "warning" && "bg-warning-bg dark:bg-warning/15 text-warning dark:text-warning-bright",
        tone === "danger" && "bg-danger-bg dark:bg-danger/15 text-danger dark:text-danger-bright",
        className
      )}
    >
      {children}
    </span>
  );
}
