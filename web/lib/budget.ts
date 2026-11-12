// Agreed-budget values are free-text strings, not numbers: brands type
// "500", "$500" or "500 USD" (the deal form even placeholders "$500"),
// and the opportunity pre-fill copies that text verbatim into
// deal.agreedBudget. Plain Number(value) is NaN for "$500", which is why
// the deal pages rendered "-" while the contract (which falls back to the
// raw string) showed $500 correctly. Strip currency symbols/commas the
// way the opportunities list and the dashboard moneyOf() already do,
// format when a number parses out, and otherwise show the raw text
// instead of hiding the budget behind "-".

/**
 * Extract the FIRST numeric value from a free-text budget/money string.
 * "$500 - $1,000" -> 500 (a range's first value, never the concatenated
 * digits 5001000); "$750" -> 750; "500 USD" -> 500; "$1,000.50" -> 1000.50.
 * Returns null when the string holds no number (empty/garbage), so callers
 * keep their existing null handling. Single-number behaviour is identical
 * to the old strip-all-non-digits parse.
 */
export function parseBudgetNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/,/g, "");
  const m = s.match(/[\d.]+/);
  if (!m) return null;
  const num = parseFloat(m[0]);
  return Number.isFinite(num) ? num : null;
}

export function formatBudgetDisplay(value: unknown): string {
  if (value === null || value === undefined || String(value).trim() === "")
    return "-";
  const raw = String(value).trim();
  const num = parseBudgetNumber(raw);
  if (num !== null) return `$${num.toLocaleString()}`;
  return raw;
}
