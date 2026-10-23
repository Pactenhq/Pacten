import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { User } from '../users/user.entity';
import { Deal } from '../deals/deal.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { DealsModule } from '../deals/deals.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, User, Deal]), DealsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
