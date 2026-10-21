import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsUUID } from 'class-validator';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CheckoutDto {
  @IsUUID()
  planId: string;
}

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  // Public: plan names/prices power the public /pricing page, which
  // logged-out visitors must be able to see (same pattern as the
  // public campaign list). Account-specific routes stay guarded.
  @Get('plans')
  listPlans(@Query('role') role?: string) {
    return this.subscriptionsService.listPlans(role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mySubscription(@Request() req: any) {
    return this.subscriptionsService.mySubscription(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Request() req: any, @Body() dto: CheckoutDto) {
    return this.subscriptionsService.checkout(req.user.id, dto.planId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Request() req: any) {
    return this.subscriptionsService.cancel(req.user.id);
  }
}
