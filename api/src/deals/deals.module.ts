import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { DealVersion } from './deal-version.entity';
import { Application } from '../campaigns/application.entity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { User } from '../users/user.entity';
import { CreatorProfile } from '../profiles/creator-profile.entity';
import { ProfessionalProfile } from '../profiles/professional-profile.entity';
import { DealsService } from './deals.service';
import { DealsAutoCompleteService } from './deals-auto-complete.service';
import { DealsController } from './deals.controller';
import { PaymentsModule } from '../payments/payments.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Deal,
      DealVersion,
      Application,
      Opportunity,
      // D2: resolving a manually typed creator id needs the user row
      // (user id) and the creator-profile row (profile id).
      User,
      CreatorProfile,
      // Payee fix (Nov 12): professional profile ids resolve too.
      ProfessionalProfile,
    ]),
    PaymentsModule,
    PlanLimitsModule,
    // EmailsModule is @Global, so this import is redundant but explicit:
    // DealsService sends the TOS §6.8 auto-completion emails via it.
    EmailsModule,
  ],
  controllers: [DealsController],
  providers: [DealsService, DealsAutoCompleteService],
  exports: [DealsService],
})
export class DealsModule {}
