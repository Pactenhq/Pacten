import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout, PayoutStatus } from './payout.entity';
import { Payment, PaymentStatus } from './payment.entity';
import { PlatformCommission } from './platform-commission.entity';
import { Deal } from '../deals/deal.entity';
import { User } from '../users/user.entity';
import { StripeService } from './stripe.service';
import { ReferralsService } from '../referrals/referrals.service';

/**
 * Supported payout release: when a deal completes (work done + brand
 * approval), the recipient's payout is created for amount minus the
 * platform commission. In demo mode the transfer is simulated and the
 * payout stays PENDING until real Stripe Connect keys arrive.
 */
@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    @InjectRepository(Payout)
    private payoutsRepo: Repository<Payout>,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectRepository(PlatformCommission)
    private commissionsRepo: Repository<PlatformCommission>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private stripe: StripeService,
    private referrals: ReferralsService,
  ) {}

  /**
   * Create the payout for a completed deal. Idempotent per deal.
   * Also fires the referral deal-earning (10% of Pacten's commission to
   * the payee's referrer, first completed paid deal only).
   */
  async createForDeal(dealId: string): Promise<Payout> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');

    const payment = await this.paymentsRepo.findOne({
      where: { dealId, status: PaymentStatus.SUCCEEDED },
      order: { createdAt: 'DESC' },
    });

    let commissionCents = 0;
    if (payment) {
      const commission = await this.commissionsRepo.findOne({
        where: { paymentId: payment.id },
      });
      commissionCents = commission ? commission.amountCents : 0;
    }

    let payout = await this.payoutsRepo.findOne({
      where: { dealId },
    });
    if (!payout) {
      let grossCents = 0;
      if (payment) {
        grossCents = payment.amountCents;
      } else if (deal.agreedBudget) {
        const num = parseFloat(deal.agreedBudget.replace(/[^0-9.]/g, ''));
        grossCents = isNaN(num) ? 0 : Math.round(num * 100);
      }

      payout = await this.payoutsRepo.save(
        this.payoutsRepo.create({
          dealId,
          recipientId: deal.creatorId,
          amountCents: Math.max(0, grossCents - commissionCents),
          currency: payment?.currency || 'usd',
          status: PayoutStatus.PENDING,
        }),
      );

      this.logger.log(
        `Payout ${payout.id} created for deal ${dealId}: ${payout.amountCents}c (demo mode — transfer pending Stripe Connect)`,
      );
    }

    // Referral deal earning — only for PAID deals (a succeeded payment with
    // a recorded commission). Idempotent + first-deal-only inside the
    // referrals service.
    if (payment && commissionCents > 0) {
      try {
        await this.referrals.handleDealCompleted(
          deal.creatorId,
          deal.id,
          commissionCents,
        );
      } catch {
        // Referral earning is best-effort; never block the payout.
      }
    }

    return payout;
  }

  /**
   * Release a pending payout via Stripe transfer.
   *
   * Demo mode: unchanged — marks PROCESSING (simulated); real transfers
   * need Connect keys. Live mode: if the recipient has a connected
   * Stripe account, initiate the real transfer and mark PAID with the
   * transfer id (a transfer failure marks FAILED with the reason, so
   * the payout stays visible instead of silently stalling). If the
   * recipient has no connected account, the previous behaviour is kept
   * (PROCESSING) — the transfer then happens off-platform.
   * Idempotent: non-PENDING payouts are returned untouched.
   */
  async release(payoutId: string): Promise<Payout> {
    const payout = await this.payoutsRepo.findOne({
      where: { id: payoutId },
    });
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== PayoutStatus.PENDING) return payout;

    if (this.stripe.isDemo()) {
      payout.status = PayoutStatus.PROCESSING;
      payout.failureReason =
        'DEMO: transfer simulated — completes when Stripe Connect is configured';
      return this.payoutsRepo.save(payout);
    }

    // Live path: transfer only to a connected Stripe account.
    const recipient = await this.usersRepo.findOne({
      where: { id: payout.recipientId },
    });
    if (!recipient?.stripeAccountId) {
      payout.status = PayoutStatus.PROCESSING;
      return this.payoutsRepo.save(payout);
    }
    try {
      const tr = await this.stripe.createTransfer({
        amountCents: payout.amountCents,
        currency: payout.currency || 'usd',
        destination: recipient.stripeAccountId,
        metadata: { payoutId: payout.id, dealId: payout.dealId },
      });
      payout.stripeTransferId = tr.id;
      payout.status = PayoutStatus.PAID;
      payout.failureReason = null;
    } catch (e: any) {
      payout.status = PayoutStatus.FAILED;
      payout.failureReason = e?.message || 'Transfer failed';
    }
    return this.payoutsRepo.save(payout);
  }

  async myPayouts(userId: string): Promise<Payout[]> {
    return this.payoutsRepo.find({
      where: { recipientId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPayout(payoutId: string, userId: string): Promise<Payout> {
    const payout = await this.payoutsRepo.findOne({
      where: { id: payoutId },
    });
    if (!payout) throw new NotFoundException('Payout not found');
    const deal = await this.dealsRepo.findOne({
      where: { id: payout.dealId },
    });
    const isParty =
      payout.recipientId === userId ||
      (deal && (deal.brandId === userId || deal.creatorId === userId));
    if (!isParty) throw new ForbiddenException('Not a party to this payout');
    return payout;
  }

  async getPayoutForDeal(
    dealId: string,
    userId: string,
  ): Promise<Payout | null> {
    const payout = await this.payoutsRepo.findOne({ where: { dealId } });
    if (!payout) return null;
    return this.getPayout(payout.id, userId);
  }
}
