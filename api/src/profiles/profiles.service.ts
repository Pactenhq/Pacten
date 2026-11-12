import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
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
    assertUuid(userId);
    const profile = await this.creatorRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Creator not found');
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  async getPublicProfessionalProfileByUserId(userId: string) {
    assertUuid(userId);
    const profile = await this.professionalRepo.findOne({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Professional not found');
    const { user: _user, ...publicProfile } = profile as any;
    return publicProfile;
  }

  async searchCreators(filters: { niche?: string; skill?: string; language?: string; industry?: string; platform?: string; query?: string; limit?: number; offset?: number; sort?: string; excludeTest?: boolean | string }) {
    const qb = this.creatorRepo.createQueryBuilder('c')
      .where('c.availableNow = :available', { available: true });

    if (filters.niche) {
      qb.andWhere(':niche = ANY(c.niches)', { niche: filters.niche });
    }
    // Skill parity with searchProfessionals (Nov 2026): same
    // `:skill = ANY(c.skills)` clause — the creators Skills filter
    // already filters client-side, this is server-side parity only.
    if (filters.skill) {
      qb.andWhere(':skill = ANY(c.skills)', { skill: filters.skill });
    }
    // D-1: server-side language + industry filtering, mirroring the
    // skill clause above (both are text arrays on the profile). The
    // web previously filtered these client-side over the loaded page
    // only, so matches beyond page 1 were never found.
    if (filters.language) {
      qb.andWhere(':language = ANY(c.languages)', { language: filters.language });
    }
    if (filters.industry) {
      qb.andWhere(':industry = ANY(c.industries)', { industry: filters.industry });
    }
    if (filters.platform) {
      qb.andWhere(':platform = ANY(c.platforms)', { platform: filters.platform });
    }
    if (filters.query) {
      qb.andWhere('(c.displayName ILIKE :q OR c.bio ILIKE :q)', { q: `%${filters.query}%` });
    }
    // F-1 (showcase): opt-in exclusion of test/demo-domain owners.
    // Raw EXISTS subquery (not a join) so the linked user row is never
    // loaded into — or leaked by — this public response. Default OFF:
    // /creators, /professionals, search and for-deal are unchanged.
    if (isTruthy(filters.excludeTest)) {
      qb.andWhere(
        `NOT EXISTS (SELECT 1 FROM "users" "u" WHERE "u"."id" = "c"."userId" AND (LOWER("u"."email") LIKE :exTest OR LOWER("u"."email") LIKE :exExample OR LOWER("u"."email") LIKE :exDemo))`,
        { exTest: '%@test.com', exExample: '%@example.com', exDemo: '%@pacten.demo' },
      );
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

  async searchProfessionals(filters: { skill?: string; language?: string; industry?: string; platform?: string; query?: string; limit?: number; offset?: number; sort?: string; excludeTest?: boolean | string }) {
    const qb = this.professionalRepo.createQueryBuilder('p')
      .where('p.availableNow = :available', { available: true });

    if (filters.skill) {
      qb.andWhere(':skill = ANY(p.skills)', { skill: filters.skill });
    }
    // D-1: server-side language + industry filtering, mirroring skill.
    if (filters.language) {
      qb.andWhere(':language = ANY(p.languages)', { language: filters.language });
    }
    if (filters.industry) {
      qb.andWhere(':industry = ANY(p.industries)', { industry: filters.industry });
    }
    if (filters.platform) {
      qb.andWhere(':platform = ANY(p.platforms)', { platform: filters.platform });
    }
    if (filters.query) {
      qb.andWhere('(p.displayName ILIKE :q OR p.bio ILIKE :q OR p.title ILIKE :q)', { q: `%${filters.query}%` });
    }
    // F-1 (showcase): same opt-in test-domain exclusion as creators.
    if (isTruthy(filters.excludeTest)) {
      qb.andWhere(
        `NOT EXISTS (SELECT 1 FROM "users" "u" WHERE "u"."id" = "p"."userId" AND (LOWER("u"."email") LIKE :exTest OR LOWER("u"."email") LIKE :exExample OR LOWER("u"."email") LIKE :exDemo))`,
        { exTest: '%@test.com', exExample: '%@example.com', exDemo: '%@pacten.demo' },
      );
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

  // D2 (dropdown disambiguation): creator directory WITH the linked
  // user's email, for the New Deal form's creator dropdown. The public
  // /creators list deliberately omits emails (privacy — see
  // getPublicCreatorProfile); this method is only ever served behind
  // the brand-only /creators/for-deal route, so a brand hiring a
  // creator can tell two same-named creators apart. Only the fields
  // the dropdown needs are selected — no user row is ever returned
  // whole.
  async searchCreatorsForDeal(limit?: number) {
    const rows = await this.creatorRepo
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .where('c.availableNow = :available', { available: true })
      .orderBy('c.rating', 'DESC')
      .limit(Math.min(Math.max(limit || 100, 1), 100))
      .select(['c.id', 'c.userId', 'c.displayName', 'c.location', 'c.rate', 'u.email'])
      .getMany();
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      displayName: r.displayName,
      location: r.location ?? null,
      rate: r.rate ?? null,
      email: r.user?.email ?? null,
    }));
  }
}

/**
 * D-3: a non-UUID id in a by-user lookup is a client error (400), not a
 * server error — without this, Postgres rejects the uuid comparison
 * and Nest returns 500.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assertUuid(id: string): void {
  if (!id || !UUID_RE.test(id)) {
    throw new BadRequestException('Invalid id format');
  }
}

/**
 * F-1: query params arrive as strings — 'true'/'1' opt in, anything
 * else (including 'false' and absent) leaves the default behaviour.
 */
function isTruthy(v: boolean | string | undefined): boolean {
  return v === true || v === 'true' || v === '1';
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
