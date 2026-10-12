import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Button component: 53px tall large variant,
// semibold label, 14px radius.
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger-outline";
  size?: "sm" | "md" | "lg";
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "btn-shine ripple inline-flex cursor-pointer items-center justify-center gap-2 rounded-[14px] font-semibold whitespace-nowrap transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-5 text-sm",
        size === "lg" && "h-[53px] px-7 text-base",
        variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
        variant === "secondary" && "bg-brand-50 text-brand hover:bg-brand-100",
        variant === "outline" &&
          "border border-ink-300 bg-white text-ink-900 hover:border-ink-400 hover:bg-ink-50",
        variant === "ghost" && "bg-transparent text-ink-700 hover:bg-ink-50",
        variant === "danger-outline" &&
          "border border-danger bg-white text-danger hover:bg-danger-bg",
        className
      )}
      {...props}
    />
  );
}
