import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CreateApplicationDto,
} from './dto/campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UserRole } from '../users/user.entity';
import { CampaignStatus } from './campaign.entity';
import { ApplicationStatus } from './application.entity';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Public: list open campaigns
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('niche') niche?: string,
  ) {
    return this.campaignsService.findAll({ search, niche });
  }

  // Brand: create campaign
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  create(@Request() req: any, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(req.user.id, dto);
  }

  // Brand: my campaigns
  @Get('mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  findMine(@Request() req: any) {
    return this.campaignsService.findByBrand(req.user.id);
  }

  // Creator/Professional: my applications
  @Get('applications/mine')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.PROFESSIONAL)
  findMyApplications(@Request() req: any) {
    return this.campaignsService.findMyApplications(req.user.id);
  }

  // Public: campaign detail
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  // Brand: update campaign
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, req.user.id, dto);
  }

  // Brand: delete campaign
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  remove(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.remove(id, req.user.id);
  }

  // Creator/Professional: apply to campaign
  @Post(':id/apply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.PROFESSIONAL)
  apply(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.campaignsService.apply(id, req.user, dto);
  }

  // Brand: view applications for a campaign
  @Get(':id/applications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  findApplications(@Param('id') id: string, @Request() req: any) {
    return this.campaignsService.findApplicationsForCampaign(id, req.user.id);
  }

  // Brand: accept/reject application
  @Patch('applications/:appId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  updateApplicationStatus(
    @Param('appId') appId: string,
    @Request() req: any,
    @Body('status') status: ApplicationStatus,
  ) {
    return this.campaignsService.updateApplicationStatus(
      appId,
      req.user.id,
      status,
    );
  }

  // Creator/Professional: withdraw application
  @Delete('applications/:appId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.PROFESSIONAL)
  withdraw(@Param('appId') appId: string, @Request() req: any) {
    return this.campaignsService.withdrawApplication(appId, req.user.id);
  }
}
