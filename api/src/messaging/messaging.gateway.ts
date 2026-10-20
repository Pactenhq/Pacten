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
// Design: REST API rehta hai source of truth (messages DB me save hote hain).
// Ye gateway sirf naye save-shuda messages ko conversation ke members tak
// foran pahunchata hai — har 5 second poll karne ki zaroorat nahi.
//
// Flow:
//  1. Client socket connect karte waqt apna JWT bhejta hai (auth.token).
//  2. Client "joinConversation" bhejta hai → server membership check karke
//     use conversation ke room me daal deta hai.
//  3. Jab REST se naya message save hota hai, controller
//     broadcastNewMessage() bulata hai → room ke sab members ko "newMessage"
//     event mil jata hai.

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
    // socket.io rooms khud saaf kar deta hai
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

  // Controller isko tab bulata hai jab REST se message save ho jaye.
  broadcastNewMessage(conversationId: string, message: Message) {
    if (!this.server) return;
    this.server
      .to(`conversation:${conversationId}`)
      .emit('newMessage', message);
  }
}
