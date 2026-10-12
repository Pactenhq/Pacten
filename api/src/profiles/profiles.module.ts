import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { BrandProfile } from './brand-profile.entity';
import { CreatorProfile } from './creator-profile.entity';
import { ProfessionalProfile } from './professional-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BrandProfile, CreatorProfile, ProfessionalProfile]),
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
