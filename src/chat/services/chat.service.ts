import { Injectable, Logger } from '@nestjs/common';
import { MessageRepository } from '../repositories/message.repository';
import { AwsLambdaService } from './aws-lambda.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { GetMessagesDto } from '../dto/get-messages.dto';
import { IMessage, IProcessedMessage } from '../interfaces/message.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly awsLambdaService: AwsLambdaService,
  ) {}

  async createMessage(
    createMessageDto: CreateMessageDto,
  ): Promise<IProcessedMessage> {
    try {
      if (
        !createMessageDto.content ||
        createMessageDto.content.trim().length === 0
      ) {
        throw new Error('Message content cannot be empty');
      }

      if (createMessageDto.content.length > 1000) {
        throw new Error('Message content is too long (max 1000 characters)');
      }

      const messageData: Partial<IMessage> = {
        id: uuidv4(),
        userId: createMessageDto.userId || 'anonymous',
        content: createMessageDto.content.trim(),
        room: createMessageDto.room || 'general',
        timestamp: new Date(),
      };

      const savedMessage = await this.messageRepository.create(messageData);

      let processedMessage: IProcessedMessage;
      try {
        processedMessage =
          await this.awsLambdaService.processMessage(savedMessage);
      } catch (lambdaError) {
        this.logger.warn(
          'Lambda processing failed, using original message',
          lambdaError,
        );
        processedMessage = {
          ...savedMessage,
          processedContent: savedMessage.content,
          processingTimestamp: new Date(),
          metadata: {
            ...savedMessage.metadata,
            lambdaProcessing: {
              success: false,
              error: lambdaError.message,
            },
          },
        };
      }

      const updatedMessage = await this.messageRepository.update(
        savedMessage.id,
        { metadata: processedMessage.metadata },
      );

      return {
        ...processedMessage,
        id: updatedMessage.id,
        timestamp: updatedMessage.timestamp,
        updatedAt: updatedMessage.updatedAt,
      };
    } catch (error) {
      this.logger.error('Failed to create message', error);
      throw error;
    }
  }

  async getMessages(getMessagesDto: GetMessagesDto): Promise<{
    messages: IMessage[];
    total: number;
    limit: number;
    offset: number;
  }> {
    try {
      const { room = 'general', limit = 20, offset = 0 } = getMessagesDto;

      if (limit < 1 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }

      if (offset < 0) {
        throw new Error('Offset must be non-negative');
      }

      const result = await this.messageRepository.findWithPagination(
        room,
        limit,
        offset,
      );

      return {
        messages: result.messages,
        total: result.total,
        limit,
        offset,
      };
    } catch (error) {
      this.logger.error('Failed to get messages', error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<IMessage | null> {
    try {
      if (!id || id.trim().length === 0) {
        throw new Error('Message ID is required');
      }

      return await this.messageRepository.findById(id);
    } catch (error) {
      this.logger.error('Failed to get message by id', error);
      throw error;
    }
  }
}
