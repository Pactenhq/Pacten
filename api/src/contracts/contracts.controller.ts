import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  AcceptContractDto,
  GenerateContractDto,
} from './dto/contracts.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post('from-deal/:dealId')
  generateFromDeal(
    @Request() req: any,
    @Param('dealId') dealId: string,
    @Body() dto: GenerateContractDto,
  ) {
    return this.contractsService.generateFromDeal(
      dealId,
      req.user.id,
      dto,
    );
  }

  // Declared BEFORE @Get(':id') so 'from-deal/:dealId/prefill' is not
  // captured as a contract id.
  @Get('from-deal/:dealId/prefill')
  prefillFromDeal(@Request() req: any, @Param('dealId') dealId: string) {
    return this.contractsService.prefillFromDeal(dealId, req.user.id);
  }

  @Get()
  findMine(@Request() req: any) {
    return this.contractsService.findMine(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.contractsService.findOne(id, req.user.id);
  }

  @Post(':id/accept')
  accept(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: AcceptContractDto,
  ) {
    return this.contractsService.accept(id, req.user.id, dto);
  }

  @Post(':id/decline')
  decline(@Request() req: any, @Param('id') id: string) {
    return this.contractsService.decline(id, req.user.id);
  }
}
