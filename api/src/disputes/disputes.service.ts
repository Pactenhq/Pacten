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
import { Deal, DealStatus } from '../deals/deal.entity';
import { VALID_TRANSITIONS } from '../deals/deals.service';
import { User, UserRole } from '../users/user.entity';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

/**
 * M-1: a non-UUID id in a :id route is a client error (400), not a
 * server error — without this, Postgres rejects the uuid comparison
 * and Nest returns 500. Same guard class as D-3 (deals, profiles).
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertUuid(id: string): void {
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestException('Invalid id format');
  }
}

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
    private readonly notifications: NotificationsService,
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
    // D-2: filing moves the deal to DISPUTED — but only where the
    // backend state machine allows it (ACTIVE / SUBMITTED / APPROVED
    // per VALID_TRANSITIONS, which is NOT changed here). A deal still
    // in PROPOSED / NEGOTIATING / AGREED keeps its status: filing is
    // not rejected, matching the existing suite that files on a freshly
    // created (PROPOSED) deal — the dispute is recorded either way.
    if ((VALID_TRANSITIONS[deal.status] || []).includes(DealStatus.DISPUTED)) {
      deal.status = DealStatus.DISPUTED;
      await this.dealsRepo.save(deal);
    }
    const filer = await this.usersRepo.findOne({ where: { id: userId } });
    if (filer) await this.emails.sendDisputeFiled(filer.email, dispute.id, dealId);
    // In-app notification for the filer (same trigger as the email).
    await this.notifications.create({
      userId,
      type: NotificationType.DISPUTE_FILED,
      title: 'Dispute filed',
      body: `Your dispute for deal ${dealId.slice(0, 8)} was filed and is now open.`,
      link: `/dashboard/disputes/${dispute.id}`,
      relatedId: dispute.id,
    });
    return dispute;
  }

  async myDisputes(userId: string) {
    // Both parties to a deal see its disputes, not only the filer:
    // the filer is always a party (enforced in fileDispute), so joining
    // the deal covers filed-by-me plus filed-by-the-other-party.
    return this.disputesRepo
      .createQueryBuilder('dispute')
      .innerJoin('dispute.deal', 'deal')
      .where('deal.brandId = :userId OR deal.creatorId = :userId', { userId })
      .orderBy('dispute.createdAt', 'DESC')
      .getMany();
  }

  async getDispute(userId: string, role: string, id: string) {
    assertUuid(id);
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
    assertUuid(id);
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
    // In-app notification for the filer (same trigger as the email).
    await this.notifications.create({
      userId: dispute.filedById,
      type: NotificationType.DISPUTE_RESOLVED,
      title: outcome === 'resolved' ? 'Dispute resolved' : 'Dispute closed',
      body: `Your dispute (ref ${dispute.id.slice(0, 8)}) has been ${outcome === 'resolved' ? 'resolved' : 'closed'} by our team.`,
      link: `/dashboard/disputes/${dispute.id}`,
      relatedId: dispute.id,
    });
    return dispute;
  }
}
