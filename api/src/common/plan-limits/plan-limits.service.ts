import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
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
 *   FREE_MESSAGE_LIMIT     (default 50) — messages sent per calendar month
 *                                         by a free user (placeholder —
 *                                         the client has not given the
 *                                         final number yet)
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

  async assertCanSendMessage(userId: string): Promise<void> {
    if (await this.isPaidUser(userId)) return;
    const limit = this.cap('FREE_MESSAGE_LIMIT', 50);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const count = await this.messagesRepo.count({
      where: { senderId: userId, createdAt: MoreThanOrEqual(monthStart) },
    });
    if (count >= limit) {
      throw new HttpException(
        `Free plan limit reached: your free plan includes ${limit} messages per month. Upgrade to a paid plan to continue.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
