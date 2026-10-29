import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User, UserRole, UserStatus } from '../users/user.entity';
import { BrandProfile } from '../profiles/brand-profile.entity';
import { CreatorProfile } from '../profiles/creator-profile.entity';
import { ProfessionalProfile } from '../profiles/professional-profile.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { ReferralsService } from '../referrals/referrals.service';
import { EmailsService } from '../emails/emails.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(BrandProfile)
    private brandRepo: Repository<BrandProfile>,
    @InjectRepository(CreatorProfile)
    private creatorRepo: Repository<CreatorProfile>,
    @InjectRepository(ProfessionalProfile)
    private professionalRepo: Repository<ProfessionalProfile>,
    private jwtService: JwtService,
    private referralsService: ReferralsService,
    private emails: EmailsService,
    private config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Invalid role');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const verificationToken = randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = this.usersRepo.create({
      email: dto.email.toLowerCase(),
      passwordHash,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      status: UserStatus.PENDING_VERIFICATION,
      verificationToken,
      verificationExpiresAt,
    });
    await this.usersRepo.save(user);

    // Create role-specific profile
    if (dto.role === UserRole.BRAND) {
      await this.brandRepo.save(
        this.brandRepo.create({
          userId: user.id,
          companyName: dto.companyName || `${dto.firstName}'s Company`,
        }),
      );
    } else if (dto.role === UserRole.CREATOR) {
      await this.creatorRepo.save(
        this.creatorRepo.create({
          userId: user.id,
          displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
        }),
      );
    } else if (dto.role === UserRole.PROFESSIONAL) {
      await this.professionalRepo.save(
        this.professionalRepo.create({
          userId: user.id,
          displayName: dto.displayName || `${dto.firstName} ${dto.lastName}`,
        }),
      );
    }

    // Attribute referral signup (silently ignores bad/self codes).
    await this.referralsService.attributeSignup(user.id, dto.referralCode);

    // Transactional email (M5). Log-only until RESEND_API_KEY is set.
    const displayName = `${dto.firstName} ${dto.lastName}`.trim();
    await this.emails.sendVerificationEmail(dto.email, displayName, verificationToken);

    return {
      message: 'Account created. Please check your email to verify.',
      userId: user.id,
      // Remove in production — for development only
      verificationToken,
    };
  }

  async verifyEmail(token: string) {
    const user = await this.usersRepo.findOne({
      where: { verificationToken: token },
    });
    if (!user || user.verificationExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    user.status = UserStatus.ACTIVE;
    user.verificationToken = null;
    user.verificationExpiresAt = null;
    await this.usersRepo.save(user);
    // Qualifying action for referral attribution (demo rule).
    await this.referralsService.handleReferredVerified(user.id);
    return { message: 'Email verified successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    // Manually select passwordHash since it's select: false
    const fullUser = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: user?.id })
      .getOne();
    if (!user || !fullUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, fullUser.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Account suspended');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    return this.usersRepo.findOne({ where: { id: userId } });
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
    });
    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists, a reset link has been sent' };
    }

    const token = randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.usersRepo.save(user);

    await this.emails.sendPasswordResetEmail(user.email, token);

    // The reset link travels by email. The token is also returned outside
    // production so local/dev tests can complete the flow without an
    // inbox; it is never exposed in production.
    const isProduction = this.config.get('NODE_ENV') === 'production';
    return {
      message: 'If an account exists, a reset link has been sent',
      ...(isProduction ? {} : { resetToken: token }),
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .addSelect('u.passwordResetToken')
      .where('u.passwordResetToken = :token', { token })
      .getOne();

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await this.usersRepo.save(user);

    return { message: 'Password reset successfully' };
  }
}
