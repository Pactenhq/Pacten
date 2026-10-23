import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from './campaign.entity';
import { Application } from './application.entity';
import { BrandProfile } from '../profiles/brand-profile.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { PlanLimitsModule } from '../common/plan-limits/plan-limits.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Application, BrandProfile]),
    PlanLimitsModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
