import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from '../services/chat.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';
import { HttpException } from '@nestjs/common';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatService = {
    createMessage: jest.fn(),
    getMessages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Test message',
        userId: 'test-user',
        room: 'general',
      };

      const mockMessage = {
        id: 'test-id',
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
        processedContent: 'Processed test message',
        processingTimestamp: new Date(),
      };

      mockChatService.createMessage.mockResolvedValue(mockMessage);

      const result = await controller.createMessage(createMessageDto);

      expect(chatService.createMessage).toHaveBeenCalledWith(createMessageDto);
      expect(result).toEqual({
        success: true,
        data: mockMessage,
        message: 'Message created successfully',
      });
    });

    it('should handle error when creating message', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Test message',
        userId: 'test-user',
        room: 'general',
      };

      const error = new Error('Database error');
      mockChatService.createMessage.mockRejectedValue(error);

      await expect(controller.createMessage(createMessageDto)).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages successfully', async () => {
      const getMessagesDto: GetMessagesDto = {
        room: 'general',
        limit: 10,
        offset: 0,
      };

      const mockMessages = [
        {
          id: '1',
          userId: 'user1',
          content: 'Message 1',
          room: 'general',
          timestamp: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user2',
          content: 'Message 2',
          room: 'general',
          timestamp: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockResult = {
        messages: mockMessages,
        total: 2,
        limit: 10,
        offset: 0,
      };

      mockChatService.getMessages.mockResolvedValue(mockResult);

      const result = await controller.getMessages(getMessagesDto);

      expect(chatService.getMessages).toHaveBeenCalledWith(getMessagesDto);
      expect(result).toEqual({
        success: true,
        data: mockResult,
        message: 'Messages retrieved successfully',
      });
    });

    it('should handle error when retrieving messages', async () => {
      const getMessagesDto: GetMessagesDto = {
        room: 'general',
        limit: 10,
        offset: 0,
      };

      const error = new Error('Database error');
      mockChatService.getMessages.mockRejectedValue(error);

      await expect(controller.getMessages(getMessagesDto)).rejects.toThrow(
        HttpException,
      );
    });

    it('should use default values when not provided', async () => {
      const getMessagesDto: GetMessagesDto = {};

      const mockResult = {
        messages: [],
        total: 0,
        limit: 20,
        offset: 0,
      };

      mockChatService.getMessages.mockResolvedValue(mockResult);

      await controller.getMessages(getMessagesDto);

      expect(chatService.getMessages).toHaveBeenCalledWith(getMessagesDto);
    });
  });
});
