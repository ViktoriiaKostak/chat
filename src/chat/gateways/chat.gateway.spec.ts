import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from '../services/chat.service';
import { Socket, Server } from 'socket.io';
import { IProcessedMessage } from '../interfaces/message.interface';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let mockSocket: Socket;
  let mockServer: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            createMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);

    mockSocket = {
      id: 'test-socket-id',
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as any;

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    gateway.server = mockServer;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      const connectedClientsSpy = jest.spyOn(
        gateway['connectedClients'],
        'set',
      );

      gateway.handleConnection(mockSocket);

      expect(connectedClientsSpy).toHaveBeenCalledWith(
        mockSocket.id,
        mockSocket,
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Successfully connected to chat server',
        clientId: mockSocket.id,
      });
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      const connectedClientsSpy = jest.spyOn(
        gateway['connectedClients'],
        'delete',
      );

      gateway.handleDisconnect(mockSocket);

      expect(connectedClientsSpy).toHaveBeenCalledWith(mockSocket.id);
    });
  });

  describe('handleJoinRoom', () => {
    it('should handle joining a room', () => {
      const roomData = { room: 'test-room' };

      gateway.handleJoinRoom(roomData, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('test-room');
      expect(mockSocket.emit).toHaveBeenCalledWith('roomJoined', {
        room: 'test-room',
        message: 'Successfully joined room: test-room',
      });
    });

    it('should handle invalid room data', () => {
      const invalidData = { room: '' };

      gateway.handleJoinRoom(invalidData, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        success: false,
        message: 'Invalid room data provided',
      });
    });

    it('should handle missing room data', () => {
      const invalidData = { room: undefined } as any;

      gateway.handleJoinRoom(invalidData, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        success: false,
        message: 'Invalid room data provided',
      });
    });
  });

  describe('handleLeaveRoom', () => {
    it('should handle leaving a room', () => {
      const roomData = { room: 'test-room' };

      gateway.handleLeaveRoom(roomData, mockSocket);

      expect(mockSocket.leave).toHaveBeenCalledWith('test-room');
      expect(mockSocket.emit).toHaveBeenCalledWith('roomLeft', {
        room: 'test-room',
        message: 'Successfully left room: test-room',
      });
    });

    it('should handle missing room data', () => {
      const invalidData = { room: undefined } as any;

      gateway.handleLeaveRoom(invalidData, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        success: false,
        message: 'Invalid room data provided',
      });
    });
  });

  describe('handleSendMessage', () => {
    it('should handle message sending successfully', async () => {
      const createMessageDto = {
        content: 'Test message',
        room: 'test-room',
        userId: 'test-user',
      };

      const mockProcessedMessage: IProcessedMessage = {
        id: '1',
        userId: 'test-user',
        content: 'Test message',
        processedContent: 'Processed test message',
        room: 'test-room',
        timestamp: new Date(),
        updatedAt: new Date(),
        processingTimestamp: new Date(),
        metadata: {},
      };

      jest
        .spyOn(chatService, 'createMessage')
        .mockResolvedValue(mockProcessedMessage);

      await gateway.handleSendMessage(createMessageDto, mockSocket);

      expect(chatService.createMessage).toHaveBeenCalledWith({
        ...createMessageDto,
        userId: 'test-user',
        room: 'test-room',
      });
      expect(mockServer.to).toHaveBeenCalledWith('test-room');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', {
        success: true,
        data: mockProcessedMessage,
        message: 'New message received',
      });
    });

    it('should handle missing message content', async () => {
      const createMessageDto = {
        content: '',
        room: 'test-room',
        userId: 'test-user',
      };

      await gateway.handleSendMessage(createMessageDto, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('messageError', {
        success: false,
        message: 'Message content is required',
      });
    });

    it('should handle message sending error', async () => {
      const createMessageDto = {
        content: 'Test message',
        room: 'test-room',
        userId: 'test-user',
      };

      jest
        .spyOn(chatService, 'createMessage')
        .mockRejectedValue(new Error('Database error'));

      await gateway.handleSendMessage(createMessageDto, mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('messageError', {
        success: false,
        message: 'Database error',
      });
    });
  });

  describe('handleTyping', () => {
    it('should handle typing indicator', () => {
      const typingData = {
        room: 'test-room',
        isTyping: true,
      };

      gateway.handleTyping(typingData, mockSocket);

      expect(mockSocket.to).toHaveBeenCalledWith('test-room');
      expect(mockSocket.emit).toHaveBeenCalledWith('userTyping', {
        userId: `user_${mockSocket.id}`,
        isTyping: true,
        room: 'test-room',
      });
    });

    it('should handle invalid typing data', () => {
      const invalidData = { room: 'test-room', isTyping: undefined } as any;

      gateway.handleTyping(invalidData, mockSocket);

      expect(mockSocket.to).not.toHaveBeenCalled();
    });
  });
});
