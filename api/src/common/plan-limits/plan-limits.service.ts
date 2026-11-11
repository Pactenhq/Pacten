import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SettingsService } from '../../settings/settings.service';
import {
  Subscription,
  SubscriptionStatus,
} from '../../subscriptions/subscription.entity';
import { SubscriptionPlan } from '../../subscriptions/subscription-plan.entity';
import { Campaign } from '../../campaigns/campaign.entity';
import { Application } from '../../campaigns/application.entity';
import { Deal } from '../../deals/deal.entity';
import { Message } from '../../messaging/message.entity';

/**
 * Free-plan caps (client final rules, Oct 2026). "Free" = the user holds
 * no active PAID subscription. Any active paid plan removes all caps.
 * Limits are env-configurable:
 *   FREE_BRAND_JOB_LIMIT   (default 1)  — total campaigns a free brand owns
 *   FREE_BRAND_HIRE_LIMIT  (default 1)  — total deals a free brand creates
 *   FREE_APPLICATION_LIMIT (default 5)  — total applications by a free
 *                                         creator/professional
 *   FREE_NEW_CONVERSATION_LIMIT (default 5) — NEW conversations a free
 *                                         user starts per calendar month.
 *                                         Replies inside an existing
 *                                         conversation are unlimited and
 *                                         never count (client-confirmed
 *                                         rule, Oct 31 2026).
 * Enforcement queries the user's CURRENT subscription state at action
 * time, so upgrades take effect immediately.
 * Limits are admin-editable on /admin/settings (M4); the settings
 * table is seeded from these env vars on first boot.
 */
@Injectable()
export class PlanLimitsService {
  constructor(
    @InjectRepository(Subscription)
    private subsRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private plansRepo: Repository<SubscriptionPlan>,
    @InjectRepository(Campaign)
    private campaignsRepo: Repository<Campaign>,
    @InjectRepository(Application)
    private applicationsRepo: Repository<Application>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
    private config: ConfigService,
    private settings: SettingsService,
  ) {}

  /**
   * Effective cap: the admin setting (DB, editable on /admin/settings)
   * wins; the env var is the fallback for installs without a settings
   * row; then the built-in default. Settings rows are seeded from the
   * env vars on first boot, so behaviour is unchanged until an admin
   * edits a value.
   */
  private cap(key: string, fallback: number): number {
    const fromSettings = this.settings.getCachedNumber(key);
    if (fromSettings !== undefined) return fromSettings;
    const raw = parseInt(this.config.get<string>(key) ?? '', 10);
    return Number.isFinite(raw) && raw >= 0 ? raw : fallback;
  }

  async isPaidUser(userId: string): Promise<boolean> {
    const sub = await this.subsRepo.findOne({
      where: { userId, status: SubscriptionStatus.ACTIVE },
    });
    if (!sub) return false;
    const plan = await this.plansRepo.findOne({
      where: { id: sub.planId },
    });
    return !!plan && plan.priceCentsMonthly > 0;
  }

  private limitError(what: string, limit: number): ForbiddenException {
    return new ForbiddenException(
      `Free plan limit reached: your free plan includes ${limit} ${what}. Upgrade to a paid plan to continue.`,
    );
  }

  async assertCanCreateCampaign(brandId: string): Promise<void> {
    if (await this.isPaidUser(brandId)) return;
    const limit = this.cap('FREE_BRAND_JOB_LIMIT', 1);
    const count = await this.campaignsRepo.count({ where: { brandId } });
    if (count >= limit) throw this.limitError('job post(s)', limit);
  }

  async assertCanCreateDeal(brandId: string): Promise<void> {
    if (await this.isPaidUser(brandId)) return;
    const limit = this.cap('FREE_BRAND_HIRE_LIMIT', 1);
    const count = await this.dealsRepo.count({ where: { brandId } });
    if (count >= limit) throw this.limitError('hire(s)', limit);
  }

  async assertCanApply(userId: string): Promise<void> {
    if (await this.isPaidUser(userId)) return;
    const limit = this.cap('FREE_APPLICATION_LIMIT', 5);
    const count = await this.applicationsRepo.count({
      where: { applicantId: userId },
    });
    if (count >= limit) throw this.limitError('application(s)', limit);
  }

  /**
   * Free-plan message cap (client-confirmed rule, Oct 31 2026): a free
   * user may START up to `limit` new conversations per calendar month.
   * A message in a conversation that already has any message is a
   * reply — unlimited, exempt, whoever started the conversation.
   * "Started" means the earliest message of the conversation overall
   * was sent by this user. Paid users bypass all caps (unchanged).
   */
  async assertCanSendMessage(
    userId: string,
    conversationId?: string,
  ): Promise<void> {
    if (await this.isPaidUser(userId)) return;
    // Reply inside an existing conversation: exempt, no counting.
    if (conversationId) {
      const existingCount = await this.messagesRepo.count({
        where: { conversationId },
      });
      if (existingCount > 0) return;
    }
    const limit = this.cap('FREE_NEW_CONVERSATION_LIMIT', 5);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    // Distinct conversations this user messaged in this month, then
    // keep only the ones they actually started (earliest message
    // overall was theirs). No raw SQL.
    const touched = await this.messagesRepo
      .createQueryBuilder('m')
      .select('DISTINCT m.conversationId', 'conversationId')
      .where('m.senderId = :userId', { userId })
      .andWhere('m.createdAt >= :monthStart', { monthStart })
      .getRawMany<{ conversationId: string }>();
    let started = 0;
    for (const row of touched) {
      const first = await this.messagesRepo.findOne({
        where: { conversationId: row.conversationId },
        order: { createdAt: 'ASC' },
      });
      if (first && first.senderId === userId) started++;
    }
    if (started >= limit) {
      throw new HttpException(
        `Free plan limit reached: your free plan includes ${limit} new conversations per month. Replies in existing conversations are unlimited. Upgrade to a paid plan to start more conversations.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
