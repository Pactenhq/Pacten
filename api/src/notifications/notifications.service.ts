import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './notification.entity';

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string | null;
  relatedId?: string | null;
}

/**
 * In-app notifications (PRD §7 "Notifications" module; Figma bell /
 * notifications screens). Created at the SAME trigger points where the
 * transactional emails fire — next to the email call, never instead of
 * it. Creation is best-effort and can never break the calling flow:
 * create() swallows its own errors and logs them.
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
  ) {}

  async create(
    input: CreateNotificationInput,
  ): Promise<Notification | null> {
    try {
      if (!input.userId) return null;
      return await this.notificationsRepo.save(
        this.notificationsRepo.create({
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.body,
          link: input.link ?? null,
          relatedId: input.relatedId ?? null,
        }),
      );
    } catch (e: any) {
      // A failed notification must never break payments, contracts, etc.
      this.logger.warn(`notification create failed: ${e?.message}`);
      return null;
    }
  }

  async listForUser(userId: string, limit = 20, offset = 0) {
    const take = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = Math.max(Number(offset) || 0, 0);
    const [items, total] = await this.notificationsRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    const unreadCount = await this.notificationsRepo.count({
      where: { userId, isRead: false },
    });
    return { items, total, unreadCount };
  }

  async unreadCount(userId: string) {
    const unreadCount = await this.notificationsRepo.count({
      where: { userId, isRead: false },
    });
    return { unreadCount };
  }

  async markRead(userId: string, id: string): Promise<Notification> {
    const notification = await this.notificationsRepo.findOne({
      where: { id, userId },
    });
    // Unknown id OR another user's row: same 404, no leak either way.
    if (!notification) throw new NotFoundException('Notification not found');
    if (!notification.isRead) {
      notification.isRead = true;
      await this.notificationsRepo.save(notification);
    }
    return notification;
  }

  async markAllRead(userId: string) {
    const result = await this.notificationsRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { updated: result.affected ?? 0, unreadCount: 0 };
  }
}
