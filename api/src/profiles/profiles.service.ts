import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandProfile } from './brand-profile.entity';
import { CreatorProfile } from './creator-profile.entity';
import { ProfessionalProfile } from './professional-profile.entity';
import { UserRole } from '../users/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(BrandProfile)
    private brandRepo: Repository<BrandProfile>,
    @InjectRepository(CreatorProfile)
    private creatorRepo: Repository<CreatorProfile>,
    @InjectRepository(ProfessionalProfile)
    private professionalRepo: Repository<ProfessionalProfile>,
  ) {}

  async getMyProfile(userId: string, role: UserRole) {
    if (role === UserRole.BRAND) {
      return this.brandRepo.findOne({ where: { userId } });
    } else if (role === UserRole.CREATOR) {
      return this.creatorRepo.findOne({ where: { userId } });
    } else if (role === UserRole.PROFESSIONAL) {
      return this.professionalRepo.findOne({ where: { userId } });
    }
    throw new ForbiddenException('Invalid role for profile');
  }

  async updateMyProfile(userId: string, role: UserRole, data: any) {
    const allowedFields: Record<string, string[]> = {
      [UserRole.BRAND]: ['companyName', 'website', 'industry', 'description', 'logoUrl', 'location'],
      [UserRole.CREATOR]: ['displayName', 'bio', 'avatarUrl', 'niches', 'platforms', 'location', 'availableNow'],
      [UserRole.PROFESSIONAL]: ['displayName', 'title', 'bio', 'avatarUrl', 'skills', 'platforms', 'hourlyRate', 'location', 'availableNow'],
    };

    const fields = allowedFields[role];
    if (!fields) throw new ForbiddenException('Invalid role for profile');

    const filtered: any = {};
    for (const f of fields) {
      if (data[f] !== undefined) filtered[f] = data[f];
    }

    let repo: Repository<any>;
    if (role === UserRole.BRAND) repo = this.brandRepo;
    else if (role === UserRole.CREATOR) repo = this.creatorRepo;
    else repo = this.professionalRepo;

    const profile = await repo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    Object.assign(profile, filtered);
    return repo.save(profile);
  }

  async getPublicCreatorProfile(id: string) {
    const profile = await this.creatorRepo.findOne({
      where: { id },
      relations: { user: true } as any,
    });
    if (!profile) throw new NotFoundException('Creator not found');
    return profile;
  }

  async getPublicProfessionalProfile(id: string) {
    const profile = await this.professionalRepo.findOne({
      where: { id },
      relations: { user: true } as any,
    });
    if (!profile) throw new NotFoundException('Professional not found');
    return profile;
  }

  async searchCreators(filters: { niche?: string; platform?: string; query?: string; limit?: number; offset?: number }) {
    const qb = this.creatorRepo.createQueryBuilder('c')
      .where('c.availableNow = :available', { available: true });

    if (filters.niche) {
      qb.andWhere(':niche = ANY(c.niches)', { niche: filters.niche });
    }
    if (filters.platform) {
      qb.andWhere(':platform = ANY(c.platforms)', { platform: filters.platform });
    }
    if (filters.query) {
      qb.andWhere('(c.displayName ILIKE :q OR c.bio ILIKE :q)', { q: `%${filters.query}%` });
    }

    qb.orderBy('c.rating', 'DESC')
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return qb.getMany();
  }

  async searchProfessionals(filters: { skill?: string; platform?: string; query?: string; limit?: number; offset?: number }) {
    const qb = this.professionalRepo.createQueryBuilder('p')
      .where('p.availableNow = :available', { available: true });

    if (filters.skill) {
      qb.andWhere(':skill = ANY(p.skills)', { skill: filters.skill });
    }
    if (filters.platform) {
      qb.andWhere(':platform = ANY(p.platforms)', { platform: filters.platform });
    }
    if (filters.query) {
      qb.andWhere('(p.displayName ILIKE :q OR p.bio ILIKE :q OR p.title ILIKE :q)', { q: `%${filters.query}%` });
    }

    qb.orderBy('p.rating', 'DESC')
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return qb.getMany();
  }
}
