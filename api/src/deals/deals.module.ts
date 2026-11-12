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
import { DealsController } from './deals.controller';
import { PaymentsModule } from '../payments/payments.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

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
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
