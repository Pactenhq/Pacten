import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PayoutsService } from './payouts.service';
import { CreateUpfrontPaymentDto } from './dto/payments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly payoutsService: PayoutsService,
  ) {}

  @Post('upfront/:dealId')
  createUpfront(
    @Request() req: any,
    @Param('dealId') dealId: string,
    @Body() dto: CreateUpfrontPaymentDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.paymentsService.createUpfrontPayment(
      dealId,
      req.user.id,
      dto,
      idempotencyKey,
    );
  }

  @Post(':id/demo-confirm')
  demoConfirm(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.confirmDemoPayment(id, req.user.id);
  }

  @Get('my')
  myPayments(@Request() req: any) {
    return this.paymentsService.myPayments(req.user.id);
  }

  @Get('commission-rules')
  commissionRules() {
    return this.paymentsService.listRules();
  }

  @Get(':id')
  getPayment(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.getPayment(id, req.user.id);
  }

  @Get(':id/commission')
  getCommission(@Request() req: any, @Param('id') id: string) {
    return this.paymentsService.getCommissionForPayment(id, req.user.id);
  }

  @Get('payouts/my')
  myPayouts(@Request() req: any) {
    return this.payoutsService.myPayouts(req.user.id);
  }

  @Get('payouts/by-deal/:dealId')
  payoutForDeal(@Request() req: any, @Param('dealId') dealId: string) {
    return this.payoutsService.getPayoutForDeal(dealId, req.user.id);
  }
}
