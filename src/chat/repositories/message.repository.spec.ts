import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageRepository } from './message.repository';
import { Message } from '../entities/message.entity';

describe('MessageRepository', () => {
  let repository: MessageRepository;
  let messageRepository: Repository<Message>;

  const mockMessage = {
    id: '1',
    userId: 'user1',
    content: 'Test message',
    room: 'general',
    timestamp: new Date(),
    metadata: {},
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageRepository,
        {
          provide: getRepositoryToken(Message),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    repository = module.get<MessageRepository>(MessageRepository);
    messageRepository = module.get<Repository<Message>>(
      getRepositoryToken(Message),
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const messageData = {
        userId: 'user1',
        content: 'Test message',
        room: 'general',
      };

      jest
        .spyOn(messageRepository, 'create')
        .mockReturnValue(mockMessage as Message);
      jest
        .spyOn(messageRepository, 'save')
        .mockResolvedValue(mockMessage as Message);

      const result = await repository.create(messageData);

      expect(messageRepository.create).toHaveBeenCalledWith(messageData);
      expect(messageRepository.save).toHaveBeenCalledWith(mockMessage);
      expect(result).toEqual(mockMessage);
    });

    it('should handle database errors', async () => {
      const messageData = {
        userId: 'user1',
        content: 'Test message',
        room: 'general',
      };

      jest
        .spyOn(messageRepository, 'create')
        .mockReturnValue(mockMessage as Message);
      jest
        .spyOn(messageRepository, 'save')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.create(messageData)).rejects.toThrow(
        'Failed to save message to database',
      );
    });
  });

  describe('findWithPagination', () => {
    it('should return messages with pagination', async () => {
      const mockMessages = [mockMessage];
      const mockTotal = 1;

      jest
        .spyOn(messageRepository, 'findAndCount')
        .mockResolvedValue([mockMessages, mockTotal]);

      const result = await repository.findWithPagination('general', 10, 0);

      expect(messageRepository.findAndCount).toHaveBeenCalledWith({
        where: { room: 'general' },
        order: { timestamp: 'ASC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        messages: mockMessages,
        total: mockTotal,
      });
    });

    it('should use default values when not provided', async () => {
      const mockMessages = [mockMessage];
      const mockTotal = 1;

      jest
        .spyOn(messageRepository, 'findAndCount')
        .mockResolvedValue([mockMessages, mockTotal]);

      await repository.findWithPagination();

      expect(messageRepository.findAndCount).toHaveBeenCalledWith({
        where: { room: 'general' },
        order: { timestamp: 'ASC' },
        skip: 0,
        take: 20,
      });
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(messageRepository, 'findAndCount')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.findWithPagination()).rejects.toThrow(
        'Failed to retrieve messages from database',
      );
    });
  });

  describe('findById', () => {
    it('should find message by id', async () => {
      jest
        .spyOn(messageRepository, 'findOne')
        .mockResolvedValue(mockMessage as Message);

      const result = await repository.findById('1');

      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockMessage);
    });

    it('should return null when message not found', async () => {
      jest.spyOn(messageRepository, 'findOne').mockResolvedValue(null);

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      jest
        .spyOn(messageRepository, 'findOne')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.findById('1')).rejects.toThrow(
        'Failed to retrieve message from database',
      );
    });
  });

  describe('update', () => {
    it('should update message', async () => {
      const updateData = { content: 'Updated message' };

      jest
        .spyOn(messageRepository, 'update')
        .mockResolvedValue({ affected: 1 } as any);
      jest
        .spyOn(messageRepository, 'findOne')
        .mockResolvedValue(mockMessage as Message);

      const result = await repository.update('1', updateData);

      expect(messageRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(messageRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockMessage);
    });

    it('should handle database errors', async () => {
      const updateData = { content: 'Updated message' };

      jest
        .spyOn(messageRepository, 'update')
        .mockRejectedValue(new Error('Database error'));

      await expect(repository.update('1', updateData)).rejects.toThrow(
        'Failed to update message in database',
      );
    });
  });
});
