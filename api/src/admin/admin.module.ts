import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Deal } from '../deals/deal.entity';
import { Dispute } from '../disputes/dispute.entity';
import { ReferralPayout } from '../referrals/referral-payout.entity';
import { CommissionRule } from '../payments/commission-rule.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Deal,
      Dispute,
      ReferralPayout,
      CommissionRule,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
