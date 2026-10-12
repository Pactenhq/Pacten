import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-ink-100 bg-white shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}
