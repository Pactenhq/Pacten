import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Dispute,
  DisputeReason,
  DisputeStatus,
} from './dispute.entity';
import { Deal } from '../deals/deal.entity';
import { User, UserRole } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class DisputesService {
  constructor(
    @InjectRepository(Dispute)
    private readonly disputesRepo: Repository<Dispute>,
    @InjectRepository(Deal)
    private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly emails: EmailsService,
  ) {}

  private async getDealOrThrow(dealId: string): Promise<Deal> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  private assertParty(deal: Deal, userId: string, role?: string) {
    const isParty =
      deal.brandId === userId ||
      deal.creatorId === userId ||
      role === UserRole.ADMIN;
    if (!isParty) {
      throw new ForbiddenException('You are not a party to this deal');
    }
  }

  async fileDispute(
    userId: string,
    dealId: string,
    reason: DisputeReason,
    description: string,
  ) {
    const deal = await this.getDealOrThrow(dealId);
    if (deal.brandId !== userId && deal.creatorId !== userId) {
      throw new ForbiddenException('Only deal parties can file a dispute');
    }
    if (!description || description.trim().length < 10) {
      throw new BadRequestException(
        'Please describe the issue (at least 10 characters)',
      );
    }
    const open = await this.disputesRepo.findOne({
      where: [
        { dealId, status: DisputeStatus.OPEN },
        { dealId, status: DisputeStatus.UNDER_REVIEW },
      ],
    });
    if (open) {
      throw new BadRequestException(
        'There is already an open dispute for this deal',
      );
    }
    const dispute = await this.disputesRepo.save(
      this.disputesRepo.create({
        dealId,
        filedById: userId,
        reason,
        description: description.trim(),
      }),
    );
    const filer = await this.usersRepo.findOne({ where: { id: userId } });
    if (filer) await this.emails.sendDisputeFiled(filer.email, dispute.id, dealId);
    return dispute;
  }

  async myDisputes(userId: string) {
    return this.disputesRepo.find({
      where: [{ filedById: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async getDispute(userId: string, role: string, id: string) {
    const dispute = await this.disputesRepo.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    const deal = await this.getDealOrThrow(dispute.dealId);
    this.assertParty(deal, userId, role);
    return dispute;
  }

  async adminList(status?: string) {
    const where = status ? { status: status as DisputeStatus } : {};
    return this.disputesRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async adminResolve(
    adminId: string,
    id: string,
    outcome: 'resolved' | 'rejected',
    resolution: string,
  ) {
    const dispute = await this.disputesRepo.findOne({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (
      dispute.status === DisputeStatus.RESOLVED ||
      dispute.status === DisputeStatus.REJECTED
    ) {
      throw new BadRequestException('Dispute already closed');
    }
    if (!resolution || resolution.trim().length < 5) {
      throw new BadRequestException('Resolution notes are required');
    }
    dispute.status =
      outcome === 'resolved' ? DisputeStatus.RESOLVED : DisputeStatus.REJECTED;
    dispute.resolution = resolution.trim();
    dispute.resolvedById = adminId;
    dispute.resolvedAt = new Date();
    await this.disputesRepo.save(dispute);

    const filer = await this.usersRepo.findOne({
      where: { id: dispute.filedById },
    });
    if (filer) {
      await this.emails.sendDisputeResolved(
        filer.email,
        dispute.id,
        outcome === 'resolved',
      );
    }
    return dispute;
  }
}
