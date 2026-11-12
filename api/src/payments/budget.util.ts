/**
 * Extract the FIRST numeric value from a free-text budget/money string.
 * "$500 - $1,000" -> 500 (a range's first value, never the concatenated
 * digits 5001000); "$750" -> 750; "500 USD" -> 500; "$1,000.50" -> 1000.50.
 * Returns null when the string holds no number (empty/garbage), so callers
 * keep their existing null handling. Single-number behaviour is identical
 * to the old strip-all-non-digits parse. Shared by the upfront-payment
 * amount path (payments.service) and the payout amount path
 * (payouts.service) so display and payout always agree.
 */
export function parseBudgetNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const s = String(value).replace(/,/g, '');
  const m = s.match(/[\d.]+/);
  if (!m) return null;
  const num = parseFloat(m[0]);
  return Number.isFinite(num) ? num : null;
}
