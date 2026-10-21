import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { PaymentEvent } from './payment-event.entity';
import { CommissionRule } from './commission-rule.entity';
import { PlatformCommission } from './platform-commission.entity';
import { Payout } from './payout.entity';
import { Deal } from '../deals/deal.entity';
import { User } from '../users/user.entity';
import { Subscription } from '../subscriptions/subscription.entity';
import { SubscriptionPlan } from '../subscriptions/subscription-plan.entity';
import { ReferralsModule } from '../referrals/referrals.module';
import { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';
import { PayoutsService } from './payouts.service';
import { PaymentsController } from './payments.controller';
import { PaymentsWebhookController } from './payments-webhook.controller';

@Module({
  imports: [
    ReferralsModule,
    TypeOrmModule.forFeature([
      Payment,
      PaymentEvent,
      CommissionRule,
      PlatformCommission,
      Payout,
      Deal,
      User,
      Subscription,
      SubscriptionPlan,
    ]),
  ],
  controllers: [PaymentsController, PaymentsWebhookController],
  providers: [StripeService, PaymentsService, PayoutsService],
  exports: [StripeService, PaymentsService, PayoutsService],
})
export class PaymentsModule {}
