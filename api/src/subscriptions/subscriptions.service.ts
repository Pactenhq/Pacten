import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Subscription,
  SubscriptionStatus,
} from './subscription.entity';
import {
  applyStripeSubscriptionToRow,
  SubscriptionSyncChanges,
} from './subscription-sync.util';
import { SubscriptionPlan } from './subscription-plan.entity';
import { StripeService } from '../payments/stripe.service';
import { PaymentsService } from '../payments/payments.service';
import { ReferralsService } from '../referrals/referrals.service';
import { User } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

const SEED_PLANS: Array<{
  role: string;
  code: string;
  name: string;
  tier: string;
  priceCentsMonthly: number;
  benefits: string[];
  sortOrder: number;
}> = [
  {
    role: 'brand',
    code: 'brand-free',
    name: 'Free',
    tier: 'free',
    priceCentsMonthly: 0,
    benefits: ['Browse creators', '1 job post', '1 hire', 'Standard support'],
    sortOrder: 1,
  },
  {
    role: 'brand',
    code: 'brand-pro',
    name: 'Pro',
    tier: 'pro',
    priceCentsMonthly: 2900,
    benefits: ['Everything in Free', 'Unlimited job posts & hires', 'Priority support'],
    sortOrder: 2,
  },
  {
    role: 'brand',
    code: 'brand-business',
    name: 'Business',
    tier: 'business',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', 'Priority support'],
    sortOrder: 3,
  },
  {
    role: 'creator',
    code: 'creator-free',
    name: 'Free',
    tier: 'free',
    priceCentsMonthly: 0,
    benefits: ['Public profile', 'Up to 5 applications', '15% transaction commission'],
    sortOrder: 1,
  },
  {
    role: 'creator',
    code: 'creator-pro',
    name: 'Pro',
    tier: 'pro',
    priceCentsMonthly: 2900,
    benefits: ['Unlimited applications', '10% transaction commission', 'Priority support'],
    sortOrder: 2,
  },
  {
    role: 'creator',
    code: 'creator-elite',
    name: 'Elite',
    tier: 'elite',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', '5% transaction commission', 'Priority support'],
    sortOrder: 3,
  },
  {
    role: 'professional',
    code: 'professional-free',
    name: 'Free',
    tier: 'free',
    priceCentsMonthly: 0,
    benefits: ['Public profile', 'Up to 5 applications', '15% transaction commission'],
    sortOrder: 1,
  },
  {
    role: 'professional',
    code: 'professional-pro',
    name: 'Pro',
    tier: 'pro',
    priceCentsMonthly: 2900,
    benefits: ['Unlimited applications', '10% transaction commission', 'Priority support'],
    sortOrder: 2,
  },
  {
    role: 'professional',
    code: 'professional-elite',
    name: 'Elite',
    tier: 'elite',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', '5% transaction commission', 'Priority support'],
    sortOrder: 3,
  },
];

@Injectable()
export class SubscriptionsService implements OnModuleInit {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(Subscription)
    private subsRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepo: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private stripe: StripeService,
    private payments: PaymentsService,
    private config: ConfigService,
    private referrals: ReferralsService,
    private emails: EmailsService,
    private notifications: NotificationsService,
  ) {}

  async onModuleInit() {
    // Upsert by plan code so existing installs move from the demo prices
    // to the final pricing without losing plan ids (existing
    // subscriptions keep pointing at the same rows).
    for (const seed of SEED_PLANS) {
      const existing = await this.plansRepo.findOne({
        where: { code: seed.code },
      });
      if (!existing) {
        await this.plansRepo.save(this.plansRepo.create(seed));
      } else {
        existing.role = seed.role;
        existing.name = seed.name;
        existing.tier = seed.tier;
        existing.priceCentsMonthly = seed.priceCentsMonthly;
        existing.benefits = seed.benefits;
        existing.sortOrder = seed.sortOrder;
        existing.isActive = true;
        await this.plansRepo.save(existing);
      }
    }
    this.logger.log('Subscription plans ready (client final pricing)');
  }

  async listPlans(role?: string): Promise<SubscriptionPlan[]> {
    const where: any = { isActive: true };
    if (role) where.role = role;
    return this.plansRepo.find({ where, order: { sortOrder: 'ASC' } });
  }

  async mySubscription(userId: string): Promise<{
    subscription: Subscription | null;
    plan: SubscriptionPlan | null;
  }> {
    const subscription = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    const plan = subscription
      ? await this.plansRepo.findOne({ where: { id: subscription.planId } })
      : null;
    return { subscription, plan };
  }

  /** True when the user holds an active plan with a non-zero price. */
  async hasPaidPlan(userId: string): Promise<boolean> {
    const { plan } = await this.mySubscription(userId);
    return !!plan && plan.priceCentsMonthly > 0;
  }

  /**
   * Start checkout for a plan. Free plans activate immediately; paid plans
   * go through Stripe (test mode) — simulated in demo mode.
   */
  async checkout(
    userId: string,
    planId: string,
  ): Promise<{
    subscription?: Subscription;
    checkoutUrl?: string;
    sessionId?: string;
    demoMode?: boolean;
  }> {
    const plan = await this.plansRepo.findOne({
      where: { id: planId, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plan not found');

    if (plan.priceCentsMonthly === 0) {
      const subscription = await this.activate(userId, plan.id, null);
      return { subscription };
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const session = await this.stripe.createCheckoutSession({
      planName: `Pacten ${plan.name} (${plan.role})`,
      amountCents: plan.priceCentsMonthly,
      currency: plan.currency,
      successUrl: `${frontendUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan.id}`,
      cancelUrl: `${frontendUrl}/pricing?cancelled=1`,
      metadata: { userId, planId: plan.id },
    });

    if (this.stripe.isDemo()) {
      // Demo: simulate the completed checkout immediately. This is the
      // demo-mode subscription PAYMENT success point — the live-mode
      // equivalent is the checkout.session.completed webhook.
      const subscription = await this.activate(userId, plan.id, session.id);
      await this.referrals.handleSubscriptionPayment(
        userId,
        plan.priceCentsMonthly,
        session.id,
      );
      // Billing History: record the Payment row — without
      // it GET /payments/my is empty for a paying subscriber.
      await this.payments.recordSubscriptionPayment({
        userId,
        plan,
        stripeCheckoutSessionId: session.id,
        amountCents: plan.priceCentsMonthly,
      });
      return {
        subscription,
        checkoutUrl: session.url,
        sessionId: session.id,
        demoMode: true,
      };
    }

    return { checkoutUrl: session.url, sessionId: session.id };
  }

  /**
   * LIVE return-path sync for subscription checkouts (the pricing success
   * page calls this after Stripe redirects back with ?session_id=...).
   * Mirrors the deal-payment sync: the checkout.session.completed webhook
   * points at the deployed backend, so on a local run it never arrives —
   * this endpoint settles the subscription from the return URL instead.
   * Idempotent: activate() upserts the user's subscription row and the
   * referral earning is deduped by sourceId (the session id) inside
   * ReferralsService. The webhook remains the other settlement path —
   * whichever lands first wins, the second is a no-op.
   */
  async syncCheckout(
    userId: string,
    sessionId: string,
  ): Promise<{
    subscription: Subscription | null;
    plan: SubscriptionPlan | null;
  }> {
    const current = await this.mySubscription(userId);
    if (this.stripe.isDemo() || !sessionId) return current;

    let session: Awaited<
      ReturnType<StripeService['retrieveCheckoutSession']>
    >;
    try {
      session = await this.stripe.retrieveCheckoutSession(sessionId);
    } catch {
      // Session lookup is best-effort on the return path; the webhook
      // can still settle the subscription later.
      return current;
    }

    const paid =
      session.paymentStatus === 'paid' || session.status === 'complete';
    if (!paid) return current;

    if (session.metadata?.userId !== userId) {
      throw new ForbiddenException(
        'This checkout session belongs to another user',
      );
    }
    const planId = session.metadata?.planId;
    if (!planId) return current;
    const plan = await this.plansRepo.findOne({ where: { id: planId } });
    if (!plan) return current;

    await this.activate(userId, plan.id, session.subscriptionId);
    await this.referrals.handleSubscriptionPayment(
      userId,
      plan.priceCentsMonthly,
      sessionId,
    );
    // Billing History: record the Payment row — deduped by
    // session id, so a webhook that already settled this checkout is a
    // no-op here.
    await this.payments.recordSubscriptionPayment({
      userId,
      plan,
      stripeCheckoutSessionId: sessionId,
      amountCents: plan.priceCentsMonthly,
      stripePaymentIntentId: session.paymentIntentId,
    });
    return this.mySubscription(userId);
  }

  async activate(
    userId: string,
    planId: string,
    stripeSubscriptionId: string | null,
  ): Promise<Subscription> {
    let sub = await this.subsRepo.findOne({ where: { userId } });
    // Capture the pre-activation state: activate() is an upsert called
    // from checkout, demo sync and the live return-path sync, so the
    // "subscription created" notification must fire only on a genuine
    // activation (new row, plan change, or re-activation) — never on an
    // idempotent re-sync of the same active plan.
    const wasNew = !sub;
    const prevPlanId = sub?.planId;
    const prevStatus = sub?.status;
    if (!sub) {
      sub = this.subsRepo.create({ userId, planId });
    }
    sub.planId = planId;
    sub.status = SubscriptionStatus.ACTIVE;
    sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.cancelAtPeriodEnd = false;
    sub.currentPeriodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    sub.currentPeriodEnd = periodEnd;
    const saved = await this.subsRepo.save(sub);
    if (
      wasNew ||
      prevPlanId !== planId ||
      prevStatus !== SubscriptionStatus.ACTIVE
    ) {
      const plan = await this.plansRepo.findOne({ where: { id: planId } });
      await this.notifications.create({
        userId,
        type: NotificationType.SUBSCRIPTION_CREATED,
        title: 'Subscription activated',
        body: `Your ${plan?.name ?? 'Pacten'} subscription is now active.`,
        link: '/dashboard/subscription',
        relatedId: saved.id,
      });
    }
    return saved;
  }

  async cancel(userId: string): Promise<Subscription> {
    const sub = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) throw new NotFoundException('No active subscription');
    // Cancel at Stripe FIRST (live mode only). Before this fix cancel()
    // set only the local flag — Stripe kept charging the user at the
    // next renewal, because no code path anywhere cancelled the Stripe
    // subscription. On a Stripe error the user is NOT cancelled locally
    // and no cancellation email is sent: never tell them they are
    // cancelled while Stripe keeps charging. The only exceptions are
    // "already gone" (not found / already canceled) — then the local
    // flag is the correct state and we proceed.
    if (sub.stripeSubscriptionId && !this.stripe.isDemo()) {
      try {
        await this.stripe.setCancelAtPeriodEnd(sub.stripeSubscriptionId, true);
      } catch (err: any) {
        const message = String(err?.message ?? '');
        const alreadyGone =
          err?.code === 'resource_missing' ||
          err?.statusCode === 404 ||
          /no such subscription/i.test(message) ||
          /canceled|cancelled/i.test(message);
        if (alreadyGone) {
          this.logger.warn(
            `Stripe cancel skipped for ${sub.stripeSubscriptionId} (already gone): ${message} — proceeding locally`,
          );
        } else {
          this.logger.error(
            `Stripe cancel failed for ${sub.stripeSubscriptionId}: ${message} — local flag NOT set`,
          );
          throw err;
        }
      }
    }
    sub.cancelAtPeriodEnd = true;
    const saved = await this.subsRepo.save(sub);
    // Notify the subscriber (transactional email). Webhook-driven
    // cancellations (syncFromStripeEvent) do not email, to avoid
    // double-notifying when the user already cancelled here.
    try {
      const [user, plan] = await Promise.all([
        this.usersRepo.findOne({ where: { id: userId } }),
        this.plansRepo.findOne({ where: { id: sub.planId } }),
      ]);
      if (user) {
        const accessUntil = saved.currentPeriodEnd
          ? new Date(saved.currentPeriodEnd).toISOString().slice(0, 10)
          : undefined;
        await this.emails.sendSubscriptionCancelled(
          user.email,
          plan?.name ?? 'Pacten',
          accessUntil,
        );
      }
    } catch {
      // Email is best-effort.
    }
    // In-app notification for the subscriber (same trigger as the email).
    const cancelPlan = await this.plansRepo.findOne({
      where: { id: sub.planId },
    });
    const cancelAccessUntil = saved.currentPeriodEnd
      ? new Date(saved.currentPeriodEnd).toISOString().slice(0, 10)
      : undefined;
    await this.notifications.create({
      userId,
      type: NotificationType.SUBSCRIPTION_CANCELLED,
      title: 'Subscription cancelled',
      body: `Your ${cancelPlan?.name ?? 'Pacten'} subscription has been cancelled.${cancelAccessUntil ? ` You will keep access until ${cancelAccessUntil}.` : ''}`,
      link: '/dashboard/subscription',
      relatedId: saved.id,
    });
    return saved;
  }

  /**
   * Called from the Stripe webhook for subscription events.
   *
   * Sync-gap fix (Nov 25 2026): this used to update ONLY the status and
   * had zero callers (dead code) — the live webhook path duplicated the
   * status-only logic inline. It now applies the full Stripe state
   * (status, period start/end with a monotonic guard, cancel flag) via
   * the shared helper, and the webhook handler calls this method.
   * A customer.subscription.deleted event always means canceled, even
   * if the payload carries no usable status.
   */
  async syncFromStripeEvent(eventType: string, data: any): Promise<void> {
    const stripeSubId =
      data.id || data.subscription || data?.object?.id;
    if (!stripeSubId) return;
    const sub = await this.subsRepo.findOne({
      where: { stripeSubscriptionId: stripeSubId },
    });
    if (!sub) return;
    const changes = applyStripeSubscriptionToRow(sub, {
      status: data.status,
      current_period_start: data.current_period_start,
      current_period_end: data.current_period_end,
      cancel_at_period_end: data.cancel_at_period_end,
    });
    if (
      eventType === 'customer.subscription.deleted' &&
      sub.status !== SubscriptionStatus.CANCELED
    ) {
      sub.status = SubscriptionStatus.CANCELED;
      changes.status = SubscriptionStatus.CANCELED;
    }
    await this.subsRepo.save(sub);
    this.logger.log(
      `Subscription ${sub.id} synced from Stripe ${eventType} (${stripeSubId}): ${JSON.stringify(changes)}`,
    );
  }

  /**
   * Admin re-sync of one subscription from Stripe (POST
   * /subscriptions/admin/resync). Repairs rows left stale when webhook
   * events never landed — e.g. e2e-brand sub_1UTlEXAF2tt2PwITgykpeUxH:
   * Stripe renewed Nov 23 (invoice WTUKRTEP-0023, $29, paid; current
   * period ends Dec 23, 2026) but the local row still said period end
   * Nov 23 with no $29 Payment rows, because both the Oct 23 and Nov
   * 23 invoice.payment_succeeded events were missed.
   *
   * Refuses demo mode (there is no real Stripe state to sync from).
   * Idempotent: the period guard is monotonic and the Payment backfill
   * dedupes by invoice id / session id, so re-running is a no-op.
   */
  async resyncFromStripe(params: {
    subscriptionId?: string;
    stripeSubscriptionId?: string;
  }): Promise<SubscriptionResyncReport> {
    if (this.stripe.isDemo()) {
      throw new BadRequestException(
        'Subscription re-sync is not available in demo mode',
      );
    }
    if (!params.subscriptionId && !params.stripeSubscriptionId) {
      throw new BadRequestException(
        'Provide subscriptionId or stripeSubscriptionId',
      );
    }
    let sub: Subscription | null = null;
    if (params.subscriptionId) {
      sub = await this.subsRepo.findOne({
        where: { id: params.subscriptionId },
      });
    } else if (params.stripeSubscriptionId) {
      sub = await this.subsRepo.findOne({
        where: { stripeSubscriptionId: params.stripeSubscriptionId },
      });
    }
    if (!sub) throw new NotFoundException('Subscription not found');
    if (!sub.stripeSubscriptionId) {
      throw new BadRequestException(
        'Subscription has no Stripe subscription id',
      );
    }

    const before: SubscriptionResyncState = {
      status: sub.status,
      currentPeriodStart: sub.currentPeriodStart
        ? sub.currentPeriodStart.toISOString()
        : null,
      currentPeriodEnd: sub.currentPeriodEnd
        ? sub.currentPeriodEnd.toISOString()
        : null,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    };

    const stripeSub = await this.stripe.retrieveSubscription(
      sub.stripeSubscriptionId,
    );
    const changes = applyStripeSubscriptionToRow(sub, {
      status: stripeSub.status,
      current_period_start: stripeSub.currentPeriodStart,
      current_period_end: stripeSub.currentPeriodEnd,
      cancel_at_period_end: stripeSub.cancelAtPeriodEnd,
    });
    const saved = await this.subsRepo.save(sub);

    // Backfill missing Payment rows from the paid invoices on Stripe
    // (oldest first). The invoice.payment_succeeded webhook is the
    // normal path; this only repairs invoices whose events never
    // landed. Referral credit uses the same mechanism as the live
    // paths (20% of the payment, first three payments only, deduped
    // by sourceId inside ReferralsService).
    const plan = await this.plansRepo.findOne({
      where: { id: sub.planId },
    });
    const paymentsCreated: SubscriptionResyncPayment[] = [];
    const paymentsSkipped: SubscriptionResyncSkipped[] = [];
    let referralCreditsAttempted = 0;
    if (!plan) {
      paymentsSkipped.push({
        invoiceId: null,
        reason: 'plan not found for subscription — backfill skipped',
      });
    } else {
      const invoices = await this.stripe.listSubscriptionInvoices(
        sub.stripeSubscriptionId,
      );
      for (const invoice of invoices) {
        const skip = (reason: string) =>
          paymentsSkipped.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            reason,
          });
        if (!invoice.amountPaid || invoice.amountPaid <= 0) {
          skip('zero amount');
          continue;
        }
        if (
          await this.payments.findPaymentByInvoiceId(invoice.id)
        ) {
          skip('Payment row already exists for this invoice');
          continue;
        }
        if (invoice.billingReason === 'subscription_cycle') {
          await this.payments.recordRenewalPayment({
            userId: sub.userId,
            plan,
            stripeInvoiceId: invoice.id,
            amountCents: invoice.amountPaid,
            currency: invoice.currency,
            stripePaymentIntentId: invoice.paymentIntentId,
          });
          await this.referrals.handleSubscriptionPayment(
            sub.userId,
            invoice.amountPaid,
            invoice.id,
          );
          referralCreditsAttempted++;
          paymentsCreated.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            amountCents: invoice.amountPaid,
            kind: 'renewal',
          });
        } else if (invoice.billingReason === 'subscription_create') {
          // The initial payment is keyed by CHECKOUT SESSION id, never
          // by the invoice id (using the invoice id as the sourceId
          // would double-count it against the three-payment referral
          // cap). If no session is found, skip and flag for manual
          // review — never invent a session id or an amount.
          const sessionId =
            await this.stripe.findCheckoutSessionBySubscription(
              sub.stripeSubscriptionId,
            );
          if (!sessionId) {
            skip(
              'needs manual review: no checkout session found for the initial invoice',
            );
            continue;
          }
          if (await this.payments.findPaymentBySessionId(sessionId)) {
            skip('Payment row already exists for the checkout session');
            continue;
          }
          await this.payments.recordSubscriptionPayment({
            userId: sub.userId,
            plan,
            stripeCheckoutSessionId: sessionId,
            amountCents: invoice.amountPaid,
            currency: invoice.currency,
            stripePaymentIntentId: invoice.paymentIntentId,
          });
          await this.referrals.handleSubscriptionPayment(
            sub.userId,
            invoice.amountPaid,
            sessionId,
          );
          referralCreditsAttempted++;
          paymentsCreated.push({
            invoiceId: invoice.id,
            invoiceNumber: invoice.number,
            amountCents: invoice.amountPaid,
            kind: 'initial',
          });
        } else {
          skip(
            `unsupported billing_reason: ${invoice.billingReason ?? 'unknown'}`,
          );
        }
      }
    }

    const report: SubscriptionResyncReport = {
      subscriptionId: saved.id,
      stripeSubscriptionId: saved.stripeSubscriptionId,
      before,
      after: {
        status: saved.status,
        currentPeriodStart: saved.currentPeriodStart
          ? saved.currentPeriodStart.toISOString()
          : null,
        currentPeriodEnd: saved.currentPeriodEnd
          ? saved.currentPeriodEnd.toISOString()
          : null,
        cancelAtPeriodEnd: saved.cancelAtPeriodEnd,
      },
      stripeValuesApplied: changes,
      paymentsCreated,
      paymentsSkipped,
      referralCreditsAttempted,
    };
    this.logger.log(
      `Admin re-sync ${saved.id} (${saved.stripeSubscriptionId}): ${JSON.stringify(report)}`,
    );
    return report;
  }
}

export interface SubscriptionResyncState {
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionResyncPayment {
  invoiceId: string;
  invoiceNumber: string | null;
  amountCents: number;
  kind: 'initial' | 'renewal';
}

export interface SubscriptionResyncSkipped {
  invoiceId: string | null;
  invoiceNumber?: string | null;
  reason: string;
}

export interface SubscriptionResyncReport {
  subscriptionId: string;
  stripeSubscriptionId: string | null;
  before: SubscriptionResyncState;
  after: SubscriptionResyncState;
  stripeValuesApplied: SubscriptionSyncChanges;
  paymentsCreated: SubscriptionResyncPayment[];
  paymentsSkipped: SubscriptionResyncSkipped[];
  referralCreditsAttempted: number;
}
