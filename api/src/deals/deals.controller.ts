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
import { DealsService } from './deals.service';
import {
  CreateDealDto,
  UpdateDealDto,
  UpdateDealStatusDto,
} from './dto/deals.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../users/user.entity';

@Controller('deals')
@UseGuards(JwtAuthGuard)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.BRAND)
  create(@Request() req: any, @Body() dto: CreateDealDto) {
    return this.dealsService.create(req.user.id, dto);
  }

  @Get()
  findMyDeals(@Request() req: any) {
    return this.dealsService.findMyDeals(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.dealsService.findOne(id, req.user.id);
  }

  @Get(':id/versions')
  versions(@Request() req: any, @Param('id') id: string) {
    return this.dealsService.getVersions(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.dealsService.update(id, req.user.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDealStatusDto,
  ) {
    return this.dealsService.updateStatus(id, req.user.id, dto);
  }

  @Post(':id/submit')
  submitWork(@Request() req: any, @Param('id') id: string) {
    return this.dealsService.submitWork(id, req.user.id);
  }

  @Post(':id/approve')
  approveWork(@Request() req: any, @Param('id') id: string) {
    return this.dealsService.approveWork(id, req.user.id);
  }
}
