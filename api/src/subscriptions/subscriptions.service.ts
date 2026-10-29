import {
  Injectable,
  NotFoundException,
  ForbiddenException,
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
import { SubscriptionPlan } from './subscription-plan.entity';
import { StripeService } from '../payments/stripe.service';
import { ReferralsService } from '../referrals/referrals.service';
import { User } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';

// Seed plans — the client's FINAL pricing (Oct 2026). Configurable via
// the subscription_plans table afterwards. Tiers: brands free/pro/business;
// creators + professionals free/pro/elite. Paid tiers carry the visibility/
// promotion perks; reduced fees come from the commission table by tier.
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
    benefits: ['Everything in Free', 'Unlimited job posts & hires', 'Featured campaigns', 'Priority support'],
    sortOrder: 2,
  },
  {
    role: 'brand',
    code: 'brand-business',
    name: 'Business',
    tier: 'business',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', 'Dedicated manager', 'Promoted visibility', 'Advanced analytics'],
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
    benefits: ['Promoted / featured profile', 'Increased visibility', 'Unlimited applications', '10% transaction commission'],
    sortOrder: 2,
  },
  {
    role: 'creator',
    code: 'creator-elite',
    name: 'Elite',
    tier: 'elite',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', 'Top-tier promotion', '5% transaction commission', 'Priority support'],
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
    benefits: ['Promoted / featured profile', 'Increased visibility', 'Unlimited applications', '10% transaction commission'],
    sortOrder: 2,
  },
  {
    role: 'professional',
    code: 'professional-elite',
    name: 'Elite',
    tier: 'elite',
    priceCentsMonthly: 7900,
    benefits: ['Everything in Pro', 'Top-tier promotion', '5% transaction commission', 'Priority support'],
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
    private config: ConfigService,
    private referrals: ReferralsService,
    private emails: EmailsService,
  ) {}

  async onModuleInit() {
    // Upsert by plan code so existing installs move from the demo prices
    // to the client's final pricing without losing plan ids (existing
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
    return this.mySubscription(userId);
  }

  async activate(
    userId: string,
    planId: string,
    stripeSubscriptionId: string | null,
  ): Promise<Subscription> {
    let sub = await this.subsRepo.findOne({ where: { userId } });
    if (!sub) {
      sub = this.subsRepo.create({ userId, planId });
    }
    sub.planId = planId;
    sub.status = SubscriptionStatus.ACTIVE;
    sub.stripeSubscriptionId = stripeSubscriptionId;
    sub.cancelAtPeriodEnd = false;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    sub.currentPeriodEnd = periodEnd;
    return this.subsRepo.save(sub);
  }

  async cancel(userId: string): Promise<Subscription> {
    const sub = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) throw new NotFoundException('No active subscription');
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
    return saved;
  }

  /** Called from the Stripe webhook for subscription events. */
  async syncFromStripeEvent(eventType: string, data: any): Promise<void> {
    const stripeSubId =
      data.id || data.subscription || data?.object?.id;
    if (!stripeSubId) return;
    const sub = await this.subsRepo.findOne({
      where: { stripeSubscriptionId: stripeSubId },
    });
    if (!sub) return;
    if (
      eventType === 'customer.subscription.deleted' ||
      data.status === 'canceled'
    ) {
      sub.status = SubscriptionStatus.CANCELED;
    } else if (data.status === 'past_due') {
      sub.status = SubscriptionStatus.PAST_DUE;
    } else if (data.status === 'active' || data.status === 'trialing') {
      sub.status =
        data.status === 'trialing'
          ? SubscriptionStatus.TRIALING
          : SubscriptionStatus.ACTIVE;
    }
    await this.subsRepo.save(sub);
  }
}
