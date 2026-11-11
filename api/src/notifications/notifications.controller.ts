import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

/**
 * Own-notifications endpoints only: every route is scoped to the
 * caller's user id server-side. Unauthenticated requests are rejected
 * by JwtAuthGuard (401); another user's rows are unreachable (404).
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('me')
  listMine(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.notifications.listForUser(
      req.user.id,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('me/unread-count')
  unreadCount(@Request() req: any) {
    return this.notifications.unreadCount(req.user.id);
  }

  // Declared before the :id route so "read-all" is never swallowed as
  // a notification id.
  @Patch('me/read-all')
  readAll(@Request() req: any) {
    return this.notifications.markAllRead(req.user.id);
  }

  @Patch('me/:id/read')
  readOne(@Request() req: any, @Param('id') id: string) {
    return this.notifications.markRead(req.user.id, id);
  }
}
