/**
 * TOS §6.8 working-day counting for deal auto-completion.
 *
 * ASSUMPTION (client has not confirmed otherwise): working days are
 * Monday–Friday, the clock starts at submission, and bank holidays
 * are NOT excluded. If the client confirms a different definition
 * (e.g. holidays excluded), only this file changes.
 *
 * Counts the number of Mon–Fri calendar dates d with
 * from < d <= to — i.e. the submission day itself is excluded and
 * `to` is included when it is a weekday. Pure function, no deps.
 */
export function workingDaysElapsed(from: Date, to: Date): number {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  if (end <= start) return 0;
  let count = 0;
  const d = new Date(start);
  d.setDate(d.getDate() + 1); // exclude the submission day
  while (d <= end) {
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    if (day !== 0 && day !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}
