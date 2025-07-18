import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { IMessage } from '../interfaces/message.interface';

@Injectable()
export class MessageRepository {
  private readonly logger = new Logger(MessageRepository.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async create(messageData: Partial<IMessage>): Promise<Message> {
    try {
      const message = this.messageRepository.create(messageData);
      return await this.messageRepository.save(message);
    } catch (error) {
      this.logger.error('Failed to create message', error);
      throw new Error('Failed to save message to database');
    }
  }

  async findWithPagination(
    room: string = 'general',
    limit: number = 20,
    offset: number = 0,
  ): Promise<{ messages: Message[]; total: number }> {
    try {
      const [messages, total] = await this.messageRepository.findAndCount({
        where: { room },
        order: { timestamp: 'ASC' },
        skip: offset,
        take: limit,
      });

      return { messages, total };
    } catch (error) {
      this.logger.error('Failed to fetch messages', error);
      throw new Error('Failed to retrieve messages from database');
    }
  }

  async findById(id: string): Promise<Message | null> {
    try {
      return await this.messageRepository.findOne({ where: { id } });
    } catch (error) {
      this.logger.error('Failed to find message by id', error);
      throw new Error('Failed to retrieve message from database');
    }
  }

  async update(
    id: string,
    updateData: Partial<IMessage>,
  ): Promise<Message | null> {
    try {
      await this.messageRepository.update(id, updateData);
      return await this.findById(id);
    } catch (error) {
      this.logger.error('Failed to update message', error);
      throw new Error('Failed to update message in database');
    }
  }
}
