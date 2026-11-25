import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IsUUID, IsString, IsOptional } from 'class-validator';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../users/user.entity';

class CheckoutDto {
  @IsUUID()
  planId: string;
}

class SyncDto {
  @IsString()
  sessionId: string;
}

class ResyncDto {
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;
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

  // Live-mode return path: settle a subscription checkout from the
  // Stripe session id carried back to /pricing/success (the webhook
  // targets the deployed backend and never reaches a local run).
  @Post('sync')
  @UseGuards(JwtAuthGuard)
  sync(@Request() req: any, @Body() dto: SyncDto) {
    return this.subscriptionsService.syncCheckout(req.user.id, dto.sessionId);
  }

  // Admin re-sync: repair a subscription row left stale when Stripe
  // webhook events never landed (period end, status, cancel flag from
  // Stripe + backfill of missing Payment rows from paid invoices).
  // Refuses demo mode. No admin UI — call it with curl (see pack
  // README). Exactly one of subscriptionId / stripeSubscriptionId is
  // required.
  @Post('admin/resync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  resync(@Body() dto: ResyncDto) {
    return this.subscriptionsService.resyncFromStripe({
      subscriptionId: dto.subscriptionId,
      stripeSubscriptionId: dto.stripeSubscriptionId,
    });
  }
}
