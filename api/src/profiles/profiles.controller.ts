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
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: string,
    @Query('excludeTest') excludeTest?: string,
  ) {
    return this.profilesService.searchCreators({ niche, skill, language, industry, platform, country, city, query, limit, offset, sort, excludeTest });
  }

  // Standardized filter datasets (public, same auth as the
  // filter-options endpoints — i.e. none). Cities are per-country:
  // GET /profiles/datasets/cities?country=GB (ISO code) or
  // ?country=United%20Kingdom (name, case-insensitive).
  // Declared before the ':id' routes below so 'datasets' is never
  // captured as a profile id.
  @Get('datasets')
  getDatasets() {
    return this.profilesService.getDatasets();
  }

  @Get('datasets/cities')
  getDatasetCities(@Query('country') country?: string) {
    return this.profilesService.getDatasetCities(country);
  }

  @Get('creators/filter-options')
  getCreatorFilterOptions(@Query('country') country?: string) {
    return this.profilesService.getCreatorFilterOptions(country);
  }

  @Get('creators/for-deal')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.BRAND)
  searchCreatorsForDeal(
    @Query('limit') limit?: number,
    @Query('q') query?: string,
  ) {
    return this.profilesService.searchCreatorsForDeal(limit, query);
  }

  @Get('professionals')
  searchProfessionals(
    @Query('skill') skill?: string,
    @Query('language') language?: string,
    @Query('industry') industry?: string,
    @Query('platform') platform?: string,
    @Query('country') country?: string,
    @Query('city') city?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('sort') sort?: string,
    @Query('excludeTest') excludeTest?: string,
  ) {
    return this.profilesService.searchProfessionals({ skill, language, industry, platform, country, city, query, limit, offset, sort, excludeTest });
  }

  @Get('professionals/filter-options')
  getProfessionalFilterOptions(@Query('country') country?: string) {
    return this.profilesService.getProfessionalFilterOptions(country);
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
