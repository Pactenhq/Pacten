import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { Deal } from '../deals/deal.entity';
import { Dispute, DisputeStatus } from '../disputes/dispute.entity';
import {
  ReferralPayout,
  ReferralPayoutStatus,
} from '../referrals/referral-payout.entity';
import { CommissionRule } from '../payments/commission-rule.entity';

// Dev/demo admin. Only seeded when none exists and NOT in production.
const DEMO_ADMIN_EMAIL = 'admin@pacten.demo';
const DEMO_ADMIN_PASSWORD = 'AdminPass123';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Deal)
    private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(Dispute)
    private readonly disputesRepo: Repository<Dispute>,
    @InjectRepository(ReferralPayout)
    private readonly payoutsRepo: Repository<ReferralPayout>,
    @InjectRepository(CommissionRule)
    private readonly rulesRepo: Repository<CommissionRule>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.bootstrapAdminFromEnv();
    if (this.config.get('NODE_ENV') === 'production') return;
    // Keyed by the demo email (not "any admin"): the env bootstrap admin
    // must not suppress the dev demo admin, or dev/test logins break.
    const existing = await this.usersRepo.findOne({
      where: { email: DEMO_ADMIN_EMAIL },
    });
    if (existing) return;
    const passwordHash = await bcrypt.hash(DEMO_ADMIN_PASSWORD, 12);
    await this.usersRepo.save(
      this.usersRepo.create({
        email: DEMO_ADMIN_EMAIL,
        passwordHash,
        role: UserRole.ADMIN,
        firstName: 'Pacten',
        lastName: 'Admin',
        status: UserStatus.ACTIVE,
      }),
    );
  }

  /**
   * One-time platform admin creation from env vars (staging/production).
   * Set ADMIN_EMAIL + ADMIN_PASSWORD (min 8 chars), boot once, verify
   * login, then REMOVE ADMIN_PASSWORD. The password is never logged.
   * Skips silently when vars are absent; never escalates an existing
   * non-admin user and never overwrites an existing account.
   */
  private async bootstrapAdminFromEnv() {
    const email = this.config.get('ADMIN_EMAIL');
    const password = this.config.get('ADMIN_PASSWORD');
    if (!email || !password) return;
    if (password.length < 8) {
      this.logger.warn('ADMIN_PASSWORD too short — admin bootstrap skipped.');
      return;
    }
    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      if (existing.role !== UserRole.ADMIN) {
        this.logger.warn(
          `ADMIN_EMAIL ${email} already exists as a non-admin — bootstrap skipped.`,
        );
      }
      return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await this.usersRepo.save(
      this.usersRepo.create({
        email,
        passwordHash,
        role: UserRole.ADMIN,
        firstName: 'Pacten',
        lastName: 'Admin',
        status: UserStatus.ACTIVE,
      }),
    );
    this.logger.log(
      `Admin account created for ${email} — remove ADMIN_PASSWORD now.`,
    );
  }

  async stats() {
    const usersByRole = await this.usersRepo
      .createQueryBuilder('u')
      .select('u.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('u.role')
      .getRawMany();
    const [deals, openDisputes, pendingPayouts, users] = await Promise.all([
      this.dealsRepo.count(),
      this.disputesRepo.count({
        where: [{ status: DisputeStatus.OPEN }, { status: DisputeStatus.UNDER_REVIEW }],
      }),
      this.payoutsRepo.count({
        where: { status: ReferralPayoutStatus.REQUESTED },
      }),
      this.usersRepo.count(),
    ]);
    return { users, usersByRole, deals, openDisputes, pendingPayouts };
  }

  /** Platform settings: commission rules (rates the payment flow reads). */
  async listCommissionRules() {
    return this.rulesRepo.find({ order: { role: 'ASC', tier: 'ASC' } });
  }

  async updateCommissionRule(id: string, rateBasisPoints: number) {
    if (!Number.isInteger(rateBasisPoints) || rateBasisPoints < 0 || rateBasisPoints > 10000) {
      throw new BadRequestException(
        'rateBasisPoints must be a whole number between 0 and 10000 (0–100%)',
      );
    }
    const rule = await this.rulesRepo.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Commission rule not found');
    rule.rateBasisPoints = rateBasisPoints;
    return this.rulesRepo.save(rule);
  }

  async listUsers(opts: {
    role?: string;
    status?: string;
    search?: string;
    take?: number;
    skip?: number;
  }) {
    const qb = this.usersRepo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (opts.role) qb.andWhere('u.role = :role', { role: opts.role });
    if (opts.status) qb.andWhere('u.status = :status', { status: opts.status });
    if (opts.search) {
      qb.andWhere(
        '(u.email ILIKE :s OR u.firstName ILIKE :s OR u.lastName ILIKE :s)',
        { s: `%${opts.search}%` },
      );
    }
    const take = Math.min(opts.take || 25, 100);
    qb.take(take).skip(opts.skip || 0);
    const [users, total] = await qb.getManyAndCount();
    // Never leak hashes/tokens.
    const safe = users.map(
      ({ passwordHash, verificationToken, ...rest }) => rest,
    );
    return { users: safe, total, take, skip: opts.skip || 0 };
  }

  async setUserStatus(id: string, status: UserStatus) {
    if (![UserStatus.ACTIVE, UserStatus.SUSPENDED].includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Cannot change another admin');
    }
    user.status = status;
    await this.usersRepo.save(user);
    const { passwordHash, verificationToken, ...safe } = user as any;
    return safe;
  }
}
