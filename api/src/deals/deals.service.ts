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

// Valid state transitions for the deal state machine
const VALID_TRANSITIONS: Record<DealStatus, DealStatus[]> = {
  [DealStatus.PROPOSED]: [DealStatus.NEGOTIATING, DealStatus.CANCELLED],
  [DealStatus.NEGOTIATING]: [
    DealStatus.AGREED,
    DealStatus.CANCELLED,
  ],
  [DealStatus.AGREED]: [DealStatus.ACTIVE, DealStatus.CANCELLED],
  [DealStatus.ACTIVE]: [
    DealStatus.COMPLETED,
    DealStatus.DISPUTED,
    DealStatus.CANCELLED,
  ],
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
    return saved;
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
