import { Injectable, Logger } from '@nestjs/common';
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
