import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import {
  CreateConversationDto,
  SendMessageDto,
} from './dto/messaging.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MessagingGateway } from './messaging.gateway';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class MessagingController {
  constructor(
    private readonly messagingService: MessagingService,
    private readonly messagingGateway: MessagingGateway,
  ) {}

  @Post()
  createConversation(@Request() req: any, @Body() dto: CreateConversationDto) {
    return this.messagingService.createConversation(req.user.id, dto);
  }

  @Get()
  findMyConversations(@Request() req: any) {
    return this.messagingService.findMyConversations(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.messagingService.findOne(id, req.user.id);
  }

  @Get(':id/messages')
  getMessages(@Request() req: any, @Param('id') id: string) {
    return this.messagingService.getMessages(id, req.user.id);
  }

  @Post(':id/messages')
  async sendMessage(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ) {
    // REST source of truth hai: pehle DB me save, phir realtime broadcast
    const message = await this.messagingService.sendMessage(id, req.user.id, dto);
    this.messagingGateway.broadcastNewMessage(id, message);
    return message;
  }
}
