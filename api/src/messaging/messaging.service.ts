import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { CreateConversationDto, SendMessageDto } from './dto/messaging.dto';

@Injectable()
export class MessagingService {
  // Rate-limit send log: userId -> recent send timestamps (ms).
  private sendLog = new Map<string, number[]>();

  constructor(
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
  ) {}

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    // Check if conversation already exists between these two users
    const existing = await this.conversationsRepo.findOne({
      where: [
        { participant1Id: userId, participant2Id: dto.otherUserId },
        { participant1Id: dto.otherUserId, participant2Id: userId },
      ],
    });

    if (existing) {
      return existing;
    }

    const conversation = this.conversationsRepo.create({
      participant1Id: userId,
      participant2Id: dto.otherUserId,
      subject: dto.subject,
      campaignId: dto.campaignId,
      applicationId: dto.applicationId,
    });

    return this.conversationsRepo.save(conversation);
  }

  async findMyConversations(userId: string): Promise<Conversation[]> {
    const conversations = await this.conversationsRepo.find({
      where: [{ participant1Id: userId }, { participant2Id: userId }],
      order: { updatedAt: 'DESC' },
    });

    // Attach last message and unread count
    for (const conv of conversations) {
      const lastMessage = await this.messagesRepo.findOne({
        where: { conversationId: conv.id },
        order: { createdAt: 'DESC' },
      });
      const unreadCount = await this.messagesRepo.count({
        where: {
          conversationId: conv.id,
          isRead: false,
        },
      });
      (conv as any).lastMessage = lastMessage;
      (conv as any).unreadCount = unreadCount;
    }

    return conversations;
  }

  async findOne(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    return conversation;
  }

  async getMessages(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    await this.findOne(conversationId, userId);

    const messages = await this.messagesRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Frontend har message ko isMine se pehchanta hai (apna = right,
    // doosre ka = left). Ye field pehle missing tha — is liye saare
    // messages "them" ban kar left par render ho rahe thay.
    for (const m of messages) {
      (m as any).isMine = m.senderId === userId;
    }

    // Mark messages as read
    await this.messagesRepo.update(
      { conversationId, isRead: false },
      { isRead: true },
    );

    return messages;
  }

  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    // PRD §10 reliability: messaging rate limit — max 30 messages per
    // user per rolling 60 seconds (in-memory, per API instance).
    const now = Date.now();
    const windowStart = now - 60_000;
    const recent = (this.sendLog.get(userId) ?? []).filter(
      (t) => t > windowStart,
    );
    if (recent.length >= 30) {
      throw new HttpException(
        'Too many messages — please slow down',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    recent.push(now);
    this.sendLog.set(userId, recent);

    const conversation = await this.findOne(conversationId, userId);

    const message = this.messagesRepo.create({
      conversationId,
      senderId: userId,
      content: dto.content,
    });

    const saved = await this.messagesRepo.save(message);

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await this.conversationsRepo.save(conversation);

    return saved;
  }
}
