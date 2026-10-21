import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { DealVersion } from './deal-version.entity';
import { Application } from '../campaigns/application.entity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';
import { PaymentsModule } from '../payments/payments.module';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, DealVersion, Application, Opportunity]),
    PaymentsModule,
    PlanLimitsModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
