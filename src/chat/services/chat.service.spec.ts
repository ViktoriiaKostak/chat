import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { MessageRepository } from '../repositories/message.repository';
import { AwsLambdaService } from './aws-lambda.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';

describe('ChatService', () => {
  let service: ChatService;
  let messageRepository: MessageRepository;
  let awsLambdaService: AwsLambdaService;

  const mockMessageRepository = {
    create: jest.fn(),
    findWithPagination: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockAwsLambdaService = {
    processMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: MessageRepository,
          useValue: mockMessageRepository,
        },
        {
          provide: AwsLambdaService,
          useValue: mockAwsLambdaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageRepository = module.get<MessageRepository>(MessageRepository);
    awsLambdaService = module.get<AwsLambdaService>(AwsLambdaService);
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

      const mockSavedMessage = {
        id: 'test-id',
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      const mockProcessedMessage = {
        ...mockSavedMessage,
        processedContent: 'Processed test message',
        processingTimestamp: new Date(),
        metadata: {
          lambdaProcessing: {
            success: true,
            processingTime: 100,
            sanitized: true,
          },
        },
      };

      const mockUpdatedMessage = {
        ...mockSavedMessage,
        metadata: mockProcessedMessage.metadata,
      };

      mockMessageRepository.create.mockResolvedValue(mockSavedMessage);
      mockAwsLambdaService.processMessage.mockResolvedValue(
        mockProcessedMessage,
      );
      mockMessageRepository.update.mockResolvedValue(mockUpdatedMessage);

      const result = await service.createMessage(createMessageDto);

      expect(messageRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: expect.any(Date),
      });

      expect(awsLambdaService.processMessage).toHaveBeenCalledWith(
        mockSavedMessage,
      );
      expect(messageRepository.update).toHaveBeenCalledWith('test-id', {
        metadata: mockProcessedMessage.metadata,
      });

      expect(result).toEqual({
        ...mockProcessedMessage,
        id: mockUpdatedMessage.id,
        timestamp: mockUpdatedMessage.timestamp,
        updatedAt: mockUpdatedMessage.updatedAt,
      });
    });

    it('should use default values when not provided', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Test message',
      };

      const mockSavedMessage = {
        id: 'test-id',
        userId: 'anonymous',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      mockMessageRepository.create.mockResolvedValue(mockSavedMessage);
      mockAwsLambdaService.processMessage.mockResolvedValue(mockSavedMessage);
      mockMessageRepository.update.mockResolvedValue(mockSavedMessage);

      await service.createMessage(createMessageDto);

      expect(messageRepository.create).toHaveBeenCalledWith({
        id: expect.any(String),
        userId: 'anonymous',
        content: 'Test message',
        room: 'general',
        timestamp: expect.any(Date),
      });
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages with pagination', async () => {
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
      };

      mockMessageRepository.findWithPagination.mockResolvedValue(mockResult);

      const result = await service.getMessages(getMessagesDto);

      expect(messageRepository.findWithPagination).toHaveBeenCalledWith(
        'general',
        10,
        0,
      );

      expect(result).toEqual({
        messages: mockMessages,
        total: 2,
        limit: 10,
        offset: 0,
      });
    });

    it('should use default values when not provided', async () => {
      const getMessagesDto: GetMessagesDto = {};

      const mockResult = {
        messages: [],
        total: 0,
      };

      mockMessageRepository.findWithPagination.mockResolvedValue(mockResult);

      await service.getMessages(getMessagesDto);

      expect(messageRepository.findWithPagination).toHaveBeenCalledWith(
        'general',
        20,
        0,
      );
    });
  });

  describe('getMessageById', () => {
    it('should retrieve a message by id', async () => {
      const messageId = 'test-id';
      const mockMessage = {
        id: messageId,
        userId: 'test-user',
        content: 'Test message',
        room: 'general',
        timestamp: new Date(),
        updatedAt: new Date(),
      };

      mockMessageRepository.findById.mockResolvedValue(mockMessage);

      const result = await service.getMessageById(messageId);

      expect(messageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockMessage);
    });

    it('should return null when message not found', async () => {
      const messageId = 'non-existent-id';

      mockMessageRepository.findById.mockResolvedValue(null);

      const result = await service.getMessageById(messageId);

      expect(messageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toBeNull();
    });
  });
});
