import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DealsService } from './deals.service';

/**
 * TOS §6.8: daily sweep that auto-completes deals whose submitted work
 * has gone 14 working days without a brand response.
 *
 * Schedule from env DEAL_AUTO_COMPLETE_CRON, default daily 02:00
 * server time. The expression is read from process.env at decoration
 * time: on the deployed host (Railway Variables) it is real process
 * env, so it is picked up; a value that lives only in a local .env
 * file is NOT seen here (ConfigModule loads .env after decorators
 * evaluate) — export it into the shell for local runs if a custom
 * schedule is needed. The default covers the normal case either way.
 */
@Injectable()
export class DealsAutoCompleteService {
  private readonly logger = new Logger(DealsAutoCompleteService.name);

  constructor(private readonly dealsService: DealsService) {}

  @Cron(process.env.DEAL_AUTO_COMPLETE_CRON || '0 2 * * *')
  async handleAutoComplete(): Promise<void> {
    try {
      this.logger.log('Running TOS §6.8 deal auto-completion sweep');
      await this.dealsService.autoCompleteStaleDeals();
      this.logger.log('TOS §6.8 deal auto-completion sweep finished');
    } catch (e: any) {
      // A sweep failure must never kill the scheduler.
      this.logger.error(
        `TOS §6.8 deal auto-completion sweep failed — ${e?.message ?? e}`,
      );
    }
  }
}
