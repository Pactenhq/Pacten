import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from './campaign.entity';
import { Application, ApplicationStatus } from './application.entity';
import { User, UserRole } from '../users/user.entity';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateApplicationDto,
} from './dto/campaign.dto';
import { EmailsService } from '../emails/emails.service';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { BrandProfile } from '../profiles/brand-profile.entity';
import { In } from 'typeorm';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaigns: Repository<Campaign>,
    @InjectRepository(Application)
    private applications: Repository<Application>,
    @InjectRepository(BrandProfile)
    private brandProfiles: Repository<BrandProfile>,
    private emails: EmailsService,
    private planLimits: PlanLimitsService,
  ) {}

  /**
   * Public brand shape for campaign listings/details: the brand's
   * display name (company name when set) WITHOUT the account email —
   * public campaign pages must never expose the brand's email address.
   */
  private async attachPublicBrand(campaigns: Campaign[]): Promise<void> {
    const ids = [...new Set(campaigns.map((c) => c.brandId).filter(Boolean))];
    if (!ids.length) return;
    const profiles = await this.brandProfiles.find({
      where: { userId: In(ids) },
    });
    const byUser = new Map(profiles.map((p) => [p.userId, p]));
    for (const c of campaigns) {
      const brand: any = (c as any).brand;
      if (!brand) continue;
      const profile = byUser.get(c.brandId);
      const personName = [brand.firstName, brand.lastName]
        .filter(Boolean)
        .join(' ')
        .trim();
      (c as any).brand = {
        id: brand.id,
        firstName: brand.firstName,
        lastName: brand.lastName,
        displayName: profile?.companyName || personName || 'Brand',
      };
    }
  }

  // ---------- Campaigns ----------

  async create(brandId: string, dto: CreateCampaignDto): Promise<Campaign> {
    // Free-plan cap: free brands can post a limited number of jobs.
    await this.planLimits.assertCanCreateCampaign(brandId);
    const campaign = this.campaigns.create({
      ...dto,
      brandId,
      status: CampaignStatus.OPEN,
    });
    return this.campaigns.save(campaign);
  }

  async findAll(filters?: {
    status?: CampaignStatus;
    niche?: string;
    search?: string;
  }): Promise<Campaign[]> {
    const qb = this.campaigns
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.brand', 'brand')
      .orderBy('c.createdAt', 'DESC');

    // Only show open campaigns in public listing
    qb.where('c.status = :status', { status: CampaignStatus.OPEN });

    if (filters?.search) {
      qb.andWhere(
        '(c.title ILIKE :search OR c.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const list = await qb.getMany();
    await this.attachPublicBrand(list);
    return list;
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaigns.findOne({
      where: { id },
      relations: { brand: true, applications: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    await this.attachPublicBrand([campaign]);
    return campaign;
  }

  async findByBrand(brandId: string): Promise<Campaign[]> {
    return this.campaigns.find({
      where: { brandId },
      order: { createdAt: 'DESC' },
      relations: { applications: true },
    });
  }

  async update(
    id: string,
    brandId: string,
    dto: UpdateCampaignDto,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);
    if (campaign.brandId !== brandId) {
      throw new ForbiddenException('Not your campaign');
    }
    Object.assign(campaign, dto);
    return this.campaigns.save(campaign);
  }

  async remove(id: string, brandId: string): Promise<void> {
    const campaign = await this.findOne(id);
    if (campaign.brandId !== brandId) {
      throw new ForbiddenException('Not your campaign');
    }
    await this.campaigns.remove(campaign);
  }

  // ---------- Admin (M4: job/campaign management) ----------

  private safeCampaign(campaign: Campaign, applicationCount: number) {
    const b: any = (campaign as any).brand;
    return {
      ...campaign,
      applicationCount,
      brand: b
        ? {
            id: b.id,
            email: b.email,
            firstName: b.firstName,
            lastName: b.lastName,
            role: b.role,
          }
        : null,
    };
  }

  async adminList(opts: {
    status?: string;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const take = Math.min(Math.max(opts.take ?? 50, 1), 100);
    const skip = Math.max(opts.skip ?? 0, 0);
    const qb = this.campaigns
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.brand', 'brand')
      .orderBy('c.createdAt', 'DESC');
    if (opts.status) {
      qb.andWhere('c.status = :status', { status: opts.status });
    }
    if (opts.search) {
      qb.andWhere('(c.title ILIKE :search OR c.description ILIKE :search)', {
        search: `%${opts.search}%`,
      });
    }
    const [list, total] = await qb.take(take).skip(skip).getManyAndCount();
    const ids = list.map((c) => c.id);
    const counts =
      ids.length > 0
        ? await this.applications
            .createQueryBuilder('a')
            .select('a.campaignId', 'campaignId')
            .addSelect('COUNT(*)', 'count')
            .where('a.campaignId IN (:...ids)', { ids })
            .groupBy('a.campaignId')
            .getRawMany()
        : [];
    const countById = new Map<string, number>(
      counts.map((r) => [r.campaignId, parseInt(r.count, 10)]),
    );
    return {
      campaigns: list.map((c) =>
        this.safeCampaign(c, countById.get(c.id) ?? 0),
      ),
      total,
      take,
      skip,
    };
  }

  async adminSetStatus(
    id: string,
    status: CampaignStatus,
  ): Promise<Campaign> {
    const campaign = await this.findOne(id);
    campaign.status = status;
    return this.campaigns.save(campaign);
  }

  async adminRemove(id: string): Promise<void> {
    const campaign = await this.findOne(id);
    await this.campaigns.remove(campaign);
  }

  // ---------- Applications ----------

  async apply(
    campaignId: string,
    applicant: User,
    dto: CreateApplicationDto,
  ): Promise<Application> {
    if (
      applicant.role !== UserRole.CREATOR &&
      applicant.role !== UserRole.PROFESSIONAL
    ) {
      throw new ForbiddenException('Only creators and professionals can apply');
    }

    // Free-plan cap: free creators/professionals can apply a limited
    // number of times.
    await this.planLimits.assertCanApply(applicant.id);

    const campaign = await this.findOne(campaignId);
    if (campaign.status !== CampaignStatus.OPEN) {
      throw new ConflictException('Campaign is not open for applications');
    }

    if (campaign.brandId === applicant.id) {
      throw new ConflictException('Cannot apply to your own campaign');
    }

    const existing = await this.applications.findOne({
      where: { campaignId, applicantId: applicant.id },
    });
    if (existing) {
      throw new ConflictException('Already applied to this campaign');
    }

    const application = this.applications.create({
      ...dto,
      campaignId,
      applicantId: applicant.id,
    });
    const saved = await this.applications.save(application);

    // Transactional email (M5). Best-effort.
    try {
      await this.emails.sendApplicationReceived(
        applicant.email,
        campaign.title,
      );
    } catch {
      // Email is best-effort.
    }
    return saved;
  }

  async findApplicationsForCampaign(
    campaignId: string,
    brandId: string,
  ): Promise<Application[]> {
    const campaign = await this.findOne(campaignId);
    if (campaign.brandId !== brandId) {
      throw new ForbiddenException('Not your campaign');
    }
    return this.applications.find({
      where: { campaignId },
      relations: { applicant: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findMyApplications(userId: string): Promise<Application[]> {
    const list = await this.applications.find({
      where: { applicantId: userId },
      relations: { campaign: { brand: true } },
      order: { createdAt: 'DESC' },
    });
    // Attach the public brand shape (display name, no email) to each
    // application's campaign so the applicant sees who posted it.
    await this.attachPublicBrand(
      list.map((a) => a.campaign).filter(Boolean) as Campaign[],
    );
    return list;
  }

  async updateApplicationStatus(
    applicationId: string,
    brandId: string,
    status: ApplicationStatus,
  ): Promise<Application> {
    const application = await this.applications.findOne({
      where: { id: applicationId },
      relations: { campaign: true },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.campaign.brandId !== brandId) {
      throw new ForbiddenException('Not your campaign');
    }
    application.status = status;
    return this.applications.save(application);
  }

  async withdrawApplication(
    applicationId: string,
    userId: string,
  ): Promise<Application> {
    const application = await this.applications.findOne({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundException('Application not found');
    if (application.applicantId !== userId) {
      throw new ForbiddenException('Not your application');
    }
    application.status = ApplicationStatus.WITHDRAWN;
    return this.applications.save(application);
  }
}
