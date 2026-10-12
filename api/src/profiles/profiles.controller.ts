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
    @Query('platform') platform?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.profilesService.searchCreators({ niche, platform, query, limit, offset });
  }

  @Get('professionals')
  searchProfessionals(
    @Query('skill') skill?: string,
    @Query('platform') platform?: string,
    @Query('q') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.profilesService.searchProfessionals({ skill, platform, query, limit, offset });
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
