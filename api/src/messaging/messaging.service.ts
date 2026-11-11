import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { CreateConversationDto, SendMessageDto } from './dto/messaging.dto';
import { PlanLimitsService } from '../common/plan-limits/plan-limits.service';
import { EmailsService } from '../emails/emails.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class MessagingService {
  // Rate-limit send log: userId -> recent send timestamps (ms).
  private sendLog = new Map<string, number[]>();

  constructor(
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepo: Repository<Message>,
    private planLimits: PlanLimitsService,
    private emails: EmailsService,
    private notifications: NotificationsService,
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
          senderId: Not(userId),
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
    markRead = true,
  ): Promise<Message[]> {
    await this.findOne(conversationId, userId);

    const messages = await this.messagesRepo.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    // Mark messages as read — only when the caller actually opened the
    // thread (markRead=false is the list-page preview prefetch: merely
    // visiting /dashboard/messages must not clear the unread badge), and
    // only the OTHER party's messages (fetching the thread must not claim
    // the other side read messages you sent).
    if (markRead) {
      await this.messagesRepo.update(
        { conversationId, isRead: false, senderId: Not(userId) },
        { isRead: true },
      );
    }

    // Frontend har message ko isMine se pehchanta hai (apna = right,
    // doosre ka = left). Ye field pehle missing tha — is liye saare
    // messages "them" ban kar left par render ho rahe thay.
    for (const m of messages) {
      (m as any).isMine = m.senderId === userId;
    }

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

    // Free-plan cap: new conversations per month for free users;
    // replies inside an existing conversation are unlimited.
    await this.planLimits.assertCanSendMessage(userId, conversationId);

    const message = this.messagesRepo.create({
      conversationId,
      senderId: userId,
      content: dto.content,
    });

    const saved = await this.messagesRepo.save(message);

    // Update conversation timestamp
    conversation.updatedAt = new Date();
    await this.conversationsRepo.save(conversation);

    // Notify the other participant by email (transactional email).
    // One email per message; the in-app realtime feed stays the
    // primary channel.
    try {
      const recipient =
        conversation.participant1Id === userId
          ? conversation.participant2
          : conversation.participant1;
      const sender =
        conversation.participant1Id === userId
          ? conversation.participant1
          : conversation.participant2;
      if (recipient?.email) {
        const senderName =
          [sender?.firstName, sender?.lastName]
            .filter(Boolean)
            .join(' ') ||
          sender?.email ||
          'Someone';
        await this.emails.sendNewMessage(
          recipient.email,
          senderName,
          dto.content,
        );
      }
    } catch {
      // Email is best-effort.
    }

    // In-app notification for the other participant (same trigger as
    // the email). The realtime feed stays the primary channel; the
    // notification is the persistent record the bell shows.
    const recipientUser =
      conversation.participant1Id === userId
        ? conversation.participant2
        : conversation.participant1;
    const senderUser =
      conversation.participant1Id === userId
        ? conversation.participant1
        : conversation.participant2;
    if (recipientUser?.id && recipientUser.id !== userId) {
      const senderName =
        [senderUser?.firstName, senderUser?.lastName]
          .filter(Boolean)
          .join(' ') ||
        senderUser?.email ||
        'Someone';
      const excerpt =
        dto.content.length > 120
          ? `${dto.content.slice(0, 120)}…`
          : dto.content;
      await this.notifications.create({
        userId: recipientUser.id,
        type: NotificationType.NEW_MESSAGE,
        title: `New message from ${senderName}`,
        body: excerpt,
        link: `/dashboard/messages/${conversationId}`,
        relatedId: saved.id,
      });
    }

    return saved;
  }
}
