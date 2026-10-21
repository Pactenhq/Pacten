import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from './contract.entity';
import { User } from '../users/user.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { DealsModule } from '../deals/deals.module';

@Module({
  imports: [TypeOrmModule.forFeature([Contract, User]), DealsModule],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [ContractsService],
})
export class ContractsModule {}
