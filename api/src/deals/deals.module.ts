import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deal } from './deal.entity';
import { DealVersion } from './deal-version.entity';
import { Application } from '../campaigns/application.entity';
import { Opportunity } from '../opportunities/opportunity.entity';
import { DealsService } from './deals.service';
import { DealsController } from './deals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, DealVersion, Application, Opportunity]),
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
