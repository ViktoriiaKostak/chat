import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../services/chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedClients: Map<string, Socket> = new Map();

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket): void {
    this.connectedClients.set(client.id, client);

    this.logger.log(`Client connected: ${client.id}`);

    client.emit('connected', {
      message: 'Successfully connected to chat server',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      if (!data || !data.room || typeof data.room !== 'string') {
        client.emit('error', {
          success: false,
          message: 'Invalid room data provided',
        });
        return;
      }

      const room = data.room.trim();
      if (room.length === 0 || room.length > 50) {
        client.emit('error', {
          success: false,
          message: 'Room name must be between 1 and 50 characters',
        });
        return;
      }

      client.join(room);

      this.logger.log(`Client ${client.id} joined room: ${room}`);

      client.emit('roomJoined', {
        room,
        message: `Successfully joined room: ${room}`,
      });
    } catch (error) {
      this.logger.error('Error joining room', error);
      client.emit('error', {
        success: false,
        message: 'Failed to join room',
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      if (!data || !data.room) {
        client.emit('error', {
          success: false,
          message: 'Invalid room data provided',
        });
        return;
      }

      const room = data.room.trim();
      client.leave(room);

      this.logger.log(`Client ${client.id} left room: ${room}`);

      client.emit('roomLeft', {
        room,
        message: `Successfully left room: ${room}`,
      });
    } catch (error) {
      this.logger.error('Error leaving room', error);
      client.emit('error', {
        success: false,
        message: 'Failed to leave room',
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    try {
      if (!createMessageDto || !createMessageDto.content) {
        client.emit('messageError', {
          success: false,
          message: 'Message content is required',
        });
        return;
      }

      const room = createMessageDto.room || 'general';

      const processedMessage = await this.chatService.createMessage({
        ...createMessageDto,
        userId: createMessageDto.userId || `user_${client.id}`,
        room,
      });

      this.logger.log(
        `Message sent in room ${room} by ${processedMessage.userId}`,
      );

      this.server.to(room).emit('newMessage', {
        success: true,
        data: processedMessage,
        message: 'New message received',
      });
    } catch (error) {
      this.logger.error('Failed to send message', error);

      client.emit('messageError', {
        success: false,
        message: error.message || 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { room: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ): void {
    try {
      if (!data || typeof data.isTyping !== 'boolean') {
        return;
      }

      const room = data.room || 'general';

      client.to(room).emit('userTyping', {
        userId: `user_${client.id}`,
        isTyping: data.isTyping,
        room,
      });
    } catch (error) {
      this.logger.error('Error handling typing indicator', error);
    }
  }
}
