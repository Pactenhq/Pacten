import { cn } from "@/lib/cn";

// Multi-step progress indicator as drawn  auth frames:
// numbered circles joined by a hairline, labels beneath. The active
// step is brand-blue; the rest are muted gray.
export function Stepper({
  steps,
  activeIndex = 0,
}: {
  steps: string[];
  activeIndex?: number;
}) {
  return (
    <ol className="flex items-start justify-center overflow-x-auto" aria-label="Progress">
      {steps.map((label, idx) => {
        const active = idx === activeIndex;
        const done = idx < activeIndex;
        return (
          <li key={label} className="flex shrink-0 items-start">
            <div className="flex flex-col items-center gap-2 px-2 sm:px-5">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold sm:h-9 sm:w-9 sm:text-[15px]",
                  active || done
                    ? "bg-brand text-white"
                    : "bg-ink-100 text-ink-500"
                )}
              >
                {idx + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-xs sm:text-sm",
                  active ? "font-semibold text-brand" : "font-medium text-ink-500"
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <span
                aria-hidden
                className="mt-[15px] h-[2px] w-6 bg-ink-200 sm:mt-[17px] sm:w-20"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
