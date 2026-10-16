import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Opportunity, OpportunityStatus } from './opportunity.entity';
import { CreateOpportunityDto } from './dto/opportunity.dto';
import { User, UserRole } from '../users/user.entity';

@Injectable()
export class OpportunitiesService {
  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunities: Repository<Opportunity>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async create(
    brandId: string,
    dto: CreateOpportunityDto,
  ): Promise<Opportunity> {
    const recipient = await this.users.findOne({
      where: { id: dto.recipientId },
    });
    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }
    if (
      recipient.role !== UserRole.CREATOR &&
      recipient.role !== UserRole.PROFESSIONAL
    ) {
      throw new ForbiddenException(
        'Direct opportunities can only be sent to creators or professionals',
      );
    }
    if (recipient.id === brandId) {
      throw new ConflictException('Cannot send an opportunity to yourself');
    }

    const existing = await this.opportunities.findOne({
      where: {
        brandId,
        recipientId: dto.recipientId,
        status: OpportunityStatus.PENDING,
      },
    });
    if (existing) {
      throw new ConflictException(
        'You already have a pending opportunity with this person',
      );
    }

    const opportunity = this.opportunities.create({
      title: dto.title,
      description: dto.description,
      budget: dto.budget,
      brandId,
      recipientId: dto.recipientId,
    });
    return this.opportunities.save(opportunity);
  }

  findSent(brandId: string): Promise<Opportunity[]> {
    return this.opportunities.find({
      where: { brandId },
      relations: { recipient: true },
      order: { createdAt: 'DESC' },
    });
  }

  findReceived(recipientId: string): Promise<Opportunity[]> {
    return this.opportunities.find({
      where: { recipientId },
      relations: { brand: true },
      order: { createdAt: 'DESC' },
    });
  }

  async respond(
    id: string,
    recipientId: string,
    action: 'accept' | 'decline',
  ): Promise<Opportunity> {
    const opportunity = await this.opportunities.findOne({ where: { id } });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    if (opportunity.recipientId !== recipientId) {
      throw new ForbiddenException(
        'Only the recipient can respond to this opportunity',
      );
    }
    if (opportunity.status !== OpportunityStatus.PENDING) {
      throw new ConflictException('This opportunity has already been answered');
    }
    opportunity.status =
      action === 'accept'
        ? OpportunityStatus.ACCEPTED
        : OpportunityStatus.DECLINED;
    return this.opportunities.save(opportunity);
  }
}
