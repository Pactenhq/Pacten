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

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaigns: Repository<Campaign>,
    @InjectRepository(Application)
    private applications: Repository<Application>,
  ) {}

  // ---------- Campaigns ----------

  async create(brandId: string, dto: CreateCampaignDto): Promise<Campaign> {
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

    return qb.getMany();
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaigns.findOne({
      where: { id },
      relations: { brand: true, applications: true },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
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
    return this.applications.save(application);
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
    return this.applications.find({
      where: { applicantId: userId },
      relations: { campaign: true },
      order: { createdAt: 'DESC' },
    });
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
