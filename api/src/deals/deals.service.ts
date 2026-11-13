import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { Deal, DealStatus } from './deal.entity';
import { DealVersion } from './deal-version.entity';
import { User, UserRole } from '../users/user.entity';
import { CreatorProfile } from '../profiles/creator-profile.entity';
import { ProfessionalProfile } from '../profiles/professional-profile.entity';
import {
  Application,
  ApplicationStatus,
} from '../campaigns/application.entity';
import {
  Opportunity,
  OpportunityStatus,
} from '../opportunities/opportunity.entity';
import {
  CreateDealDto,
  UpdateDealDto,
  UpdateDealStatusDto,
} from './dto/deals.dto';
import { PayoutsService } from '../payments/payouts.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { EmailsService } from '../emails/emails.service';
import { workingDaysElapsed } from './working-days.util';

// Valid state transitions for the deal state machine
export const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  [DealStatus.PROPOSED]: [DealStatus.NEGOTIATING, DealStatus.CANCELLED],
  [DealStatus.NEGOTIATING]: [
    DealStatus.AGREED,
    DealStatus.CANCELLED,
  ],
  [DealStatus.AGREED]: [DealStatus.ACTIVE, DealStatus.CANCELLED],
  [DealStatus.ACTIVE]: [
    DealStatus.SUBMITTED,
    DealStatus.COMPLETED,
    DealStatus.DISPUTED,
    DealStatus.CANCELLED,
  ],
  [DealStatus.SUBMITTED]: [
    DealStatus.APPROVED,
    DealStatus.ACTIVE,
    DealStatus.DISPUTED,
  ],
  [DealStatus.APPROVED]: [DealStatus.COMPLETED, DealStatus.DISPUTED],
  [DealStatus.COMPLETED]: [],
  [DealStatus.CANCELLED]: [],
  [DealStatus.DISPUTED]: [DealStatus.ACTIVE, DealStatus.CANCELLED],
};

// Same 500-vs-400 class as D-3 (by-user endpoints): a non-UUID deal id
// in a :id route is a client error (400), not a server error — without
// this, Postgres rejects the uuid comparison and Nest returns 500.
// Every :id method funnels through findOne, so one check covers them all
// (GET /:id, PATCH /:id, PATCH /:id/status, POST /:id/submit|approve,
// GET /:id/versions).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertUuid(id: string): void {
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestException('Invalid id format');
  }
}

@Injectable()
export class DealsService {
  private readonly logger = new Logger(DealsService.name);

  constructor(
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(DealVersion)
    private versionsRepo: Repository<DealVersion>,
    @InjectRepository(Application)
    private applicationsRepo: Repository<Application>,
    @InjectRepository(Opportunity)
    private opportunitiesRepo: Repository<Opportunity>,
    // D2: resolving a manually typed creator id (user id or profile id).
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(CreatorProfile)
    private creatorProfilesRepo: Repository<CreatorProfile>,
    // Payee fix (Nov 12): professionals are valid deal payees too
    // (commission rules define professional tiers; m3fa expects an
    // Elite professional deal at 5%), so a professional profile id
    // must resolve the same way a creator profile id does.
    @InjectRepository(ProfessionalProfile)
    private professionalProfilesRepo: Repository<ProfessionalProfile>,
    private payoutsService: PayoutsService,
    private planLimits: PlanLimitsService,
    private emails: EmailsService,
  ) {}

  // D2: the manual-ID field accepts EITHER id a brand can plausibly
  // paste — the payee's USER id (what the dropdown sends) or the
  // payee's PROFILE id (the id in /creators/[id] or /professionals/[id]
  // URLs). Without this resolution, any id that is not a user row hit
  // the deals.creatorId foreign key and surfaced as a bare 500
  // "Internal server error". Runs FIRST so application/opportunity
  // conversion checks compare against the resolved user id too.
  // Payee fix (Nov 12): the payee may be a creator OR a professional —
  // commission rules define professional tiers and m3fa expects an
  // Elite professional deal at 5%. Only brands (and other non-payee
  // roles) are rejected here.
  private async resolveCreatorUserId(creatorId: string): Promise<string> {
    const user = await this.usersRepo.findOne({ where: { id: creatorId } });
    if (user) {
      if (
        user.role !== UserRole.CREATOR &&
        user.role !== UserRole.PROFESSIONAL
      ) {
        throw new BadRequestException(
          'The selected user is not a creator or professional',
        );
      }
      return user.id;
    }
    const profile = await this.creatorProfilesRepo.findOne({
      where: { id: creatorId },
    });
    if (profile) return profile.userId;
    const proProfile = await this.professionalProfilesRepo.findOne({
      where: { id: creatorId },
    });
    if (proProfile) return proProfile.userId;
    throw new NotFoundException(
      'Creator or professional not found — check the ID and try again',
    );
  }

  // Snapshot the deal's current terms + status as a new DealVersion.
  private async snapshot(deal: Deal, changedById: string): Promise<void> {
    const count = await this.versionsRepo.count({
      where: { dealId: deal.id },
    });
    await this.versionsRepo.save(
      this.versionsRepo.create({
        dealId: deal.id,
        version: count + 1,
        status: deal.status,
        terms: deal.terms,
        agreedBudget: deal.agreedBudget,
        deadline: deal.deadline,
        deliverables: deal.deliverables,
        changedById,
      }),
    );
  }

  async create(
    brandId: string,
    dto: CreateDealDto,
  ): Promise<Deal> {
    // D2: resolve the creator reference up front — a manually typed
    // profile id or unknown id must never reach the INSERT (FK 500).
    dto = { ...dto, creatorId: await this.resolveCreatorUserId(dto.creatorId) };

    // PRD: application-to-deal conversion — the application must exist,
    // belong to this brand's campaign and be ACCEPTED.
    let application: Application | null = null;
    if (dto.applicationId) {
      application = await this.applicationsRepo.findOne({
        where: { id: dto.applicationId },
        relations: { campaign: true },
      });
      if (!application) {
        throw new NotFoundException('Application not found');
      }
      if ((application as any).campaign?.brandId !== brandId) {
        throw new ForbiddenException('Not your application');
      }
      if (application.status === ApplicationStatus.CONVERTED_TO_DEAL) {
        throw new ConflictException(
          'This application has already been converted to a deal',
        );
      }
      if (application.status !== ApplicationStatus.ACCEPTED) {
        throw new BadRequestException(
          'Only an accepted application can be converted to a deal',
        );
      }
      if (application.applicantId !== dto.creatorId) {
        throw new BadRequestException(
          'Deal creator must be the application applicant',
        );
      }
    }

    // PRD exit criteria: a valid opportunity can progress to a deal —
    // the opportunity must be ACCEPTED, sent by this brand, addressed to
    // the deal's creator, and not already linked to a deal.
    let opportunity: Opportunity | null = null;
    if (dto.opportunityId) {
      opportunity = await this.opportunitiesRepo.findOne({
        where: { id: dto.opportunityId },
      });
      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }
      if (opportunity.brandId !== brandId) {
        throw new ForbiddenException('Not your opportunity');
      }
      if (opportunity.status !== OpportunityStatus.ACCEPTED) {
        throw new BadRequestException(
          'Only an accepted opportunity can progress to a deal',
        );
      }
      if (opportunity.recipientId !== dto.creatorId) {
        throw new BadRequestException(
          'Deal creator must be the opportunity recipient',
        );
      }
      if (opportunity.dealId) {
        throw new ConflictException(
          'This opportunity already has a deal',
        );
      }
    }

    // Free-plan cap: free brands can hire a limited number of times.
    // Every deal-creation path funnels through this service method.
    // Checked after reference validation so an invalid conversion
    // reports its 400/409 instead of a misleading quota error; the
    // cap still gates every deal that is actually created.
    await this.planLimits.assertCanCreateDeal(brandId);

    const deal = this.dealsRepo.create({
      ...dto,
      brandId,
      proposedById: brandId,
      status: DealStatus.PROPOSED,
    });

    const saved = await this.dealsRepo.save(deal);

    // Link back: opportunity -> deal, application -> CONVERTED_TO_DEAL.
    if (opportunity) {
      opportunity.dealId = saved.id;
      await this.opportunitiesRepo.save(opportunity);
    }
    if (application) {
      application.status = ApplicationStatus.CONVERTED_TO_DEAL;
      await this.applicationsRepo.save(application);
    }

    await this.snapshot(saved, brandId);
    return saved;
  }

  async findMyDeals(userId: string): Promise<Deal[]> {
    return this.dealsRepo.find({
      where: [{ brandId: userId }, { creatorId: userId }],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(dealId: string, userId: string): Promise<Deal> {
    assertUuid(dealId);
    const deal = await this.dealsRepo.findOne({
      where: { id: dealId },
    });

    if (!deal) {
      throw new NotFoundException('Deal not found');
    }

    if (deal.brandId !== userId && deal.creatorId !== userId) {
      throw new ForbiddenException('Not a party to this deal');
    }

    return deal;
  }

  // ---------- Admin (M4: deal/payment overview) ----------

  async adminList(opts: {
    status?: string;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const take = Math.min(Math.max(opts.take ?? 50, 1), 100);
    const skip = Math.max(opts.skip ?? 0, 0);
    const qb = this.dealsRepo
      .createQueryBuilder('d')
      .leftJoinAndSelect('d.brand', 'brand')
      .leftJoinAndSelect('d.creator', 'creator')
      .orderBy('d.createdAt', 'DESC');
    if (opts.status) {
      qb.andWhere('d.status = :status', { status: opts.status });
    }
    if (opts.search) {
      qb.andWhere('d.title ILIKE :search', { search: `%${opts.search}%` });
    }
    const [list, total] = await qb.take(take).skip(skip).getManyAndCount();
    const safe = (u: any) =>
      u
        ? {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
          }
        : null;
    return {
      deals: list.map((d: any) => {
        const { application, ...rest } = d;
        return {
          ...rest,
          brand: safe(d.brand),
          creator: safe(d.creator),
        };
      }),
      total,
      take,
      skip,
    };
  }

  async update(
    dealId: string,
    userId: string,
    dto: UpdateDealDto,
  ): Promise<Deal> {
    const deal = await this.findOne(dealId, userId);

    // Only allow editing in proposed/negotiating states
    if (
      deal.status !== DealStatus.PROPOSED &&
      deal.status !== DealStatus.NEGOTIATING
    ) {
      throw new BadRequestException(
        'Deal terms can only be edited while proposed or negotiating',
      );
    }

    Object.assign(deal, dto);

    // Moving back to negotiating when terms change after proposal
    if (deal.status === DealStatus.PROPOSED) {
      deal.status = DealStatus.NEGOTIATING;
    }

    const saved = await this.dealsRepo.save(deal);
    await this.snapshot(saved, userId);
    return saved;
  }

  async updateStatus(
    dealId: string,
    userId: string,
    dto: UpdateDealStatusDto,
  ): Promise<Deal> {
    const deal = await this.findOne(dealId, userId);

    const allowed = VALID_TRANSITIONS[deal.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition deal from ${deal.status} to ${dto.status}`,
      );
    }

    deal.status = dto.status;

    // TOS §6.8: (re-)entering SUBMITTED (re-)starts the 14-working-day
    // auto-completion clock — a re-submission after ACTIVE restarts it.
    if (dto.status === DealStatus.SUBMITTED) {
      deal.submittedAt = new Date();
    }

    const saved = await this.dealsRepo.save(deal);
    await this.snapshot(saved, userId);

    // M4: completing the deal releases the supported payout.
    if (dto.status === DealStatus.COMPLETED) {
      try {
        await this.payoutsService.createForDeal(deal.id);
      } catch {
        // Payout creation is best-effort here; it can be retried.
      }
    }

    return saved;
  }

  /**
   * M4: creator submits the finished work for brand approval.
   */
  async submitWork(dealId: string, userId: string): Promise<Deal> {
    const deal = await this.findOne(dealId, userId);
    if (deal.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can submit work');
    }
    return this.updateStatus(dealId, userId, {
      status: DealStatus.SUBMITTED,
    } as UpdateDealStatusDto);
  }

  /**
   * M4: brand approves the submitted work. Payout is released when the
   * deal is then marked completed.
   */
  async approveWork(dealId: string, userId: string): Promise<Deal> {
    const deal = await this.findOne(dealId, userId);
    if (deal.brandId !== userId) {
      throw new ForbiddenException('Only the brand can approve work');
    }
    return this.updateStatus(dealId, userId, {
      status: DealStatus.APPROVED,
    } as UpdateDealStatusDto);
  }

  /**
   * TOS §6.8 auto-completion: if the brand does not respond for 14
   * working days after the creator submits work, the work is
   * automatically completed and the funds approved.
   *
   * ASSUMPTION: working days = Monday–Friday; the clock starts at
   * submission (submittedAt); bank holidays are NOT excluded unless
   * the client confirms otherwise (see working-days.util.ts).
   *
   * Safety: only SUBMITTED deals are ever queried here, so
   * DISPUTED / ACTIVE / PROPOSED / CANCELLED deals are never touched.
   * Completion reuses updateStatus() (SUBMITTED → APPROVED →
   * COMPLETED), so VALID_TRANSITIONS is enforced and the payout is
   * created on COMPLETED exactly as a manual approval would — no
   * payout logic is duplicated and no Stripe API is called here
   * directly. A single-deal failure is caught, logged and skipped;
   * this method never throws because of one bad deal.
   */
  async autoCompleteStaleDeals(now: Date = new Date()): Promise<void> {
    const stale = await this.dealsRepo.find({
      where: { status: DealStatus.SUBMITTED, submittedAt: Not(IsNull()) },
    });
    for (const candidate of stale) {
      try {
        const elapsed = workingDaysElapsed(candidate.submittedAt, now);
        if (elapsed < 14) {
          this.logger.log(
            `deal ${candidate.id}: ${elapsed} working days since submission — not yet due (needs 14)`,
          );
          continue;
        }
        // Idempotency: re-check the live status — the brand may have
        // approved, disputed or sent it back since the query ran.
        const deal = await this.dealsRepo.findOne({
          where: { id: candidate.id },
        });
        if (!deal || deal.status !== DealStatus.SUBMITTED) {
          this.logger.log(
            `deal ${candidate.id}: skipped — status is now ${deal?.status ?? 'gone'}`,
          );
          continue;
        }
        await this.updateStatus(deal.id, deal.brandId, {
          status: DealStatus.APPROVED,
        } as UpdateDealStatusDto);
        const completed = await this.updateStatus(deal.id, deal.brandId, {
          status: DealStatus.COMPLETED,
        } as UpdateDealStatusDto);
        completed.autoCompletedAt = now;
        await this.dealsRepo.save(completed);
        this.logger.log(
          `deal ${deal.id}: auto-completed after ${elapsed} working days without a brand response (TOS §6.8)`,
        );
        // Notify both parties by email; no new notification type is
        // added (notifications.type is a Postgres ENUM) — email +
        // the deal-page status carry this instead.
        const subject = 'Deal automatically completed — Pacten';
        const html = `<p>The work for deal <strong>${deal.title ?? deal.id}</strong> was automatically completed: the brand did not respond within 14 working days of submission, so the work is approved and the funds released under the Platform Terms (§6.8).</p><p>You can view the deal in your dashboard.</p>`;
        await this.emails.send(deal.brand?.email ?? '', subject, html);
        await this.emails.send(deal.creator?.email ?? '', subject, html);
      } catch (e: any) {
        this.logger.error(
          `deal ${candidate.id}: auto-completion failed — ${e?.message ?? e}`,
        );
        continue;
      }
    }
  }

  // DealVersion history — only the deal's two parties can read it.
  async getVersions(dealId: string, userId: string): Promise<DealVersion[]> {
    await this.findOne(dealId, userId);
    return this.versionsRepo.find({
      where: { dealId },
      order: { version: 'ASC' },
    });
  }
}
