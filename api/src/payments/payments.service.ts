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
import { Payment, PaymentStatus } from './payment.entity';
import { PaymentEvent } from './payment-event.entity';
import { CommissionRule } from './commission-rule.entity';
import { PlatformCommission } from './platform-commission.entity';
import { Deal, DealStatus } from '../deals/deal.entity';
import { User, UserRole } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';
import {
  Subscription,
  SubscriptionStatus,
} from '../subscriptions/subscription.entity';
import { SubscriptionPlan } from '../subscriptions/subscription-plan.entity';
import { StripeService } from './stripe.service';
import { CreateUpfrontPaymentDto } from './dto/payments.dto';
import { ReferralsService } from '../referrals/referrals.service';

// Client FINAL commission rates (Oct 2026, basis points). Commission is
// deducted from the creator/professional's earnings, keyed by THEIR
// current subscription tier. Brands are never charged a percentage.
// Still configurable via the commission_rules table — no code change.
const FINAL_COMMISSION_SEED: Array<{
  role: string;
  tier: string;
  rateBasisPoints: number;
}> = [
  { role: 'brand', tier: 'free', rateBasisPoints: 0 },
  { role: 'brand', tier: 'pro', rateBasisPoints: 0 },
  { role: 'brand', tier: 'business', rateBasisPoints: 0 },
  { role: 'creator', tier: 'free', rateBasisPoints: 1500 }, // 15%
  { role: 'creator', tier: 'pro', rateBasisPoints: 1000 }, // 10%
  { role: 'creator', tier: 'elite', rateBasisPoints: 500 }, // 5%
  { role: 'professional', tier: 'free', rateBasisPoints: 1500 },
  { role: 'professional', tier: 'pro', rateBasisPoints: 1000 },
  { role: 'professional', tier: 'elite', rateBasisPoints: 500 },
];

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(PaymentEvent)
    private eventsRepo: Repository<PaymentEvent>,
    @InjectRepository(CommissionRule)
    private rulesRepo: Repository<CommissionRule>,
    @InjectRepository(PlatformCommission)
    private commissionsRepo: Repository<PlatformCommission>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(Subscription)
    private subsRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepo: Repository<SubscriptionPlan>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private stripe: StripeService,
    private emails: EmailsService,
    private referrals: ReferralsService,
  ) {}

  async onModuleInit() {
    // Seed the client's final rates. Existing rows still carrying the old
    // DEMO note are migrated to the final values; rows an admin has since
    // edited (different note) are left untouched.
    for (const seed of FINAL_COMMISSION_SEED) {
      const existing = await this.rulesRepo.findOne({
        where: { role: seed.role, tier: seed.tier },
      });
      if (!existing) {
        await this.rulesRepo.save(
          this.rulesRepo.create({
            ...seed,
            note: 'Client final rates (Oct 2026)',
          }),
        );
      } else if (existing.note?.startsWith('DEMO')) {
        existing.rateBasisPoints = seed.rateBasisPoints;
        existing.isActive = true;
        existing.note = 'Client final rates (Oct 2026)';
        await this.rulesRepo.save(existing);
      }
    }
    // Deactivate legacy 'paid'-tier rules from the demo structure — tiers
    // are now free/pro/elite (creators, professionals) and
    // free/pro/business (brands).
    const legacy = await this.rulesRepo.find({ where: { tier: 'paid' } });
    for (const rule of legacy) {
      if (rule.isActive) {
        rule.isActive = false;
        await this.rulesRepo.save(rule);
      }
    }
    this.logger.log('Commission rules ready (client final rates)');
  }

  /**
   * A user's current subscription tier: the tier of their active plan
   * ('free' when they hold no active paid plan). Drives commission rates
   * and free-plan caps.
   */
  async getUserTier(userId: string): Promise<string> {
    const sub = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) return 'free';
    const plan = await this.plansRepo.findOne({
      where: { id: sub.planId },
    });
    if (!plan || plan.priceCentsMonthly === 0) return 'free';
    return plan.tier;
  }

  private parseBudgetToCents(budget: string): number | null {
    if (!budget) return null;
    const num = parseFloat(budget.replace(/[^0-9.]/g, ''));
    if (isNaN(num) || num <= 0) return null;
    return Math.round(num * 100);
  }

  /**
   * Brand funds the deal upfront. Idempotent via the Idempotency-Key header:
   * retries with the same key return the original payment.
   */
  async createUpfrontPayment(
    dealId: string,
    userId: string,
    dto: CreateUpfrontPaymentDto,
    idempotencyKey?: string,
  ): Promise<{ payment: Payment; clientSecret: string; demoMode: boolean }> {
    if (idempotencyKey) {
      const existing = await this.paymentsRepo.findOne({
        where: { idempotencyKey },
      });
      if (existing) {
        return {
          payment: existing,
          clientSecret: 'already-created',
          demoMode: this.stripe.isDemo(),
        };
      }
    }

    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');
    if (deal.brandId !== userId) {
      throw new ForbiddenException('Only the brand can fund the deal');
    }
    if (
      deal.status !== DealStatus.AGREED &&
      deal.status !== DealStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'Deal must be agreed before it can be funded',
      );
    }

    const amountCents =
      dto.amountCents || this.parseBudgetToCents(deal.agreedBudget);
    if (!amountCents) {
      throw new BadRequestException(
        'Could not determine the amount — pass amountCents explicitly',
      );
    }

    const currency = dto.currency || 'usd';
    const pi = await this.stripe.createPaymentIntent({
      amountCents,
      currency,
      metadata: { dealId, payerId: userId },
      idempotencyKey,
    });

    const payment = await this.paymentsRepo.save(
      this.paymentsRepo.create({
        dealId,
        payerId: userId,
        amountCents,
        currency,
        stripePaymentIntentId: pi.id,
        status: PaymentStatus.PENDING,
        idempotencyKey: idempotencyKey || null,
      }),
    );

    return { payment, clientSecret: pi.clientSecret, demoMode: this.stripe.isDemo() };
  }

  /**
   * DEMO ONLY: simulate the buyer completing the Stripe payment.
   * Mirrors what the real webhook (payment_intent.succeeded) would do.
   */
  async confirmDemoPayment(
    paymentId: string,
    userId: string,
  ): Promise<Payment> {
    if (!this.stripe.isDemo()) {
      throw new BadRequestException(
        'Demo confirmation is only available in demo mode',
      );
    }
    const payment = await this.getPayment(paymentId, userId);
    if (payment.status === PaymentStatus.SUCCEEDED) return payment;
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot confirm a payment in ${payment.status} state`,
      );
    }
    return this.processPaymentSuccess(payment, `evt_demo_${payment.id}`);
  }

  /** Shared success path: mark succeeded, compute + record commission. */
  async processPaymentSuccess(
    payment: Payment,
    stripeEventId?: string,
  ): Promise<Payment> {
    payment.status = PaymentStatus.SUCCEEDED;
    const saved = await this.paymentsRepo.save(payment);

    // Commission: deducted from the PAYEE's side (the creator/professional
    // receiving the deal money), keyed by the payee's role + CURRENT
    // subscription tier. Brands are never charged (their rules are 0 bps).
    // Immutable record.
    const deal = await this.dealsRepo.findOne({
      where: { id: payment.dealId },
    });
    const payeeId = deal ? deal.creatorId : null;
    const payee = payeeId
      ? await this.usersRepo.findOne({ where: { id: payeeId } })
      : null;
    const payeeRole = payee?.role ?? UserRole.CREATOR;
    let rateBps = 0;
    if (payeeRole === UserRole.CREATOR || payeeRole === UserRole.PROFESSIONAL) {
      const tier = await this.getUserTier(payeeId);
      const rule = await this.rulesRepo.findOne({
        where: { role: payeeRole, tier, isActive: true },
      });
      rateBps = rule ? rule.rateBasisPoints : 1500;
    }
    const commissionCents = Math.round(
      (payment.amountCents * rateBps) / 10000,
    );

    const already = await this.commissionsRepo.findOne({
      where: { paymentId: payment.id },
    });
    if (!already) {
      await this.commissionsRepo.save(
        this.commissionsRepo.create({
          paymentId: payment.id,
          dealId: payment.dealId,
          payerId: payment.payerId,
          payeeId,
          rateBasisPoints: rateBps,
          amountCents: commissionCents,
          currency: payment.currency,
        }),
      );
    }

    if (stripeEventId) {
      await this.recordEvent(
        stripeEventId,
        'payment_intent.succeeded',
        payment.id,
        { paymentIntentId: payment.stripePaymentIntentId },
      );
    }

    // Transactional email (M5). Best-effort.
    try {
      const payer = await this.usersRepo.findOne({
        where: { id: payment.payerId },
      });
      if (payer) {
        const amount = `$${(payment.amountCents / 100).toFixed(2)}`;
        await this.emails.sendPaymentSucceeded(
          payer.email,
          amount,
          deal?.title || 'your deal',
        );
      }
    } catch {
      // Email is best-effort.
    }

    return saved;
  }

  async recordEvent(
    stripeEventId: string,
    eventType: string,
    paymentId: string | null,
    payload: any,
  ): Promise<PaymentEvent | null> {
    const dup = await this.eventsRepo.findOne({
      where: { stripeEventId },
    });
    if (dup) return null; // already processed — idempotent
    const event = this.eventsRepo.create({
      stripeEventId,
      eventType,
      paymentId,
      payload,
      processedAt: new Date(),
    });
    return this.eventsRepo.save(event);
  }

  /**
   * Stripe webhook entry point. Webhooks are the source of truth for
   * asynchronous payment state — frontend callbacks are not sufficient.
   */
  async handleWebhook(
    rawBody: Buffer,
    signature: string | undefined,
  ): Promise<{ received: boolean }> {
    const event = this.stripe.constructEvent(rawBody, signature);

    const dup = await this.eventsRepo.findOne({
      where: { stripeEventId: event.id },
    });
    if (dup) return { received: true }; // redelivery — ignore

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const piId = event.data.id;
        const payment = await this.paymentsRepo.findOne({
          where: { stripePaymentIntentId: piId },
        });
        if (payment && payment.status !== PaymentStatus.SUCCEEDED) {
          await this.processPaymentSuccess(payment, event.id);
        } else {
          await this.recordEvent(event.id, event.type, payment?.id || null, event.data);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const piId = event.data.id;
        const payment = await this.paymentsRepo.findOne({
          where: { stripePaymentIntentId: piId },
        });
        if (payment) {
          payment.status = PaymentStatus.FAILED;
          payment.failureReason =
            event.data.last_payment_error?.message || 'payment failed';
          await this.paymentsRepo.save(payment);
        }
        await this.recordEvent(event.id, event.type, payment?.id || null, event.data);
        break;
      }
      case 'charge.refunded': {
        const piId = event.data.payment_intent;
        const payment = piId
          ? await this.paymentsRepo.findOne({
              where: { stripePaymentIntentId: piId },
            })
          : null;
        if (payment) {
          payment.status = PaymentStatus.REFUNDED;
          await this.paymentsRepo.save(payment);
          // Client rule: no referral rewards on refunds/chargebacks —
          // reverse any earning sourced from this deal/payment.
          await this.referrals.reverseEarningsBySource(payment.id);
          await this.referrals.reverseEarningsBySource(payment.dealId);
        }
        // Subscription-payment refund: the checkout session reference is
        // carried in the charge metadata (propagated from the session).
        const sessionRef =
          event.data.metadata?.sessionId ||
          event.data.metadata?.checkoutSessionId ||
          event.data.session_id;
        if (sessionRef) {
          await this.referrals.reverseEarningsBySource(sessionRef);
        }
        if (piId || sessionRef) {
          await this.recordEvent(event.id, event.type, payment?.id || null, event.data);
        }
        break;
      }
      case 'checkout.session.completed': {
        const session = event.data;
        if (
          session?.mode === 'subscription' &&
          session?.metadata?.userId &&
          session?.metadata?.planId
        ) {
          const plan = await this.plansRepo.findOne({
            where: { id: session.metadata.planId },
          });
          if (plan) {
            let sub = await this.subsRepo.findOne({
              where: { userId: session.metadata.userId },
            });
            if (!sub) {
              sub = this.subsRepo.create({
                userId: session.metadata.userId,
                planId: plan.id,
              });
            }
            sub.planId = plan.id;
            sub.status = SubscriptionStatus.ACTIVE;
            sub.stripeSubscriptionId =
              session.subscription || session.id;
            await this.subsRepo.save(sub);
            // Referral earning: 20% of this subscription payment (first
            // three payments only — enforced in ReferralsService).
            await this.referrals.handleSubscriptionPayment(
              session.metadata.userId,
              session.amount_total ?? plan.priceCentsMonthly,
              session.id,
            );
          }
        }
        await this.recordEvent(event.id, event.type, null, event.data);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const stripeSubId = event.data.id;
        const sub = await this.subsRepo.findOne({
          where: { stripeSubscriptionId: stripeSubId },
        });
        if (sub) {
          if (event.type === 'customer.subscription.deleted') {
            sub.status = SubscriptionStatus.CANCELED;
          } else if (event.data.status === 'past_due') {
            sub.status = SubscriptionStatus.PAST_DUE;
          } else if (event.data.status === 'active') {
            sub.status = SubscriptionStatus.ACTIVE;
          }
          await this.subsRepo.save(sub);
        }
        await this.recordEvent(event.id, event.type, null, event.data);
        break;
      }
      default:
        // Anything else is stored for audit.
        await this.recordEvent(event.id, event.type, null, event.data);
    }

    return { received: true };
  }

  async myPayments(userId: string): Promise<Payment[]> {
    return this.paymentsRepo.find({
      where: { payerId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPayment(paymentId: string, userId: string): Promise<Payment> {
    const payment = await this.paymentsRepo.findOne({
      where: { id: paymentId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    const deal = await this.dealsRepo.findOne({
      where: { id: payment.dealId },
    });
    const isParty =
      payment.payerId === userId ||
      (deal && (deal.brandId === userId || deal.creatorId === userId));
    if (!isParty) throw new ForbiddenException('Not a party to this payment');
    return payment;
  }

  async getCommissionForPayment(
    paymentId: string,
    userId: string,
  ): Promise<PlatformCommission> {
    await this.getPayment(paymentId, userId); // authorization
    const commission = await this.commissionsRepo.findOne({
      where: { paymentId },
    });
    if (!commission)
      throw new NotFoundException('No commission recorded yet');
    return commission;
  }

  async listRules(): Promise<CommissionRule[]> {
    return this.rulesRepo.find({ order: { role: 'ASC', tier: 'ASC' } });
  }
}
