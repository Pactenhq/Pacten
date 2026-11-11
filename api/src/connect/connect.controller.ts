import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ConnectService } from './connect.service';

class OnboardingDto {
  country?: string;
}

@Controller('connect')
@UseGuards(JwtAuthGuard)
export class ConnectController {
  constructor(private readonly connect: ConnectService) {}

  /** Start (or resume) Stripe Connect Express onboarding. Caller-scoped. */
  @Post('onboarding')
  async startOnboarding(
    @Request() req: any,
    @Body() dto: OnboardingDto,
  ) {
    return this.connect.startOnboarding(req.user.id, dto?.country);
  }

  /** Onboarding state / capabilities for the caller's own account. */
  @Get('status')
  async status(@Request() req: any) {
    return this.connect.getStatus(req.user.id);
  }
}
