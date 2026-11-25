"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";

// Searchable dropdowns fed by the standardized filter dataset
// (GET /profiles/datasets). Single-select + multi-select variants,
// styled to match TextField (h-12, rounded-xl, brand focus ring,
// dark-mode aware). Options are dataset values only — free text can
// never be submitted as a new value.
//
// Legacy values: a stored value that is NOT in the dataset (typed
// before the dataset existed) still displays on load and stays
// selectable; if the user types text that matches nothing and differs
// from the stored value, the field reverts to the stored value on blur.

export type ComboOption = { value: string; label?: string };

function normalizeOptions(options: string[] | ComboOption[]): ComboOption[] {
  return options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : { value: o.value, label: o.label ?? o.value }
  );
}

function matchOptions(options: ComboOption[], text: string): ComboOption[] {
  const q = text.trim().toLowerCase();
  if (!q) return options;
  return options.filter((o) => (o.label ?? o.value).toLowerCase().includes(q));
}

const dropdownClass =
  "absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 py-1 shadow-lg";
const optionClass =
  "block w-full cursor-pointer px-4 py-2.5 text-left text-[15px] text-ink-900 dark:text-ink-50 hover:bg-brand-50 dark:hover:bg-white/10";

function FieldShell({
  label,
  hint,
  error,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <span className="text-sm font-medium text-ink-900 dark:text-ink-50">{label}</span>
      )}
      <div className="relative">{children}</div>
      {error ? (
        <p className="text-xs text-danger dark:text-danger-bright">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500 dark:text-ink-300">{hint}</p>
      ) : null}
    </div>
  );
}

export function Combobox({
  label,
  hint,
  error,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  /** Stored value (e.g. a country name). "" = nothing selected. */
  value: string;
  options: string[] | ComboOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const displayOf = (v: string) =>
    opts.find((o) => o.value === v)?.label ?? v;
  const [text, setText] = useState(displayOf(value));
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Keep the input in sync with the stored value while not editing.
  useEffect(() => {
    if (!focused) setText(displayOf(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, focused, options]);

  const filtered = useMemo(() => matchOptions(opts, focused ? text : ""), [opts, text, focused]);
  const inDataset = value !== "" && opts.some((o) => o.value === value);
  const legacyOption: ComboOption | null =
    value !== "" && !inDataset ? { value, label: `${value} (saved value)` } : null;
  const shown = legacyOption ? [legacyOption, ...filtered.filter((o) => o.value !== value)] : filtered;

  const commit = (next: string) => {
    setOpen(false);
    setText(displayOf(next));
    if (next !== value) onChange(next);
  };

  // Blur: typed text that matches an option commits it; anything else
  // reverts to the stored value (free text is never submitted).
  const revert = () => {
    setFocused(false);
    const exact = opts.find(
      (o) => (o.label ?? o.value).toLowerCase() === text.trim().toLowerCase()
    );
    if (text.trim() === "") commit("");
    else if (exact) commit(exact.value);
    else if (text.trim() === displayOf(value)) setText(displayOf(value));
    else setText(displayOf(value));
    setOpen(false);
  };

  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div ref={wrapRef} className={cn("relative", className)}>
        <input
          type="text"
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={label}
          autoComplete="off"
          onFocus={() => {
            setFocused(true);
            setOpen(true);
          }}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            // Let an option's onMouseDown (select) run before blur reverts.
            window.setTimeout(revert, 120);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setText(displayOf(value));
              setOpen(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (shown.length > 0) commit(shown[0].value);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "h-12 w-full rounded-xl border bg-white dark:bg-ink-900 px-4 pr-10 text-[15px] text-ink-900 dark:text-ink-50",
            "placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:outline-none focus:ring-2",
            error
              ? "border-danger focus:border-danger focus:ring-danger-bg"
              : "border-ink-300 dark:border-ink-700 focus:border-brand focus:ring-brand-100",
            disabled && "cursor-not-allowed opacity-60"
          )}
        />
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear selection"
            onMouseDown={(e) => {
              e.preventDefault();
              commit("");
            }}
            className="absolute top-1/2 right-9 -translate-y-1/2 cursor-pointer text-ink-400 hover:text-ink-900 dark:hover:text-ink-50"
          >
            ×
          </button>
        )}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-ink-500 dark:text-ink-300"
        >
          <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open && !disabled && (
          <div role="listbox" className={dropdownClass}>
            {shown.length === 0 ? (
              <p className="px-4 py-2.5 text-[15px] text-ink-500 dark:text-ink-300">
                No matches — pick from the list.
              </p>
            ) : (
              shown.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commit(o.value);
                  }}
                  className={cn(optionClass, o.value === value && "bg-brand-50 dark:bg-white/10 font-medium")}
                >
                  {o.label ?? o.value}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </FieldShell>
  );
}

export function MultiCombobox({
  label,
  hint,
  error,
  values,
  options,
  onChange,
  placeholder,
  disabled,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  /** Stored values. Values not in the dataset still show as chips. */
  values: string[];
  options: string[] | ComboOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const opts = useMemo(() => normalizeOptions(options), [options]);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const available = useMemo(
    () => opts.filter((o) => !values.includes(o.value)),
    [opts, values]
  );
  const filtered = useMemo(() => matchOptions(available, text), [available, text]);

  const add = (v: string) => {
    if (!values.includes(v)) onChange([...values, v]);
    setText("");
    setOpen(false);
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <FieldShell label={label} hint={hint} error={error}>
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "flex min-h-12 w-full flex-wrap items-center gap-1.5 rounded-xl border bg-white dark:bg-ink-900 px-3 py-2 focus-within:outline-none focus-within:ring-2",
            error
              ? "border-danger focus-within:border-danger focus-within:ring-danger-bg"
              : "border-ink-300 dark:border-ink-700 focus-within:border-brand focus-within:ring-brand-100",
            disabled && "opacity-60"
          )}
          onClick={() => setOpen(true)}
        >
          {values.map((v) => {
            const inDataset = opts.some((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded-full bg-brand-100 dark:bg-brand/25 px-2.5 py-1 text-[13px] font-medium text-brand dark:text-brand-200"
              >
                {v}
                {!inDataset && <span className="text-[11px] opacity-70">(saved)</span>}
                {!disabled && (
                  <button
                    type="button"
                    aria-label={`Remove ${v}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      remove(v);
                    }}
                    className="cursor-pointer leading-none hover:text-ink-900 dark:hover:text-ink-50"
                  >
                    ×
                  </button>
                )}
              </span>
            );
          })}
          <input
            type="text"
            value={text}
            disabled={disabled}
            placeholder={values.length === 0 ? placeholder : "Add more…"}
            aria-label={label}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
            }}
            // Blur with unmatched text just clears the typed text —
            // stored values are never changed by typing.
            onBlur={() => window.setTimeout(() => {
              setText("");
              setOpen(false);
            }, 120)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setText("");
                setOpen(false);
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (filtered.length > 0) add(filtered[0].value);
              } else if (e.key === "Backspace" && text === "" && values.length > 0) {
                remove(values[values.length - 1]);
              }
            }}
            className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-[15px] text-ink-900 dark:text-ink-50 placeholder:text-ink-400 dark:placeholder:text-ink-300 focus:outline-none"
          />
        </div>
        {open && !disabled && (
          <div role="listbox" className={dropdownClass}>
            {filtered.length === 0 ? (
              <p className="px-4 py-2.5 text-[15px] text-ink-500 dark:text-ink-300">
                {text ? "No matches — pick from the list." : "Type to search the list."}
              </p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(o.value);
                  }}
                  className={optionClass}
                >
                  {o.label ?? o.value}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </FieldShell>
  );
}
