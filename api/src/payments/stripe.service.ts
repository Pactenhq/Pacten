import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import Stripe from 'stripe';

/**
 * Stripe wrapper.
 *
 * Modes:
 * - LIVE TEST MODE: STRIPE_SECRET_KEY is a real sk_test_* key → real SDK calls.
 * - DEMO MODE (default until the client invite/keys arrive): no real key →
 *   every Stripe call is simulated with deterministic fake ids. The API flow
 *   (payment → webhook → commission → payout) works end-to-end for demos
 *   and tests; swapping in real keys needs no code change.
 */
@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe | null = null;
  readonly demoMode: boolean;

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY', '');
    this.demoMode = !key || key.includes('placeholder');
    if (!this.demoMode) {
      this.stripe = new Stripe(key, {
        apiVersion: '2025-06-30.basil' as any,
      });
      this.logger.log('Stripe LIVE (test mode) initialised');
    } else {
      this.logger.warn(
        'Stripe DEMO mode: no real secret key — payments are simulated',
      );
    }
  }

  isDemo(): boolean {
    return this.demoMode;
  }

  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<{ id: string; clientSecret: string }> {
    if (this.demoMode) {
      const id = `pi_demo_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
      return { id, clientSecret: `${id}_secret_demo` };
    }
    const pi = await this.stripe.paymentIntents.create(
      {
        amount: params.amountCents,
        currency: params.currency,
        metadata: params.metadata || {},
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      },
      params.idempotencyKey
        ? { idempotencyKey: params.idempotencyKey }
        : undefined,
    );
    return { id: pi.id, clientSecret: pi.client_secret };
  }

  async createTransfer(params: {
    amountCents: number;
    currency: string;
    destination: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string }> {
    if (this.demoMode) {
      return {
        id: `tr_demo_${randomUUID().replace(/-/g, '').slice(0, 16)}`,
      };
    }
    const tr = await this.stripe.transfers.create({
      amount: params.amountCents,
      currency: params.currency,
      destination: params.destination,
      metadata: params.metadata || {},
    });
    return { id: tr.id };
  }

  /**
   * Stripe Connect (Express) onboarding.
   *
   * Demo mode has no real Stripe account behind it, so onboarding cannot
   * be simulated meaningfully (there is no Stripe-hosted page to visit):
   * these methods throw in demo mode and ConnectService reports the
   * demo state instead. Live TEST mode uses the real sk_test_* key.
   */
  async createExpressAccount(params: {
    email: string;
    country: string;
  }): Promise<{ id: string }> {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe Connect is not available in demo mode',
      );
    }
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: params.country,
      email: params.email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    return { id: account.id };
  }

  async createAccountLink(params: {
    accountId: string;
    refreshUrl: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe Connect is not available in demo mode',
      );
    }
    const link = await this.stripe.accountLinks.create({
      account: params.accountId,
      refresh_url: params.refreshUrl,
      return_url: params.returnUrl,
      type: 'account_onboarding',
    });
    return { url: link.url };
  }

  async retrieveConnectAccount(accountId: string): Promise<{
    id: string;
    email: string | null;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  }> {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe Connect is not available in demo mode',
      );
    }
    const account = await this.stripe.accounts.retrieve(accountId);
    return {
      id: account.id,
      email: account.email ?? null,
      detailsSubmitted: account.details_submitted ?? false,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
    };
  }

  async createCheckoutSession(params: {
    planName: string;
    amountCents: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<{ id: string; url: string }> {
    if (this.demoMode) {
      const id = `cs_demo_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
      return { id, url: `demo-checkout://${id}` };
    }
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: params.currency,
            recurring: { interval: 'month' },
            product_data: { name: params.planName },
            unit_amount: params.amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: params.metadata || {},
    });
    return { id: session.id, url: session.url };
  }

  /**
   * One-time (mode: 'payment') Checkout Session — used for deal upfront
   * payments, mirroring the subscription flow's redirect architecture.
   * createCheckoutSession above stays subscription-only.
   */
  async createPaymentCheckoutSession(params: {
    itemName: string;
    amountCents: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
    idempotencyKey?: string;
  }): Promise<{ id: string; url: string }> {
    if (this.demoMode) {
      const id = `cs_demo_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
      return { id, url: `demo-checkout://${id}` };
    }
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: params.currency,
              product_data: { name: params.itemName },
              unit_amount: params.amountCents,
            },
            quantity: 1,
          },
        ],
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: params.metadata || {},
      },
      params.idempotencyKey
        ? { idempotencyKey: params.idempotencyKey }
        : undefined,
    );
    return { id: session.id, url: session.url };
  }

  /**
   * Fetch a Checkout Session's current state (used by the deal page's
   * return-path sync after the payer comes back from Stripe).
   */
  async retrieveCheckoutSession(sessionId: string): Promise<{
    id: string;
    status: string | null;
    paymentStatus: string | null;
    paymentIntentId: string | null;
    url: string | null;
    metadata: Record<string, string>;
    subscriptionId: string | null;
  }> {
    if (this.demoMode) {
      return {
        id: sessionId,
        status: 'open',
        paymentStatus: 'unpaid',
        paymentIntentId: null,
        url: null,
        metadata: {},
        subscriptionId: null,
      };
    }
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      paymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? null),
      url: session.url,
      metadata: (session.metadata || {}) as Record<string, string>,
      subscriptionId:
        typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription?.id ?? null),
    };
  }

  /**
   * Fetch a subscription's live state from Stripe (used by the admin
   * re-sync and the cancel path). Throws in demo mode — there is no
   * real subscription behind a demo id.
   */
  async retrieveSubscription(id: string): Promise<{
    id: string;
    status: string | null;
    currentPeriodStart: number | null;
    currentPeriodEnd: number | null;
    cancelAtPeriodEnd: boolean;
  }> {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe subscriptions are not available in demo mode',
      );
    }
    const sub = await this.stripe.subscriptions.retrieve(id);
    // Stripe API 2025-06-30: the billing period lives on the
    // subscription ITEM, not on the subscription itself.
    const item = sub.items?.data?.[0];
    return {
      id: sub.id,
      status: sub.status,
      currentPeriodStart: item?.current_period_start ?? null,
      currentPeriodEnd: item?.current_period_end ?? null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    };
  }

  /**
   * Set cancel_at_period_end on a Stripe subscription. In demo mode
   * this is a logged no-op returning the requested value (there is no
   * real subscription to cancel); live mode calls Stripe.
   */
  async setCancelAtPeriodEnd(
    id: string,
    value: boolean,
  ): Promise<{ id: string; cancelAtPeriodEnd: boolean }> {
    if (this.demoMode) {
      this.logger.log(
        `Demo mode: subscription ${id} cancel_at_period_end=${value} (no-op)`,
      );
      return { id, cancelAtPeriodEnd: value };
    }
    const sub = await this.stripe.subscriptions.update(id, {
      cancel_at_period_end: value,
    });
    return { id: sub.id, cancelAtPeriodEnd: sub.cancel_at_period_end ?? value };
  }

  /**
   * Paid invoices for a subscription, oldest first (used by the admin
   * re-sync backfill). Throws in demo mode.
   */
  async listSubscriptionInvoices(subscriptionId: string): Promise<
    Array<{
      id: string;
      number: string | null;
      billingReason: string | null;
      amountPaid: number;
      currency: string;
      paymentIntentId: string | null;
      status: string | null;
      created: number;
    }>
  > {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe invoices are not available in demo mode',
      );
    }
    const invoices = await this.stripe.invoices.list({
      subscription: subscriptionId,
      limit: 100,
    });
    return invoices.data
      .filter((inv) => inv.status === 'paid')
      .map((inv) => ({
        id: inv.id,
        number: inv.number ?? null,
        billingReason: inv.billing_reason ?? null,
        amountPaid: inv.amount_paid ?? 0,
        currency: inv.currency ?? 'usd',
        // Stripe API 2025-06-30 has no top-level payment_intent on an
        // invoice; the Payment row's payment-intent column is nullable
        // metadata, so the re-sync leaves it null rather than guessing.
        paymentIntentId: null as string | null,
        status: inv.status,
        created: inv.created ?? 0,
      }))
      .sort((a, b) => a.created - b.created);
  }

  /**
   * The Checkout Session that created a subscription (used by the
   * admin re-sync to backfill the INITIAL payment row, which is keyed
   * by session id — never by the invoice id). Returns null when no
   * session is found; the caller reports that invoice as needing
   * manual review instead of inventing a session id. Throws in demo
   * mode.
   */
  async findCheckoutSessionBySubscription(
    subscriptionId: string,
  ): Promise<string | null> {
    if (this.demoMode) {
      throw new BadRequestException(
        'Stripe checkout sessions are not available in demo mode',
      );
    }
    const sessions = await this.stripe.checkout.sessions.list({
      subscription: subscriptionId,
      limit: 1,
    });
    return sessions.data[0]?.id ?? null;
  }

  /**
   * Verify + parse a webhook payload. In demo mode the signature is not
   * verified (there is no webhook secret yet) — the JSON is parsed directly.
   */
  constructEvent(
    rawBody: Buffer,
    signature: string | undefined,
  ): { id: string; type: string; data: any } {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET', '');
    if (!this.demoMode && secret && signature) {
      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        secret,
      );
      return { id: event.id, type: event.type, data: event.data.object };
    }
    if (!this.demoMode) {
      this.logger.warn(
        'Webhook received without verifiable signature — check STRIPE_WEBHOOK_SECRET',
      );
    }
    const parsed = JSON.parse(rawBody.toString('utf8'));
    return {
      id: parsed.id || `evt_demo_${randomUUID().slice(0, 8)}`,
      type: parsed.type,
      data: parsed.data?.object || parsed.data || {},
    };
  }
}
