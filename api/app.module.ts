import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { MessagingModule } from './messaging/messaging.module';
import { DealsModule } from './deals/deals.module';
import { ContractsModule } from './contracts/contracts.module';
import { PaymentsModule } from './payments/payments.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ReferralsModule } from './referrals/referrals.module';
import { DisputesModule } from './disputes/disputes.module';
import { AdminModule } from './admin/admin.module';
import { EmailsModule } from './emails/emails.module';
import { SettingsModule } from './settings/settings.module';
import { OpportunitiesModule } from './opportunities/opportunities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'pacten'),
        password: config.get('DB_PASSWORD', 'pacten'),
        database: config.get('DB_NAME', 'pacten'),
        autoLoadEntities: true,
        // Neon (and other managed Postgres) requires TLS; local dev stays plain.
        ssl:
          config.get('DB_SSL') === 'true'
            ? { rejectUnauthorized: false }
            : false,
        // Tables auto-create when true; OFF in production by default.
        // For first deploy to Neon: boot once with TYPEORM_SYNC=true, then remove it.
        synchronize:
          config.get('TYPEORM_SYNC') === 'true' ||
          config.get('NODE_ENV') !== 'production',
      }),
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    CampaignsModule,
    MessagingModule,
    DealsModule,
    ContractsModule,
    PaymentsModule,
    SubscriptionsModule,
    ReferralsModule,
    DisputesModule,
    AdminModule,
    EmailsModule,
    SettingsModule,
    OpportunitiesModule,
  ],
})
export class AppModule {}
