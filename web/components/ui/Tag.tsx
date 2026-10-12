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
        tone === "neutral" && "bg-ink-100 text-ink-700",
        tone === "brand" && "bg-brand-50 text-brand",
        tone === "success" && "bg-success-bg text-success",
        tone === "warning" && "bg-warning-bg text-warning",
        tone === "danger" && "bg-danger-bg text-danger",
        className
      )}
    >
      {children}
    </span>
  );
}
