import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PaymentsModule } from '../payments/payments.module';
import { ConnectService } from './connect.service';
import { ConnectController } from './connect.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    // StripeService lives here; no cycle (nothing in PaymentsModule
    // imports ConnectModule).
    PaymentsModule,
  ],
  controllers: [ConnectController],
  providers: [ConnectService],
  exports: [ConnectService],
})
export class ConnectModule {}
