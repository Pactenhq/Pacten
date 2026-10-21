import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Contract, ContractStatus } from './contract.entity';
import { User } from '../users/user.entity';
import { DealsService } from '../deals/deals.service';
import { DealStatus } from '../deals/deal.entity';
import { PLACEHOLDER_LEGAL_WORDING } from './legal-wording';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepo: Repository<Contract>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private dealsService: DealsService,
    private config: ConfigService,
    private emails: EmailsService,
  ) {}

  private legalWording(): string {
    return (
      this.config.get<string>('CONTRACT_LEGAL_WORDING') ||
      PLACEHOLDER_LEGAL_WORDING
    );
  }

  private buildTermsSnapshot(deal: any): string {
    const lines = [
      `Deal: ${deal.title}`,
      deal.description ? `Description: ${deal.description}` : null,
      deal.agreedBudget ? `Agreed budget: ${deal.agreedBudget}` : null,
      deal.deadline ? `Deadline: ${deal.deadline}` : null,
      deal.deliverables ? `Deliverables: ${deal.deliverables}` : null,
      deal.terms ? `Terms: ${deal.terms}` : null,
    ].filter(Boolean);
    return lines.join('\n');
  }

  /**
   * Auto-generate a contract from the agreed deal terms.
   * Idempotent: returns the existing contract if one was already generated.
   */
  async generateFromDeal(
    dealId: string,
    userId: string,
    title?: string,
  ): Promise<Contract> {
    const deal = await this.dealsService.findOne(dealId, userId);

    if (
      deal.status !== DealStatus.AGREED &&
      deal.status !== DealStatus.ACTIVE
    ) {
      throw new BadRequestException(
        'A contract can only be generated once the deal is agreed',
      );
    }

    const existing = await this.contractsRepo.findOne({
      where: { dealId },
    });
    if (existing) return existing;

    const contract = this.contractsRepo.create({
      dealId: deal.id,
      brandId: deal.brandId,
      creatorId: deal.creatorId,
      title: title || `Contract — ${deal.title}`,
      termsSnapshot: this.buildTermsSnapshot(deal),
      legalWording: this.legalWording(),
      status: ContractStatus.SENT,
      generatedById: userId,
    });

    const saved = await this.contractsRepo.save(contract);

    // Notify the other party (M5 transactional email).
    try {
      const recipientId =
        userId === deal.brandId ? deal.creatorId : deal.brandId;
      const recipient = await this.usersRepo.findOne({
        where: { id: recipientId },
      });
      if (recipient) {
        await this.emails.sendContractSent(
          recipient.email,
          saved.title,
          saved.id,
        );
      }
    } catch {
      // Email is best-effort.
    }
    return saved;
  }

  async findMine(userId: string): Promise<Contract[]> {
    return this.contractsRepo.find({
      where: [{ brandId: userId }, { creatorId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.contractsRepo.findOne({
      where: { id: contractId },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    if (
      contract.brandId !== userId &&
      contract.creatorId !== userId
    ) {
      throw new ForbiddenException('Not a party to this contract');
    }
    return contract;
  }

  async accept(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.findOne(contractId, userId);

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Only a sent contract can be accepted',
      );
    }
    if (contract.generatedById === userId) {
      throw new BadRequestException(
        'The generating party cannot accept its own contract',
      );
    }

    contract.status = ContractStatus.ACCEPTED;
    contract.acceptedById = userId;
    contract.acceptedAt = new Date();
    const saved = await this.contractsRepo.save(contract);

    // Notify the generating party (M5 transactional email).
    try {
      const other = await this.usersRepo.findOne({
        where: { id: contract.generatedById },
      });
      if (other && other.id !== userId) {
        await this.emails.sendContractAccepted(other.email, saved.title);
      }
    } catch {
      // Email is best-effort.
    }

    // Accepting the contract kicks the deal into active.
    try {
      const deal = await this.dealsService.findOne(
        contract.dealId,
        userId,
      );
      if (deal.status === DealStatus.AGREED) {
        await this.dealsService.updateStatus(contract.dealId, userId, {
          status: DealStatus.ACTIVE,
        } as any);
      }
    } catch {
      // Deal transition is best-effort; the acceptance itself stands.
    }

    return saved;
  }

  async decline(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.findOne(contractId, userId);

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Only a sent contract can be declined',
      );
    }
    if (contract.generatedById === userId) {
      throw new BadRequestException(
        'The generating party cannot decline its own contract',
      );
    }

    contract.status = ContractStatus.DECLINED;
    return this.contractsRepo.save(contract);
  }
}
