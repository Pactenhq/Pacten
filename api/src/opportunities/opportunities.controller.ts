import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import {
  CreateOpportunityDto,
  RespondOpportunityDto,
} from './dto/opportunity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UserRole } from '../users/user.entity';

@Controller('opportunities')
export class OpportunitiesController {
  constructor(
    private readonly opportunitiesService: OpportunitiesService,
  ) {}

  // Brand: send a direct opportunity to a creator/professional
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  create(@Request() req: any, @Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(req.user.id, dto);
  }

  // Brand: opportunities I sent
  @Get('sent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BRAND)
  findSent(@Request() req: any) {
    return this.opportunitiesService.findSent(req.user.id);
  }

  // Creator/Professional: opportunities I received
  @Get('received')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.PROFESSIONAL)
  findReceived(@Request() req: any) {
    return this.opportunitiesService.findReceived(req.user.id);
  }

  // Creator/Professional: accept or decline
  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR, UserRole.PROFESSIONAL)
  respond(
    @Param('id') id: string,
    @Request() req: any,
    @Body() dto: RespondOpportunityDto,
  ) {
    return this.opportunitiesService.respond(id, req.user.id, dto.action);
  }
}
