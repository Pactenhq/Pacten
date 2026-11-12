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
import { Deal, DealStatus } from '../deals/deal.entity';
import { PLACEHOLDER_LEGAL_WORDING } from './legal-wording';
import {
  STANDARD_AGREEMENT_TEMPLATE,
  STANDARD_TEMPLATE_VERSION,
  NOT_APPLICABLE,
  placeholderKey,
  substituteAgreementFields,
} from './standard-agreement.template';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';
import {
  AcceptContractDto,
  GenerateContractDto,
} from './dto/contracts.dto';

/** Template default shown pre-selected for the §7.2 ownership field. */
export const IP_OWNERSHIP_DEFAULT =
  'Provider retains ownership of newly created intellectual property and grants the Client a non-exclusive licence to use the paid-for deliverables for the intended purpose once paid.';

type TransactionType = 'goods' | 'services' | 'both';

const TRANSACTION_TYPE_DISPLAY: Record<TransactionType, string> = {
  goods: 'Goods',
  services: 'Services',
  both: 'Goods and Services',
};

function normalizeTransactionType(raw: unknown): TransactionType | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase();
  if (v === 'goods') return 'goods';
  if (v === 'services') return 'services';
  if (v === 'both' || v === 'goods and services') return 'both';
  return null;
}

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
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractsRepo: Repository<Contract>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Deal)
    private dealsRepo: Repository<Deal>,
    private dealsService: DealsService,
    private config: ConfigService,
    private emails: EmailsService,
    private notifications: NotificationsService,
  ) {}

  private legalWording(): string {
    return (
      this.config.get<string>('CONTRACT_LEGAL_WORDING') ||
      PLACEHOLDER_LEGAL_WORDING
    );
  }

  private displayName(u?: User | null): string {
    return (
      [u?.firstName, u?.lastName].filter(Boolean).join(' ').trim() ||
      u?.email ||
      '—'
    );
  }

  private buildTermsSnapshot(deal: any): string {
    // Older deals carry a redundant "Deal: " prefix in their stored
    // title — strip it so the snapshot (and contract title) never reads
    // "Deal: Deal: …".
    const cleanTitle = String(deal.title ?? '').replace(/^Deal:\s*/i, '');
    const budget = Number(deal.agreedBudget);
    const lines = [
      `Deal: ${cleanTitle}`,
      deal.description ? `Description: ${deal.description}` : null,
      deal.agreedBudget
        ? `Agreed budget: ${Number.isFinite(budget) ? `$${budget.toLocaleString()}` : deal.agreedBudget}`
        : null,
      deal.deadline ? `Deadline: ${deal.deadline}` : null,
      deal.deliverables ? `Deliverables: ${deal.deliverables}` : null,
      deal.terms ? `Terms: ${deal.terms}` : null,
    ].filter(Boolean);
    return lines.join('\n');
  }

  private formatBudget(raw: unknown): string {
    if (raw === undefined || raw === null || String(raw).trim() === '') {
      return '';
    }
    const n = Number(raw);
    if (Number.isFinite(n)) return `$${n.toLocaleString()}`;
    return String(raw);
  }

  private utcDate(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private utcTime(d: Date): string {
    return d.toISOString().slice(11, 19);
  }

  /**
   * Signature-block values, computed at RENDER time from the signature
   * columns — never stored in fieldValues, so a later confirmation is
   * reflected without rewriting the frozen field map.
   */
  private signatureOverlay(contract: Contract): Record<string, string> {
    const side = (
      signedAt: Date | null,
      name: string | null,
      title: string | null,
      prefix: 'PARTY_A' | 'PARTY_B',
    ): Record<string, string> => {
      if (!signedAt) {
        return {
          [`${prefix}_SIGNATORY_NAME`]: 'Pending',
          [`${prefix}_SIGNATORY_TITLE`]: 'Pending',
          [`${prefix}_SIGNATURE`]: 'Awaiting signature',
          [`${prefix}_SIGNATURE_DATE`]: 'Pending',
          [`${prefix}_SIGNATURE_TIME`]: 'Pending',
          [`${prefix}_SIGNATURE_TIME_ZONE`]: 'Pending',
        };
      }
      const at = new Date(signedAt);
      return {
        [`${prefix}_SIGNATORY_NAME`]: name ?? 'Pending',
        [`${prefix}_SIGNATORY_TITLE`]: title ?? NOT_APPLICABLE,
        [`${prefix}_SIGNATURE`]: `Electronically signed by ${name ?? 'the signatory'} (recorded acceptance via Pacten)`,
        [`${prefix}_SIGNATURE_DATE`]: this.utcDate(at),
        [`${prefix}_SIGNATURE_TIME`]: this.utcTime(at),
        [`${prefix}_SIGNATURE_TIME_ZONE`]: 'UTC',
      };
    };
    const signedDates = [contract.brandSignedAt, contract.creatorSignedAt]
      .filter(Boolean)
      .map((d) => new Date(d as Date));
    const finalDate =
      signedDates.length === 2
        ? this.utcDate(new Date(Math.max(...signedDates.map((d) => d.getTime()))))
        : 'Pending';
    return {
      ...side(
        contract.brandSignedAt,
        contract.brandSignatoryName,
        contract.brandSignatoryTitle,
        'PARTY_A',
      ),
      ...side(
        contract.creatorSignedAt,
        contract.creatorSignatoryName,
        contract.creatorSignatoryTitle,
        'PARTY_B',
      ),
      AGREEMENT_STATUS:
        contract.status === ContractStatus.DECLINED
          ? 'Declined'
          : contract.status === ContractStatus.ACCEPTED
            ? 'Signed'
            : 'Awaiting signatures',
      AGREEMENT_VERSION: contract.templateVersion ?? NOT_APPLICABLE,
      FINAL_SIGNATURE_DATE: finalDate,
      EFFECTIVE_DATE: finalDate,
    };
  }

  /**
   * Render a standard-template contract from its FROZEN snapshot +
   * frozen fieldValues + signature columns. Live deal/user records are
   * never consulted, so signed contracts are immutable.
   */
  private renderStandardAgreement(contract: Contract): string | null {
    if (
      contract.template !== 'standard' ||
      !contract.templateSnapshot
    ) {
      return null;
    }
    const values: Record<string, string> = {
      ...(contract.fieldValues ?? {}),
      ...this.signatureOverlay(contract),
    };
    return substituteAgreementFields(contract.templateSnapshot, values);
  }

  /**
   * Build the COMPLETE frozen field map for a standard contract:
   * form-entered values first, then authoritative auto-fill/prefill
   * values overwrite the system-owned keys. Blank values stay blank
   * here and render as "Not applicable" at render time.
   */
  private buildStandardFieldValues(
    contract: Contract,
    deal: Deal,
    brand: User | null,
    creator: User | null,
    form: Record<string, string>,
  ): Record<string, string> {
    const values: Record<string, string> = { ...form };
    const txType = normalizeTransactionType(
      form['GOODS_SERVICES_BOTH'],
    ) as TransactionType;
    values['AGREEMENT_ID'] = contract.id;
    values['AGREEMENT_DATE'] = this.utcDate(new Date(contract.createdAt));
    values['GOODS_SERVICES_BOTH'] = TRANSACTION_TYPE_DISPLAY[txType];
    values['TRANSACTION_REGION'] = form['TRANSACTION_REGION'] ?? '';
    values['GOVERNING_JURISDICTION'] =
      form['GOVERNING_JURISDICTION'] ?? '';
    // Parties: legal/business names, addresses, countries and contact
    // details are form-confirmed (display names are NEVER auto-filled
    // as legal names); user IDs and emails are system auto-fill.
    values['PARTY_A_USER_ID'] = brand?.id ?? '';
    values['PARTY_A_EMAIL'] = brand?.email ?? '';
    values['PARTY_B_USER_ID'] = creator?.id ?? '';
    values['PARTY_B_EMAIL'] = creator?.email ?? '';
    // Deal-derived prefill: the form value wins when the user edited it,
    // otherwise the agreed deal terms fill the field.
    values['DETAILED_DESCRIPTION'] =
      form['DETAILED_DESCRIPTION'] || String(deal.description ?? '');
    values['DELIVERABLES'] =
      form['DELIVERABLES'] || String(deal.deliverables ?? '');
    values['TOTAL_PRICE'] =
      form['TOTAL_PRICE'] || this.formatBudget(deal.agreedBudget);
    values['CURRENCY'] = form['CURRENCY'] || 'USD';
    values['COMPLETION_DATE'] =
      form['COMPLETION_DATE'] || String(deal.deadline ?? '');
    return values;
  }

  /**
   * Prefill data for the guided standard-agreement form: everything the
   * form can show without the user typing it. Legal names are NOT
   * prefilled — the form asks the user to confirm them.
   */
  async prefillFromDeal(dealId: string, userId: string) {
    const deal = await this.dealsService.findOne(dealId, userId);
    const [brand, creator] = await Promise.all([
      this.usersRepo.findOne({ where: { id: deal.brandId } }),
      this.usersRepo.findOne({ where: { id: deal.creatorId } }),
    ]);
    return {
      dealId: deal.id,
      dealTitle: deal.title,
      description: deal.description ?? null,
      agreedBudget: deal.agreedBudget ?? null,
      deadline: deal.deadline ?? null,
      deliverables: deal.deliverables ?? null,
      terms: deal.terms ?? null,
      brand: brand
        ? { id: brand.id, displayName: this.displayName(brand), email: brand.email }
        : null,
      creator: creator
        ? { id: creator.id, displayName: this.displayName(creator), email: creator.email }
        : null,
      defaults: {
        currency: 'USD',
        completionDate: deal.deadline ?? null,
        ownershipArrangement: IP_OWNERSHIP_DEFAULT,
      },
    };
  }

  /**
   * Auto-generate a contract from the agreed deal terms.
   * Idempotent: returns the existing contract if one was already generated,
   * regardless of the template requested this time.
   */
  async generateFromDeal(
    dealId: string,
    userId: string,
    dto: GenerateContractDto,
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
    if (existing) {
      const [enriched] = await this.enrich([existing], userId);
      return enriched;
    }

    const template = dto.template ?? 'simple';
    const isStandard = template === 'standard';

    // Normalize + validate guided-form values for the standard template.
    let form: Record<string, string> = {};
    if (isStandard) {
      if (dto.fieldValues !== undefined && dto.fieldValues !== null) {
        if (
          typeof dto.fieldValues !== 'object' ||
          Array.isArray(dto.fieldValues)
        ) {
          throw new BadRequestException('fieldValues must be an object');
        }
        for (const [k, v] of Object.entries(dto.fieldValues)) {
          form[placeholderKey(k)] = typeof v === 'string' ? v : String(v ?? '');
        }
      }
      const txType = normalizeTransactionType(form['GOODS_SERVICES_BOTH']);
      if (!txType) {
        throw new BadRequestException(
          'Transaction type is required: goods, services, or both',
        );
      }
      for (const key of ['PARTY_A_LEGAL_NAME', 'PARTY_B_LEGAL_NAME']) {
        if (!form[key] || form[key].trim() === '') {
          throw new BadRequestException(
            `${key === 'PARTY_A_LEGAL_NAME' ? 'Party A' : 'Party B'} legal name is required`,
          );
        }
      }
    }

    const contract = this.contractsRepo.create({
      dealId: deal.id,
      brandId: deal.brandId,
      creatorId: deal.creatorId,
      title:
        dto.title ||
        `Contract — ${String(deal.title ?? '').replace(/^Deal:\s*/i, '')}`,
      termsSnapshot: this.buildTermsSnapshot(deal),
      legalWording: isStandard
        ? STANDARD_AGREEMENT_TEMPLATE
        : this.legalWording(),
      template,
      templateVersion: isStandard ? STANDARD_TEMPLATE_VERSION : null,
      templateSnapshot: isStandard ? STANDARD_AGREEMENT_TEMPLATE : null,
      fieldValues: null,
      status: ContractStatus.SENT,
      generatedById: userId,
    });

    const saved = await this.contractsRepo.save(contract);

    if (isStandard) {
      const [brand, creator] = await Promise.all([
        this.usersRepo.findOne({ where: { id: deal.brandId } }),
        this.usersRepo.findOne({ where: { id: deal.creatorId } }),
      ]);
      saved.fieldValues = this.buildStandardFieldValues(
        saved,
        deal,
        brand,
        creator,
        form,
      );
      await this.contractsRepo.save(saved);
    }

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
    // In-app notification for the counterparty (same trigger as the email).
    await this.notifications.create({
      userId: userId === deal.brandId ? deal.creatorId : deal.brandId,
      type: NotificationType.CONTRACT_SENT,
      title: 'Contract awaiting your signature',
      body: `A contract "${saved.title}" is awaiting your signature.`,
      link: `/dashboard/contracts/${saved.id}`,
      relatedId: saved.id,
    });
    const [enriched] = await this.enrich([saved], userId);
    return enriched;
  }

  /**
   * Attach display data the contract rows/pages need: both parties'
   * names, the counterparty relative to the caller, the deal's
   * deadline, and — for standard-template contracts — the rendered
   * agreement text (from the frozen snapshot, never live records).
   * (The contracts list previously rendered literal placeholders —
   * "Client Name —", "Deadline -" — for every row.)
   */
  private async enrich(
    contracts: Contract[],
    userId: string,
  ): Promise<Contract[]> {
    for (const c of contracts) {
      const [brand, creator, deal] = await Promise.all([
        this.usersRepo.findOne({ where: { id: c.brandId } }),
        this.usersRepo.findOne({ where: { id: c.creatorId } }),
        this.dealsRepo.findOne({ where: { id: c.dealId } }),
      ]);
      (c as any).brandName = this.displayName(brand);
      (c as any).creatorName = this.displayName(creator);
      (c as any).counterpartyName =
        c.brandId === userId
          ? this.displayName(creator)
          : this.displayName(brand);
      (c as any).dealDeadline = deal?.deadline ?? null;
      (c as any).dealTitle = deal?.title ?? null;
      c.renderedAgreement = this.renderStandardAgreement(c);
    }
    return contracts;
  }

  async findMine(userId: string): Promise<Contract[]> {
    const list = await this.contractsRepo.find({
      where: [{ brandId: userId }, { creatorId: userId }],
      order: { createdAt: 'DESC' },
    });
    return this.enrich(list, userId);
  }

  async findOne(contractId: string, userId: string): Promise<Contract> {
    assertUuid(contractId);
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
    const [enriched] = await this.enrich([contract], userId);
    return enriched;
  }

  /**
   * Two-signature confirmation (M5): BOTH parties must actively confirm
   * they read and agreed, each with name + title + date/time recorded.
   * Either party may confirm first. The contract stays SENT (and the
   * deal stays AGREED) until the SECOND confirmation, which marks the
   * contract ACCEPTED and activates the deal. Applies to the template
   * and simple contract paths alike.
   */
  async accept(
    contractId: string,
    userId: string,
    dto: AcceptContractDto,
  ): Promise<Contract> {
    const contract = await this.findOne(contractId, userId);

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Only a sent contract can be accepted',
      );
    }

    const isBrand = contract.brandId === userId;
    const alreadySigned = isBrand
      ? contract.brandSignedAt
      : contract.creatorSignedAt;
    if (alreadySigned) {
      throw new BadRequestException(
        'You have already confirmed this contract',
      );
    }

    const me = await this.usersRepo.findOne({ where: { id: userId } });
    const signatoryName =
      dto.signatoryName?.trim() || this.displayName(me);
    const signatoryTitle = dto.signatoryTitle?.trim() || null;
    const now = new Date();

    if (isBrand) {
      contract.brandSignedAt = now;
      contract.brandSignatoryName = signatoryName;
      contract.brandSignatoryTitle = signatoryTitle;
    } else {
      contract.creatorSignedAt = now;
      contract.creatorSignatoryName = signatoryName;
      contract.creatorSignatoryTitle = signatoryTitle;
    }

    const bothSigned = Boolean(
      contract.brandSignedAt && contract.creatorSignedAt,
    );
    const otherId = isBrand ? contract.creatorId : contract.brandId;

    if (bothSigned) {
      contract.status = ContractStatus.ACCEPTED;
      contract.acceptedById = userId;
      contract.acceptedAt = now;
    }

    const saved = await this.contractsRepo.save(contract);

    // Notify the other party (transactional email): on the first
    // confirmation the pending signer is told a signature is waiting;
    // on full signing the other party is told the contract is signed.
    try {
      const other = await this.usersRepo.findOne({
        where: { id: otherId },
      });
      if (other && other.id !== userId) {
        if (bothSigned) {
          await this.emails.sendContractAccepted(other.email, saved.title);
        } else {
          await this.emails.sendContractAwaitingSignature(
            other.email,
            saved.title,
            signatoryName,
          );
        }
      }
    } catch {
      // Email is best-effort.
    }
    // In-app notification for the other party (same trigger as the email).
    if (otherId !== userId) {
      if (bothSigned) {
        await this.notifications.create({
          userId: otherId,
          type: NotificationType.CONTRACT_ACCEPTED,
          title: 'Contract signed',
          body: `The contract "${saved.title}" has been signed by both parties. The deal is now active.`,
          link: `/dashboard/contracts/${saved.id}`,
          relatedId: saved.id,
        });
      } else {
        await this.notifications.create({
          userId: otherId,
          type: NotificationType.CONTRACT_AWAITING_SIGNATURE,
          title: 'Signature needed',
          body: `${signatoryName} has confirmed the contract "${saved.title}". Your confirmation is still needed.`,
          link: `/dashboard/contracts/${saved.id}`,
          relatedId: saved.id,
        });
      }
    }

    // Only the SECOND confirmation kicks the deal into active.
    if (bothSigned) {
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
    }

    const [enriched] = await this.enrich([saved], userId);
    return enriched;
  }

  /**
   * Decline: EITHER party may decline while the contract is sent
   * (including the generating party). The other party is notified.
   */
  async decline(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.findOne(contractId, userId);

    if (contract.status !== ContractStatus.SENT) {
      throw new BadRequestException(
        'Only a sent contract can be declined',
      );
    }

    contract.status = ContractStatus.DECLINED;
    const saved = await this.contractsRepo.save(contract);

    // Notify the other party (transactional email).
    try {
      const otherId =
        userId === contract.brandId
          ? contract.creatorId
          : contract.brandId;
      const other = await this.usersRepo.findOne({
        where: { id: otherId },
      });
      if (other && other.id !== userId) {
        await this.emails.sendContractDeclined(other.email, saved.title);
      }
    } catch {
      // Email is best-effort.
    }
    // In-app notification for the other party (same trigger as the email).
    const declineOtherId =
      userId === contract.brandId ? contract.creatorId : contract.brandId;
    if (declineOtherId !== userId) {
      await this.notifications.create({
        userId: declineOtherId,
        type: NotificationType.CONTRACT_DECLINED,
        title: 'Contract declined',
        body: `The contract "${saved.title}" was declined by the other party.`,
        link: `/dashboard/contracts/${saved.id}`,
        relatedId: saved.id,
      });
    }

    const [enriched] = await this.enrich([saved], userId);
    return enriched;
  }
}
