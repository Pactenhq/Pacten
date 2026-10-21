import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ReferralCode } from './referral-code.entity';
import { Referral } from './referral.entity';
import { ReferralMilestone } from './referral-milestone.entity';
import { ReferralEarning } from './referral-earning.entity';
import { ReferralPayout } from './referral-payout.entity';
import { User } from '../users/user.entity';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ReferralCode,
      Referral,
      ReferralMilestone,
      ReferralEarning,
      ReferralPayout,
      User,
    ]),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
