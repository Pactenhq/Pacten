import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { ReferralCode } from './referral-code.entity';
import {
  Referral,
  ReferralStatus,
} from './referral.entity';
import { ReferralMilestone } from './referral-milestone.entity';
import {
  ReferralEarning,
  EarningType,
  EarningStatus,
} from './referral-earning.entity';
import {
  ReferralPayout,
  ReferralPayoutStatus,
} from './referral-payout.entity';
import { User } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';

// ---- Client FINAL referral rules (Oct 2026, replaces the demo system) ----
// - NO cash reward for a free signup alone.
// - Referrer earns 20% of a referred user's first THREE subscription payments.
// - Referrer earns 10% of Pacten's commission on the referred user's FIRST
//   completed paid deal.
// - $25 minimum withdrawal; payouts are manual (admin-recorded), monthly.
// - No rewards on refunds / chargebacks / fraudulent referrals (reversals).
const SUBSCRIPTION_EARNING_BPS = 2000; // 20%
const DEAL_EARNING_BPS = 1000; // 10% of the platform commission
const MAX_PAID_SUBSCRIPTION_PAYMENTS = 3;
export const MIN_WITHDRAWAL_CENTS = 2500; // $25

// Legacy demo milestones — the schema/admin config remains so historical
// rows and the admin screens keep working, but milestones no longer
// generate cash earnings under the final rules.
const DEMO_MILESTONES = [
  { referralsRequired: 1, rewardCents: 1000, rewardLabel: '$10 Bonus' },
  { referralsRequired: 5, rewardCents: 5000, rewardLabel: '$50 Bonus' },
  { referralsRequired: 10, rewardCents: 10000, rewardLabel: '$100 Bonus' },
  { referralsRequired: 25, rewardCents: 0, rewardLabel: 'VIP Status' },
];

// Unambiguous alphabet (no 0/O, 1/I/L).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

@Injectable()
export class ReferralsService implements OnModuleInit {
  constructor(
    @InjectRepository(ReferralCode)
    private readonly codesRepo: Repository<ReferralCode>,
    @InjectRepository(Referral)
    private readonly referralsRepo: Repository<Referral>,
    @InjectRepository(ReferralMilestone)
    private readonly milestonesRepo: Repository<ReferralMilestone>,
    @InjectRepository(ReferralEarning)
    private readonly earningsRepo: Repository<ReferralEarning>,
    @InjectRepository(ReferralPayout)
    private readonly payoutsRepo: Repository<ReferralPayout>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly config: ConfigService,
    private readonly emails: EmailsService,
  ) {}

  async onModuleInit() {
    // Seed the (now legacy, non-paying) milestone config once so the admin
    // milestone screens keep their shape.
    for (const m of DEMO_MILESTONES) {
      const exists = await this.milestonesRepo.findOne({
        where: { referralsRequired: m.referralsRequired },
      });
      if (!exists) {
        await this.milestonesRepo.save(this.milestonesRepo.create(m));
      }
    }
  }

  private generateCode(): string {
    const bytes = randomBytes(8);
    let code = '';
    for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length];
    return code;
  }

  async getOrCreateCode(userId: string): Promise<ReferralCode> {
    let code = await this.codesRepo.findOne({ where: { userId } });
    if (!code) {
      // Retry on the (extremely unlikely) collision.
      for (let i = 0; i < 5; i++) {
        try {
          code = await this.codesRepo.save(
            this.codesRepo.create({ userId, code: this.generateCode() }),
          );
          break;
        } catch {
          code = null;
        }
      }
      if (!code) throw new BadRequestException('Could not generate code');
    }
    return code;
  }

  private referralLink(code: string): string {
    const base = this.config
      .get('FRONTEND_URL', 'http://localhost:3000')
      .replace(/\/$/, '');
    // Short link: tracks the click, then redirects to /signup?ref=CODE.
    return `${base}/r/${code}`;
  }

  /** Dashboard data for the Figma "Referral dashboard" screen (§5.6 views). */
  async getDashboard(userId: string) {
    const code = await this.getOrCreateCode(userId);
    const referrals = await this.referralsRepo.find({
      where: { referrerId: userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const total = await this.referralsRepo.count({ where: { referrerId: userId } });
    const successful = await this.referralsRepo.count({
      where: { referrerId: userId, status: ReferralStatus.SUCCESSFUL },
    });
    const allEarnings = await this.earningsRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    // Reversed earnings (refunds/chargebacks/fraud) never count in totals.
    const earnings = allEarnings.filter(
      (e) => e.status !== EarningStatus.REVERSED,
    );
    const sum = (s: EarningStatus) =>
      earnings.filter((e) => e.status === s).reduce((a, e) => a + e.amountCents, 0);
    const milestones = await this.milestonesRepo.find({
      where: { active: true },
      order: { referralsRequired: 'ASC' },
    });

    const referredIds = referrals.map((r) => r.referredUserId);
    const referredUsers =
      referredIds.length > 0
        ? await this.usersRepo
            .createQueryBuilder('u')
            .where('u.id IN (:...ids)', { ids: referredIds })
            .getMany()
        : [];
    const byId = new Map(referredUsers.map((u) => [u.id, u]));
    const earningByReferral = new Map(
      earnings.filter((e) => e.referralId).map((e) => [e.referralId, e]),
    );

    return {
      code: code.code,
      link: this.referralLink(code.code),
      clicks: code.clicks,
      minWithdrawalCents: MIN_WITHDRAWAL_CENTS,
      stats: {
        total,
        successful,
        pending: total - successful,
        availableCents: sum(EarningStatus.AVAILABLE),
        pendingCents: sum(EarningStatus.PENDING) + sum(EarningStatus.HELD),
        totalEarnedCents: earnings.reduce((a, e) => a + e.amountCents, 0),
        totalPaidCents: sum(EarningStatus.PAID),
      },
      recent: referrals.map((r) => {
        const u = byId.get(r.referredUserId);
        const name =
          [u?.firstName, u?.lastName].filter(Boolean).join(' ') ||
          u?.email ||
          'New user';
        return {
          id: r.id,
          name,
          joined: r.createdAt,
          earningsCents: earningByReferral.get(r.id)?.amountCents ?? 0,
          status: r.status,
        };
      }),
      earnings: allEarnings.slice(0, 50).map((e) => ({
        id: e.id,
        type: e.type,
        amountCents: e.amountCents,
        status: e.status,
        sourceId: e.sourceId,
        referralId: e.referralId,
        createdAt: e.createdAt,
      })),
      milestones: milestones.map((m) => ({
        id: m.id,
        referralsRequired: m.referralsRequired,
        rewardCents: m.rewardCents,
        rewardLabel: m.rewardLabel,
        achieved: successful >= m.referralsRequired,
        progress: Math.min(successful, m.referralsRequired),
      })),
    };
  }

  /** Public click tracking for /referrals/r/:code (redirect handled client-side). */
  async trackClick(code: string) {
    const record = await this.codesRepo.findOne({ where: { code } });
    if (!record) throw new NotFoundException('Invalid referral code');
    record.clicks += 1;
    await this.codesRepo.save(record);
    return { ok: true, code };
  }

  /**
   * Called from auth signup. Tracks EVERY signup (including free users)
   * for all roles. Silently ignores bad codes and self-referrals.
   * Under the final rules a signup alone creates NO earning.
   */
  async attributeSignup(
    referredUserId: string,
    code?: string,
  ): Promise<void> {
    if (!code) return;
    const record = await this.codesRepo.findOne({ where: { code } });
    if (!record || record.userId === referredUserId) return;
    const existing = await this.referralsRepo.findOne({
      where: { referredUserId },
    });
    if (existing) return;
    await this.referralsRepo.save(
      this.referralsRepo.create({
        referrerId: record.userId,
        referredUserId,
        status: ReferralStatus.PENDING,
      }),
    );
  }

  /**
   * Called when the referred user verifies their email. Under the final
   * rules verification alone is NOT a qualifying action — a referral only
   * becomes "successful" when it generates an earning (subscription
   * payment or completed paid deal). Kept as a no-op hook for auth.
   */
  async handleReferredVerified(_referredUserId: string): Promise<void> {
    return;
  }

  private async markSuccessful(referral: Referral): Promise<void> {
    if (referral.status !== ReferralStatus.SUCCESSFUL) {
      referral.status = ReferralStatus.SUCCESSFUL;
      await this.referralsRepo.save(referral);
    }
  }

  /**
   * A referred user made a successful subscription payment. The referrer
   * earns 20% of the payment — for the referred user's FIRST THREE
   * subscription payments only. Idempotent per payment (sourceId = the
   * checkout session / payment reference).
   */
  async handleSubscriptionPayment(
    referredUserId: string,
    amountCents: number,
    sourceId: string,
  ): Promise<void> {
    if (!amountCents || amountCents <= 0 || !sourceId) return;
    const referral = await this.referralsRepo.findOne({
      where: { referredUserId },
    });
    if (!referral) return;

    const dup = await this.earningsRepo.findOne({
      where: { type: EarningType.SUBSCRIPTION, sourceId },
    });
    if (dup) return;

    const priorCount = await this.earningsRepo.count({
      where: {
        referralId: referral.id,
        type: EarningType.SUBSCRIPTION,
        status: Not(EarningStatus.REVERSED),
      },
    });
    if (priorCount >= MAX_PAID_SUBSCRIPTION_PAYMENTS) return;

    const amount = Math.round(
      (amountCents * SUBSCRIPTION_EARNING_BPS) / 10000,
    );
    if (amount <= 0) return;
    await this.earningsRepo.save(
      this.earningsRepo.create({
        userId: referral.referrerId,
        referralId: referral.id,
        amountCents: amount,
        type: EarningType.SUBSCRIPTION,
        status: EarningStatus.AVAILABLE,
        sourceId,
      }),
    );
    await this.markSuccessful(referral);
  }

  /**
   * A referred user's deal completed AND was paid (a PlatformCommission
   * exists). The referrer earns 10% of Pacten's commission — on the
   * referred user's FIRST completed paid deal only.
   */
  async handleDealCompleted(
    referredUserId: string,
    dealId: string,
    commissionCents: number,
  ): Promise<void> {
    if (!commissionCents || commissionCents <= 0 || !dealId) return;
    const referral = await this.referralsRepo.findOne({
      where: { referredUserId },
    });
    if (!referral) return;

    const existing = await this.earningsRepo.findOne({
      where: {
        referralId: referral.id,
        type: EarningType.DEAL,
        status: Not(EarningStatus.REVERSED),
      },
    });
    if (existing) return; // first deal only

    const amount = Math.round((commissionCents * DEAL_EARNING_BPS) / 10000);
    if (amount <= 0) return;
    await this.earningsRepo.save(
      this.earningsRepo.create({
        userId: referral.referrerId,
        referralId: referral.id,
        amountCents: amount,
        type: EarningType.DEAL,
        status: EarningStatus.AVAILABLE,
        sourceId: dealId,
      }),
    );
    await this.markSuccessful(referral);
  }

  /**
   * Reverse every not-yet-paid earning sourced from a refunded/chargeback
   * payment (sourceId = checkout session id, payment id or deal id).
   * Reversed earnings are excluded from all balances and totals.
   */
  async reverseEarningsBySource(sourceId: string): Promise<number> {
    if (!sourceId) return 0;
    const earnings = await this.earningsRepo.find({
      where: {
        sourceId,
        status: In([
          EarningStatus.PENDING,
          EarningStatus.AVAILABLE,
          EarningStatus.HELD,
        ]),
      },
    });
    for (const e of earnings) {
      e.status = EarningStatus.REVERSED;
      e.payoutId = null;
      await this.earningsRepo.save(e);
    }
    return earnings.length;
  }

  async availableBalance(userId: string): Promise<number> {
    const earnings = await this.earningsRepo.find({
      where: { userId, status: EarningStatus.AVAILABLE },
    });
    return earnings.reduce((a, e) => a + e.amountCents, 0);
  }

  async requestPayout(userId: string, amountCents: number) {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new BadRequestException('Invalid payout amount');
    }
    const available = await this.earningsRepo.find({
      where: { userId, status: EarningStatus.AVAILABLE },
      order: { createdAt: 'ASC' },
    });
    const balance = available.reduce((a, e) => a + e.amountCents, 0);
    // Client rule: $25 minimum withdrawal.
    if (balance < MIN_WITHDRAWAL_CENTS) {
      throw new BadRequestException(
        `Minimum withdrawal is $${(MIN_WITHDRAWAL_CENTS / 100).toFixed(0)} — your available referral balance is below the minimum`,
      );
    }
    if (balance < amountCents) {
      throw new BadRequestException('Insufficient available referral balance');
    }
    const payout = await this.payoutsRepo.save(
      this.payoutsRepo.create({ userId, amountCents }),
    );
    // Hold oldest earnings first.
    let remaining = amountCents;
    for (const e of available) {
      if (remaining <= 0) break;
      const take = Math.min(e.amountCents, remaining);
      if (take === e.amountCents) {
        e.status = EarningStatus.HELD;
        e.payoutId = payout.id;
        await this.earningsRepo.save(e);
      } else {
        // Split the earning: held part + leftover available part.
        e.amountCents = e.amountCents - take;
        await this.earningsRepo.save(e);
        await this.earningsRepo.save(
          this.earningsRepo.create({
            userId: e.userId,
            referralId: e.referralId,
            milestoneId: e.milestoneId,
            sourceId: e.sourceId,
            amountCents: take,
            type: e.type,
            status: EarningStatus.HELD,
            payoutId: payout.id,
          }),
        );
      }
      remaining -= take;
    }
    // Notify the requester (transactional email).
    try {
      const user = await this.usersRepo.findOne({ where: { id: userId } });
      if (user) {
        await this.emails.sendPayoutRequested(user.email, amountCents);
      }
    } catch {
      // Email is best-effort.
    }
    return payout;
  }

  async myPayouts(userId: string) {
    return this.payoutsRepo.find({
      where: { userId },
      order: { requestedAt: 'DESC' },
    });
  }

  async adminListPayouts(status?: string) {
    const where = status ? { status: status as ReferralPayoutStatus } : {};
    const payouts = await this.payoutsRepo.find({
      where,
      order: { requestedAt: 'DESC' },
    });
    const userIds = [...new Set(payouts.map((p) => p.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepo
            .createQueryBuilder('u')
            .where('u.id IN (:...ids)', { ids: userIds })
            .getMany()
        : [];
    const byId = new Map(users.map((u) => [u.id, u]));
    return payouts.map((p) => ({
      ...p,
      userEmail: byId.get(p.userId)?.email,
    }));
  }

  /**
   * Manual admin decision on a cash payout (client rule: payouts are
   * manually approved/recorded by Admin, monthly). Approved payouts are
   * marked PAID here — the actual cash transfer happens off-platform.
   */
  async adminDecidePayout(
    id: string,
    adminId: string,
    approved: boolean,
    notes?: string,
  ) {
    const payout = await this.payoutsRepo.findOne({ where: { id } });
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== ReferralPayoutStatus.REQUESTED) {
      throw new BadRequestException('Payout already decided');
    }
    payout.status = approved
      ? ReferralPayoutStatus.PAID
      : ReferralPayoutStatus.REJECTED;
    payout.decidedById = adminId;
    payout.decidedAt = new Date();
    payout.notes = notes ?? null;
    await this.payoutsRepo.save(payout);

    const held = await this.earningsRepo.find({
      where: { payoutId: payout.id, status: EarningStatus.HELD },
    });
    for (const e of held) {
      e.status = approved ? EarningStatus.PAID : EarningStatus.AVAILABLE;
      if (!approved) e.payoutId = null;
      await this.earningsRepo.save(e);
    }

    const user = await this.usersRepo.findOne({ where: { id: payout.userId } });
    if (user) {
      await this.emails.sendPayoutDecided(user.email, payout.amountCents, approved);
    }
    return payout;
  }

  // ---- Admin: earnings visibility + fraud hold/reverse ----

  async adminListEarnings(userId?: string) {
    const where = userId ? { userId } : {};
    const earnings = await this.earningsRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 200,
    });
    const userIds = [...new Set(earnings.map((e) => e.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepo
            .createQueryBuilder('u')
            .where('u.id IN (:...ids)', { ids: userIds })
            .getMany()
        : [];
    const byId = new Map(users.map((u) => [u.id, u]));
    return earnings.map((e) => ({
      ...e,
      userEmail: byId.get(e.userId)?.email,
    }));
  }

  /** Fraud hold: freeze an earning so it cannot be withdrawn. */
  async adminHoldEarning(id: string) {
    const earning = await this.earningsRepo.findOne({ where: { id } });
    if (!earning) throw new NotFoundException('Earning not found');
    if (
      earning.status !== EarningStatus.AVAILABLE &&
      earning.status !== EarningStatus.PENDING
    ) {
      throw new BadRequestException(
        `Cannot hold an earning in ${earning.status} state`,
      );
    }
    earning.status = EarningStatus.HELD;
    earning.payoutId = null;
    return this.earningsRepo.save(earning);
  }

  /** Fraud/refund reversal: the earning stops counting anywhere. */
  async adminReverseEarning(id: string) {
    const earning = await this.earningsRepo.findOne({ where: { id } });
    if (!earning) throw new NotFoundException('Earning not found');
    if (earning.status === EarningStatus.PAID) {
      throw new BadRequestException('Earning already paid out');
    }
    if (earning.status === EarningStatus.REVERSED) return earning;
    earning.status = EarningStatus.REVERSED;
    earning.payoutId = null;
    return this.earningsRepo.save(earning);
  }

  /** Admin: list/replace the configurable milestone rewards (legacy). */
  async adminListMilestones() {
    return this.milestonesRepo.find({ order: { referralsRequired: 'ASC' } });
  }

  async adminUpsertMilestone(
    referralsRequired: number,
    rewardCents: number,
    rewardLabel: string,
    active = true,
  ) {
    if (!Number.isInteger(referralsRequired) || referralsRequired <= 0) {
      throw new BadRequestException('Invalid referralsRequired');
    }
    let m = await this.milestonesRepo.findOne({ where: { referralsRequired } });
    if (!m) m = this.milestonesRepo.create({ referralsRequired });
    m.rewardCents = rewardCents;
    m.rewardLabel = rewardLabel;
    m.active = active;
    return this.milestonesRepo.save(m);
  }
}
