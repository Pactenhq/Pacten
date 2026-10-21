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
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { DisputesService } from './disputes.service';
import { DisputeReason } from './dispute.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../users/user.entity';

class FileDisputeDto {
  @IsString()
  dealId: string;

  @IsEnum(DisputeReason)
  reason: DisputeReason;

  @IsString()
  @MinLength(10)
  description: string;
}

class ResolveDisputeDto {
  @IsIn(['resolved', 'rejected'])
  outcome: 'resolved' | 'rejected';

  @IsString()
  @MinLength(5)
  resolution: string;
}

@Controller('disputes')
@UseGuards(JwtAuthGuard)
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  fileDispute(@Request() req: any, @Body() dto: FileDisputeDto) {
    return this.disputesService.fileDispute(
      req.user.id,
      dto.dealId,
      dto.reason,
      dto.description,
    );
  }

  @Get('me')
  myDisputes(@Request() req: any) {
    return this.disputesService.myDisputes(req.user.id);
  }

  @Get(':id')
  getDispute(@Request() req: any, @Param('id') id: string) {
    return this.disputesService.getDispute(req.user.id, req.user.role, id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminList(@Query('status') status?: string) {
    return this.disputesService.adminList(status);
  }

  @Post('admin/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  adminResolve(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ResolveDisputeDto,
  ) {
    return this.disputesService.adminResolve(
      req.user.id,
      id,
      dto.outcome,
      dto.resolution,
    );
  }
}
