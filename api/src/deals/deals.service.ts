import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStatus } from './deal.entity';
import { DealVersion } from './deal-version.entity';
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

// Valid state transitions for the deal state machine
const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
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

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    @InjectRepository(DealVersion)
    private versionsRepo: Repository<DealVersion>,
    @InjectRepository(Application)
    private applicationsRepo: Repository<Application>,
    @InjectRepository(Opportunity)
    private opportunitiesRepo: Repository<Opportunity>,
    private payoutsService: PayoutsService,
    private planLimits: PlanLimitsService,
  ) {}

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

  // DealVersion history — only the deal's two parties can read it.
  async getVersions(dealId: string, userId: string): Promise<DealVersion[]> {
    await this.findOne(dealId, userId);
    return this.versionsRepo.find({
      where: { dealId },
      order: { version: 'ASC' },
    });
  }
}
