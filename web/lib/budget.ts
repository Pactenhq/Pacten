// Agreed-budget values are free-text strings, not numbers: brands type
// "500", "$500" or "500 USD" (the deal form even placeholders "$500"),
// and the opportunity pre-fill copies that text verbatim into
// deal.agreedBudget. Plain Number(value) is NaN for "$500", which is why
// the deal pages rendered "-" while the contract (which falls back to the
// raw string) showed $500 correctly. Strip currency symbols/commas the
// way the opportunities list and the dashboard moneyOf() already do,
// format when a number parses out, and otherwise show the raw text
// instead of hiding the budget behind "-".
export function formatBudgetDisplay(value: unknown): string {
  if (value === null || value === undefined || String(value).trim() === "")
    return "-";
  const raw = String(value).trim();
  const digits = raw.replace(/[^0-9.]/g, "");
  const num = digits ? Number(digits) : NaN;
  if (Number.isFinite(num)) return `$${num.toLocaleString()}`;
  return raw;
}
