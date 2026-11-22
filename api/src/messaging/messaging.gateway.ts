import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

// Realtime gateway for messaging.
//
// Design: the REST API stays the source of truth (messages are saved
// to the DB). This gateway only pushes newly saved messages to the
// conversation members right away — no 5-second polling needed.
//
// Flow:
//  1. The client sends its JWT when the socket connects (auth.token).
//  2. The client sends "joinConversation" → the server checks membership
//     and puts it in the conversation's room.
//  3. When a new message is saved via REST, the controller calls
//     broadcastNewMessage() → every member of the room gets the
//     "newMessage" event.

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://pacten-mahmadv3101-cpus-projects.vercel.app',
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(Conversation)
    private conversationsRepo: Repository<Conversation>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const auth = (client.handshake.auth || {}) as Record<string, unknown>;
      const query = (client.handshake.query || {}) as Record<string, unknown>;
      const token = (auth.token || query.token) as string | undefined;
      if (!token) throw new Error('missing token');
      const payload = this.jwtService.verify(token) as { sub?: string };
      if (!payload || !payload.sub) throw new Error('invalid token');
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // socket.io cleans up its rooms itself
  }

  @SubscribeMessage('joinConversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId as string | undefined;
    if (!userId || !data || !data.conversationId) {
      return { ok: false, error: 'Unauthorized or missing conversationId' };
    }
    const conversation = await this.conversationsRepo.findOne({
      where: { id: data.conversationId },
    });
    if (
      !conversation ||
      (conversation.participant1Id !== userId &&
        conversation.participant2Id !== userId)
    ) {
      return { ok: false, error: 'Not a participant of this conversation' };
    }
    client.join(`conversation:${data.conversationId}`);
    return { ok: true };
  }

  // The controller calls this when a message is saved via REST.
  broadcastNewMessage(conversationId: string, message: Message) {
    if (!this.server) return;
    this.server
      .to(`conversation:${conversationId}`)
      .emit('newMessage', message);
  }
}
