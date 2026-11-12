import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfilesService } from './profiles.service';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('profiles')
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyProfile(@Request() req: any) {
    return this.profilesService.getMyProfile(req.user.id, req.user.role);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateMyProfile(@Request() req: any, @Body() data: any) {
    return this.profilesService.updateMyProfile(req.user.id, req.user.role, data);
  }

  @Get('creators')
  searchCreators(
    @Query('niche') niche?: string,
    @Query('skill') skill?: string,
    @Query('language') language?: string,
    @Query('industry') industry?: string,
    @Query('platform') platform?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: string,
    @Query('excludeTest') excludeTest?: string,
  ) {
    return this.profilesService.searchCreators({ niche, skill, language, industry, platform, query, limit, offset, sort, excludeTest });
  }

  // D2 (dropdown disambiguation): brand-only creator directory WITH
  // emails. Declared BEFORE the ':id' routes below so 'for-deal' is
  // not captured as a profile id. The public /creators list stays
  // email-free (privacy); only a logged-in brand hiring a creator
  // sees emails here, so two same-named creators can be told apart.
  @Get('creators/for-deal')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.BRAND)
  searchCreatorsForDeal(@Query('limit') limit?: number) {
    return this.profilesService.searchCreatorsForDeal(limit);
  }

  @Get('professionals')
  searchProfessionals(
    @Query('skill') skill?: string,
    @Query('language') language?: string,
    @Query('industry') industry?: string,
    @Query('platform') platform?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: string,
    @Query('excludeTest') excludeTest?: string,
  ) {
    return this.profilesService.searchProfessionals({ skill, language, industry, platform, query, limit, offset, sort, excludeTest });
  }

  // Declared BEFORE the ':id' routes below: 'by-user' would otherwise
  // be captured as a profile id. Used by the messages thread's
  // "View Profile" button, which only knows the other party's user id.
  @Get('creators/by-user/:userId')
  getCreatorByUser(@Param('userId') userId: string) {
    return this.profilesService.getPublicCreatorProfileByUserId(userId);
  }

  @Get('professionals/by-user/:userId')
  getProfessionalByUser(@Param('userId') userId: string) {
    return this.profilesService.getPublicProfessionalProfileByUserId(userId);
  }

  @Get('creators/:id')
  getCreator(@Param('id') id: string) {
    return this.profilesService.getPublicCreatorProfile(id);
  }

  @Get('professionals/:id')
  getProfessional(@Param('id') id: string) {
    return this.profilesService.getPublicProfessionalProfile(id);
  }
}
