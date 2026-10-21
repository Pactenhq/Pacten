import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailsService } from './emails.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EmailsService],
  exports: [EmailsService],
})
export class EmailsModule {}
