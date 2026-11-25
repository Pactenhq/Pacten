import { Subscription, SubscriptionStatus } from './subscription.entity';

/**
 * Stripe subscription payload shape (subset) accepted by
 * applyStripeSubscriptionToRow. Unix seconds, as Stripe sends them;
 * null-safe so webhook payloads and SDK retrieve() results both work.
 */
export interface StripeSubscriptionData {
  id?: string;
  status?: string | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  cancel_at_period_end?: boolean | null;
}

export interface SubscriptionSyncChanges {
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Apply a Stripe subscription object onto a local Subscription row.
 *
 * Pure helper (no DI) so both the SubscriptionsService and the
 * PaymentsService webhook handler can use it without a circular
 * dependency (SubscriptionsService already injects PaymentsService).
 *
 * Rules (subscription sync-gap fix, Nov 25 2026):
 * - Status maps from Stripe: canceled -> CANCELED, past_due -> PAST_DUE,
 *   active -> ACTIVE, trialing -> TRIALING. Any other status (e.g.
 *   incomplete, unpaid, incomplete_expired, paused) leaves the local
 *   status UNCHANGED — we do not know how to render it, and silently
 *   downgrading an active row would be worse than leaving it.
 * - cancelAtPeriodEnd follows Stripe when it is a boolean.
 * - currentPeriodEnd / currentPeriodStart advance MONOTONICALLY: a
 *   value is applied only when the stored value is null or the new
 *   value is later. A delayed/duplicate event can never move the
 *   billing period backwards (the Nov 23 renewal was missed entirely,
 *   so the stale Nov 23 end must move forward to Dec 23 — never back).
 *
 * Returns the fields that actually changed (for logging / the
 * re-sync report). The caller saves the row.
 */
export function applyStripeSubscriptionToRow(
  sub: Subscription,
  stripeData: StripeSubscriptionData,
): SubscriptionSyncChanges {
  const changes: SubscriptionSyncChanges = {};

  if (stripeData.status) {
    let next: SubscriptionStatus | null = null;
    switch (stripeData.status) {
      case 'canceled':
        next = SubscriptionStatus.CANCELED;
        break;
      case 'past_due':
        next = SubscriptionStatus.PAST_DUE;
        break;
      case 'active':
        next = SubscriptionStatus.ACTIVE;
        break;
      case 'trialing':
        next = SubscriptionStatus.TRIALING;
        break;
      default:
        // Unknown Stripe status — leave the local status unchanged.
        next = null;
        break;
    }
    if (next && sub.status !== next) {
      sub.status = next;
      changes.status = next;
    }
  }

  if (
    typeof stripeData.cancel_at_period_end === 'boolean' &&
    sub.cancelAtPeriodEnd !== stripeData.cancel_at_period_end
  ) {
    sub.cancelAtPeriodEnd = stripeData.cancel_at_period_end;
    changes.cancelAtPeriodEnd = stripeData.cancel_at_period_end;
  }

  if (stripeData.current_period_end) {
    const periodEnd = new Date(stripeData.current_period_end * 1000);
    if (!sub.currentPeriodEnd || periodEnd > sub.currentPeriodEnd) {
      sub.currentPeriodEnd = periodEnd;
      changes.currentPeriodEnd = periodEnd;
    }
  }

  if (stripeData.current_period_start) {
    const periodStart = new Date(stripeData.current_period_start * 1000);
    if (!sub.currentPeriodStart || periodStart > sub.currentPeriodStart) {
      sub.currentPeriodStart = periodStart;
      changes.currentPeriodStart = periodStart;
    }
  }

  return changes;
}
