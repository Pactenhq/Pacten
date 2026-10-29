import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlatformSetting } from './platform-setting.entity';
import { SettingsService } from './settings.service';

@Global()
@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([PlatformSetting])],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
