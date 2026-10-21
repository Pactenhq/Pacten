import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  Min,
} from 'class-validator';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../users/user.entity';

class RequestPayoutDto {
  @IsInt()
  @Min(1)
  amountCents: number;
}

class DecidePayoutDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

class UpsertMilestoneDto {
  @IsInt()
  @Min(1)
  referralsRequired: number;

  @IsInt()
  @Min(0)
  rewardCents: number;

  @IsString()
  rewardLabel: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  // Public: track a click on a referral link, then the client redirects.
  @Get('r/:code')
  trackClick(@Param('code') code: string) {
    return this.referralsService.trackClick(code);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  dashboard(@Request() req: any) {
    return this.referralsService.getDashboard(req.user.id);
  }

  @Post('payouts')
  @UseGuards(JwtAuthGuard)
  requestPayout(@Request() req: any, @Body() dto: RequestPayoutDto) {
    return this.referralsService.requestPayout(req.user.id, dto.amountCents);
  }

  @Get('payouts/me')
  @UseGuards(JwtAuthGuard)
  myPayouts(@Request() req: any) {
    return this.referralsService.myPayouts(req.user.id);
  }

  // ---- Admin (manual cash-payout approval, per Sania) ----

  @Get('admin/payouts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminPayouts(@Query('status') status?: string) {
    return this.referralsService.adminListPayouts(status);
  }

  @Post('admin/payouts/:id/decide')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  decidePayout(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: DecidePayoutDto,
  ) {
    return this.referralsService.adminDecidePayout(
      id,
      req.user.id,
      dto.approved,
      dto.notes,
    );
  }

  @Get('admin/earnings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminEarnings(@Query('userId') userId?: string) {
    return this.referralsService.adminListEarnings(userId);
  }

  @Post('admin/earnings/:id/hold')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminHoldEarning(@Param('id') id: string) {
    return this.referralsService.adminHoldEarning(id);
  }

  @Post('admin/earnings/:id/reverse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminReverseEarning(@Param('id') id: string) {
    return this.referralsService.adminReverseEarning(id);
  }

  @Get('admin/milestones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminMilestones() {
    return this.referralsService.adminListMilestones();
  }

  @Post('admin/milestones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  upsertMilestone(@Body() dto: UpsertMilestoneDto) {
    return this.referralsService.adminUpsertMilestone(
      dto.referralsRequired,
      dto.rewardCents,
      dto.rewardLabel,
      dto.active ?? true,
    );
  }
}
