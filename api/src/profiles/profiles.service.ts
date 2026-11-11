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
      [UserRole.CREATOR]: ['displayName', 'bio', 'avatarUrl', 'niches', 'languages', 'industries', 'skills', 'platforms', 'followers', 'location', 'availableNow', 'rate'],
      [UserRole.PROFESSIONAL]: ['displayName', 'title', 'bio', 'avatarUrl', 'skills', 'languages', 'industries', 'platforms', 'hourlyRate', 'location', 'availableNow', 'openToProjects', 'yearsExperience'],
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
    });
    if (!profile) throw new NotFoundException('Creator not found');
    // Public endpoint: never include the linked user row. Loading the
    // relation exposed the user's email, name, status and account
    // metadata to unauthenticated callers. The frontend uses only
    // profile.userId, which stays on the profile row itself.
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  async getPublicProfessionalProfile(id: string) {
    const profile = await this.professionalRepo.findOne({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Professional not found');
    // Same privacy rule as the creator endpoint: no user row.
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  // Lookup by USER id (not profile id): the messages thread only knows
  // the other participant's user id, while /creators/[id] and
  // /professionals/[id] are keyed by profile id. Same privacy rule as
  // the by-profile endpoints above: never include the linked user row.
  async getPublicCreatorProfileByUserId(userId: string) {
    const profile = await this.creatorRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Creator not found');
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  async getPublicProfessionalProfileByUserId(userId: string) {
    const profile = await this.professionalRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Professional not found');
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  async searchCreators(filters: { niche?: string; platform?: string; query?: string; limit?: number; offset?: number; sort?: string }) {
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

    // Default ordering is UNCHANGED: rating DESC (verified in the query
    // builder — not oldest-first). `sort` is opt-in only, e.g.
    // sort=createdAt:desc for the homepage showcase (newest first).
    // Only whitelisted columns are ever ordered on — the raw value is
    // never interpolated into the query.
    const sort = parseSort(filters.sort);
    if (sort) {
      qb.orderBy(`c.${sort.field}`, sort.direction);
      if (sort.field !== 'rating') qb.addOrderBy('c.rating', 'DESC');
    } else {
      qb.orderBy('c.rating', 'DESC');
    }
    qb.limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return qb.getMany();
  }

  async searchProfessionals(filters: { skill?: string; platform?: string; query?: string; limit?: number; offset?: number; sort?: string }) {
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

    // Same default as creators: rating DESC, unchanged. `sort` opt-in.
    const sort = parseSort(filters.sort);
    if (sort) {
      qb.orderBy(`p.${sort.field}`, sort.direction);
      if (sort.field !== 'rating') qb.addOrderBy('p.rating', 'DESC');
    } else {
      qb.orderBy('p.rating', 'DESC');
    }
    qb.limit(filters.limit || 20)
      .offset(filters.offset || 0);

    return qb.getMany();
  }
}

/**
 * Parses `sort=field:direction` (e.g. `createdAt:desc`) into a whitelisted
 * order-by. Returns null for anything missing, malformed or naming a
 * column that is not whitelisted — callers then keep their default order.
 * Direction defaults to DESC; only an explicit `asc` flips it.
 */
function parseSort(sort: string | undefined): { field: string; direction: 'ASC' | 'DESC' } | null {
  if (!sort) return null;
  const [field, dir] = sort.split(':');
  if (field !== 'createdAt' && field !== 'rating') return null;
  return {
    field,
    direction: (dir || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC',
  };
}
