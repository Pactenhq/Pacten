import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { IsDefined, IsEnum, IsInt, Max, Min } from 'class-validator';
import { AdminService } from './admin.service';
import { SettingsService } from '../settings/settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole, UserStatus } from '../users/user.entity';

class SetStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

class UpdateSettingsDto {
  @IsDefined()
  values: Record<string, number>;
}

class UpdateCommissionRuleDto {
  @IsInt()
  @Min(0)
  @Max(10000)
  rateBasisPoints: number;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('users')
  listUsers(
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('skip', new ParseIntPipe({ optional: true })) skip?: number,
  ) {
    return this.adminService.listUsers({ role, status, search, take, skip });
  }

  @Patch('users/:id/status')
  setUserStatus(@Param('id') id: string, @Body() dto: SetStatusDto) {
    return this.adminService.setUserStatus(id, dto.status);
  }

  @Get('settings')
  listSettings() {
    return this.settingsService.list();
  }

  @Patch('settings')
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(dto.values);
  }

  @Get('commission-rules')
  listCommissionRules() {
    return this.adminService.listCommissionRules();
  }

  @Patch('commission-rules/:id')
  updateCommissionRule(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionRuleDto,
  ) {
    return this.adminService.updateCommissionRule(id, dto.rateBasisPoints);
  }
}
