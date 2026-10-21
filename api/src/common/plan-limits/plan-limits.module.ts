import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PlanLimitsService } from './plan-limits.service';
import { Subscription } from '../../subscriptions/subscription.entity';
import { SubscriptionPlan } from '../../subscriptions/subscription-plan.entity';
import { Campaign } from '../../campaigns/campaign.entity';
import { Application } from '../../campaigns/application.entity';
import { Deal } from '../../deals/deal.entity';
import { Message } from '../../messaging/message.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      Campaign,
      Application,
      Deal,
      Message,
    ]),
  ],
  providers: [PlanLimitsService],
  exports: [PlanLimitsService],
})
export class PlanLimitsModule {}
