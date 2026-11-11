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

/**
 * Stripe Connect (Express) onboarding + status.
 *
 * Grounds: Final Agreement §16 Definition of Done — "Stripe Connect
 * payment/payout flow is implemented subject to account/capability
 * availability" — and the client's 2 Nov 2026 message asking which
 * dev-side steps remain before live payouts.
 *
 * Demo mode: onboarding is NOT simulated (there is no Stripe-hosted page
 * to complete). startOnboarding reports demoMode and stores nothing;
 * getStatus reports the demo state. Live TEST mode uses the real
 * sk_test_* key from api/.env and creates real Express test accounts.
 *
 * The Stripe-hosted onboarding pages themselves cannot be completed from
 * this environment (no live browser here) — see the pack README for what
 * still needs a manual pass.
 */
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
