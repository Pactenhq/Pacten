import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

// Input component: label above, 48px field,
// 12px radius, brand focus ring.
type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
};

export function TextField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink-900 dark:text-ink-50"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "h-12 w-full rounded-xl border bg-white dark:bg-ink-900 px-4 text-[15px] text-ink-900 dark:text-ink-50",
          "placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:outline-none focus:ring-2",
          error
            ? "border-danger focus:border-danger focus:ring-danger-bg"
            : "border-ink-300 dark:border-ink-700 focus:border-brand focus:ring-brand-100"
        )}
        {...props}
      />
      {error ? (
        <p className="text-xs text-danger dark:text-danger-bright">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500 dark:text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}
