import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { StripeService } from '../payments/stripe.service';

@Injectable()
export class ConnectService {
  private readonly logger = new Logger(ConnectService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  private frontendBase(): string {
    return (
      this.config.get<string>('FRONTEND_URL') || 'http://localhost:3000'
    ).replace(/\/$/, '');
  }

  async startOnboarding(
    userId: string,
    country?: string,
  ): Promise<{
    demoMode: boolean;
    accountId: string | null;
    url: string | null;
  }> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (this.stripe.isDemo()) {
      return { demoMode: true, accountId: null, url: null };
    }

    const countryCode = (country || 'GB').toUpperCase();
    if (!/^[A-Z]{2}$/.test(countryCode)) {
      throw new BadRequestException('country must be a 2-letter ISO code');
    }

    let accountId = user.stripeAccountId;
    if (!accountId) {
      const created = await this.stripe.createExpressAccount({
        email: user.email,
        country: countryCode,
      });
      accountId = created.id;
      user.stripeAccountId = accountId;
      await this.usersRepo.save(user);
      this.logger.log(
        `Connect account ${accountId} created for user ${userId}`,
      );
    }

    const base = this.frontendBase();
    const link = await this.stripe.createAccountLink({
      accountId,
      refreshUrl: `${base}/dashboard/referrals?connect=refresh`,
      returnUrl: `${base}/dashboard/referrals?connect=return`,
    });
    return { demoMode: false, accountId, url: link.url };
  }

  async getStatus(userId: string): Promise<{
    connected: boolean;
    demoMode: boolean;
    accountId: string | null;
    detailsSubmitted: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    email: string | null;
    error?: boolean;
  }> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const empty = {
      connected: false,
      demoMode: this.stripe.isDemo(),
      accountId: null as string | null,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
      email: null as string | null,
    };
    if (!user.stripeAccountId) return empty;
    if (this.stripe.isDemo()) return { ...empty, accountId: null };

    try {
      const acct = await this.stripe.retrieveConnectAccount(
        user.stripeAccountId,
      );
      return {
        connected: acct.payoutsEnabled && acct.chargesEnabled,
        demoMode: false,
        accountId: acct.id,
        detailsSubmitted: acct.detailsSubmitted,
        chargesEnabled: acct.chargesEnabled,
        payoutsEnabled: acct.payoutsEnabled,
        email: acct.email,
      };
    } catch (e: any) {
      this.logger.warn(
        `Connect status lookup failed for ${user.stripeAccountId}: ${e?.message}`,
      );
      return { ...empty, accountId: user.stripeAccountId, error: true };
    }
  }
}
