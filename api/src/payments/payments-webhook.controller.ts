import {
  Controller,
  Post,
  Req,
  Headers,
  HttpCode,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';

/**
 * Stripe webhook — intentionally NOT behind JwtAuthGuard.
 * Authenticity comes from the Stripe signature, not a user token.
 * main.ts mounts express.raw() on this path so the signature verifies.
 */
@Controller('payments')
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature?: string,
  ) {
    const rawBody = req.body as Buffer;
    return this.paymentsService.handleWebhook(rawBody, signature);
  }
}
